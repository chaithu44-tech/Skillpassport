import unittest
import uuid
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings

class TestAdminSecurity(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        
        # 1. Create a student
        self.student_email = f"student_sec_{uuid.uuid4().hex[:8]}@test.com"
        reg_s = self.client.post("/api/v1/auth/register-student", json={
            "full_name": "Student Sec",
            "email": self.student_email,
            "password": "Password123!"
        })
        self.assertEqual(reg_s.status_code, 200, reg_s.text)
        self.student_token = reg_s.json()["access_token"]
        
        # 2. Create a recruiter
        self.recruiter_email = f"recruiter_sec_{uuid.uuid4().hex[:8]}@company.com"
        reg_r = self.client.post("/api/v1/auth/register-recruiter", json={
            "full_name": "Recruiter Sec",
            "official_email": self.recruiter_email,
            "password": "Password123!",
            "company_name": "Sec Inc"
        })
        self.assertEqual(reg_r.status_code, 200, reg_r.text)
        self.recruiter_token = reg_r.json()["access_token"]

        # 3. Authenticate website owner
        owner_auth = self.client.post("/api/v1/auth/owner-bootstrap", json={
            "email": settings.OWNER_EMAIL,
            "bootstrap_secret": settings.OWNER_BOOTSTRAP_SECRET,
            "password": "OwnerSecurePassword2026!"
        })
        self.assertEqual(owner_auth.status_code, 200, owner_auth.text)
        self.owner_token = owner_auth.json()["access_token"]

    def test_unauthenticated_blocked(self):
        resp = self.client.get("/api/v1/admin/stats")
        self.assertEqual(resp.status_code, 401)

    def test_student_forbidden_from_admin(self):
        resp = self.client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {self.student_token}"})
        self.assertEqual(resp.status_code, 403)
        self.assertIn("Exclusive Super Admin privileges required", resp.json()["detail"])

    def test_recruiter_forbidden_from_admin(self):
        resp = self.client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {self.recruiter_token}"})
        self.assertEqual(resp.status_code, 403)
        self.assertIn("Exclusive Super Admin privileges required", resp.json()["detail"])

    def test_owner_access_granted_with_real_metrics(self):
        resp = self.client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {self.owner_token}"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("metrics", data)
        self.assertIn("system_health", data)
        self.assertGreaterEqual(data["metrics"]["total_students"], 1)
        self.assertGreaterEqual(data["metrics"]["total_recruiters"], 1)
        self.assertEqual(data["system_health"]["status"], "Operational")

if __name__ == "__main__":
    unittest.main()
