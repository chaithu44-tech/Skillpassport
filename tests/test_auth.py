import unittest
import uuid
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings

class TestAuthentication(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_student_registration_and_login(self):
        unique_email = f"student_{uuid.uuid4().hex[:8]}@university.edu"
        # 1. Register Student
        reg_payload = {
            "full_name": "Alex Mercer",
            "email": unique_email,
            "password": "Password123!",
            "college": "Stanford University",
            "course_branch": "Computer Science",
            "graduation_year": 2026
        }
        resp = self.client.post("/api/v1/auth/register-student", json=reg_payload)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["role"], "student")
        self.assertEqual(data["full_name"], "Alex Mercer")

        # 2. Login Student
        login_payload = {
            "email": unique_email,
            "password": "Password123!"
        }
        login_resp = self.client.post("/api/v1/auth/login", json=login_payload)
        self.assertEqual(login_resp.status_code, 200)
        login_data = login_resp.json()
        self.assertIn("access_token", login_data)

    def test_recruiter_registration(self):
        recruiter_email = f"recruiter_{uuid.uuid4().hex[:8]}@techcorp.com"
        reg_payload = {
            "full_name": "Sarah Connor",
            "official_email": recruiter_email,
            "password": "RecruiterPass123!",
            "company_name": "Cyberdyne Systems",
            "company_website": "https://cyberdyne.ai",
            "designation": "Head of Technical Talent"
        }
        resp = self.client.post("/api/v1/auth/register-recruiter", json=reg_payload)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertEqual(data["role"], "recruiter")

    def test_invalid_credentials_rejected(self):
        login_payload = {
            "email": "nonexistent@user.com",
            "password": "WrongPassword!"
        }
        resp = self.client.post("/api/v1/auth/login", json=login_payload)
        self.assertEqual(resp.status_code, 401)

    def test_owner_bootstrap(self):
        payload = {
            "email": settings.OWNER_EMAIL,
            "bootstrap_secret": settings.OWNER_BOOTSTRAP_SECRET,
            "password": "NewOwnerPassword2026!"
        }
        resp = self.client.post("/api/v1/auth/owner-bootstrap", json=payload)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertEqual(data["role"], "admin")

if __name__ == "__main__":
    unittest.main()
