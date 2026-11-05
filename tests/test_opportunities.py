import unittest
import uuid
import datetime
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings

class TestOpportunitiesAndHiring(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        
        # 1. Register Student
        self.student_email = f"applicant_{uuid.uuid4().hex[:8]}@test.com"
        reg_s = self.client.post("/api/v1/auth/register-student", json={
            "full_name": "Liam Vance",
            "email": self.student_email,
            "password": "Password123!",
            "college": "Georgia Tech"
        })
        self.assertEqual(reg_s.status_code, 200, reg_s.text)
        self.student_token = reg_s.json()["access_token"]
        self.student_headers = {"Authorization": f"Bearer {self.student_token}"}

        # 2. Register Recruiter
        self.recruiter_email = f"hiring_mgr_{uuid.uuid4().hex[:8]}@quantum.io"
        reg_r = self.client.post("/api/v1/auth/register-recruiter", json={
            "full_name": "Elena Rostova",
            "official_email": self.recruiter_email,
            "password": "Password123!",
            "company_name": "Quantum AI Labs"
        })
        self.assertEqual(reg_r.status_code, 200, reg_r.text)
        self.recruiter_token = reg_r.json()["access_token"]
        self.recruiter_headers = {"Authorization": f"Bearer {self.recruiter_token}"}
        
        # 3. Authenticate Owner to verify recruiter
        owner_auth = self.client.post("/api/v1/auth/owner-bootstrap", json={
            "email": settings.OWNER_EMAIL,
            "bootstrap_secret": settings.OWNER_BOOTSTRAP_SECRET,
            "password": "OwnerSecurePassword2026!"
        })
        self.assertEqual(owner_auth.status_code, 200, owner_auth.text)
        owner_token = owner_auth.json()["access_token"]
        
        # Verify the recruiter
        recruiter_user_id = reg_r.json()["user_id"]
        self.client.patch(
            f"/api/v1/admin/users/{recruiter_user_id}/status",
            json={"is_verified": True},
            headers={"Authorization": f"Bearer {owner_token}"}
        )

    def test_opportunity_flow_apply_and_interview(self):
        # Recruiter posts a verified job opening
        opp_payload = {
            "title": f"ML Research Associate {uuid.uuid4().hex[:4]}",
            "description": "Develop automated deep learning evaluation pipelines with PyTorch and FastAPI.",
            "opportunity_type": "internship",
            "work_mode": "remote",
            "location": "Remote",
            "stipend_or_salary": "$2,200/month",
            "required_skills": ["Python", "PyTorch", "Git"]
        }
        create_resp = self.client.post("/api/v1/recruiter/opportunities", json=opp_payload, headers=self.recruiter_headers)
        self.assertEqual(create_resp.status_code, 200, create_resp.text)
        opp_id = create_resp.json()["opportunity_id"]

        # Student applies to opportunity
        apply_resp = self.client.post(
            f"/api/v1/opportunities/{opp_id}/apply",
            json={"notes": "Eager to contribute with PyTorch and Python experience."},
            headers=self.student_headers
        )
        self.assertEqual(apply_resp.status_code, 200, apply_resp.text)
        app_id = apply_resp.json()["application_id"]

        # Recruiter views applications
        rec_apps_resp = self.client.get("/api/v1/recruiter/applications", headers=self.recruiter_headers)
        self.assertEqual(rec_apps_resp.status_code, 200)
        apps_list = rec_apps_resp.json()
        self.assertTrue(any(a["application_id"] == app_id for a in apps_list))

        # Recruiter shortlists candidate
        status_resp = self.client.patch(
            f"/api/v1/recruiter/applications/{app_id}/status",
            json={"status": "shortlisted", "notes": "Strong background matches."},
            headers=self.recruiter_headers
        )
        self.assertEqual(status_resp.status_code, 200)

        # Recruiter schedules interview
        interview_time = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=2)).isoformat()
        interview_resp = self.client.post(
            "/api/v1/recruiter/interviews",
            json={
                "application_id": app_id,
                "scheduled_time": interview_time,
                "duration_minutes": 45,
                "meeting_link": "https://meet.google.com/xyz-skill-passport",
                "interview_type": "technical"
            },
            headers=self.recruiter_headers
        )
        self.assertEqual(interview_resp.status_code, 200)

        # Student checks notifications
        notif_resp = self.client.get("/api/v1/notifications", headers=self.student_headers)
        self.assertEqual(notif_resp.status_code, 200)
        notifs = notif_resp.json()
        self.assertTrue(any("Interview Scheduled" in n["title"] for n in notifs))

if __name__ == "__main__":
    unittest.main()
