import io
import unittest
import uuid
import pymupdf
from fastapi.testclient import TestClient
from backend.main import app

class TestCareerEngine(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.email = f"career_{uuid.uuid4().hex[:8]}@test.com"
        reg = self.client.post("/api/v1/auth/register-student", json={
            "full_name": "Maya Lin",
            "email": self.email,
            "password": "Password123!",
            "college": "Berkeley",
            "course_branch": "Data Science",
            "graduation_year": 2026
        })
        self.assertEqual(reg.status_code, 200, reg.text)
        self.token = reg.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

        # Upload a resume with known skills: Python, Machine Learning, SQL
        doc = pymupdf.open()
        page = doc.new_page()
        page.insert_text((50, 72), "Maya Lin\nBerkeley B.S. Data Science\nSkills: Python, SQL, Machine Learning, Scikit-Learn, Git\nProjects: Predictive Modeling with Scikit-Learn", fontsize=11)
        pdf_bytes = doc.tobytes()
        doc.close()
        files = {"file": ("Maya_Resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        self.client.post("/api/v1/student/upload-resume", files=files, headers=self.headers)

    def test_role_selection_and_gap_analysis(self):
        # 1. Get career roles
        roles_resp = self.client.get("/api/v1/student/career-roles", headers=self.headers)
        self.assertEqual(roles_resp.status_code, 200)
        roles = roles_resp.json()
        ai_role = next(r for r in roles if r["title"] == "AI Engineer")

        # 2. Select AI Engineer role
        sel_payload = {
            "role_id": ai_role["id"],
            "experience_level": "Beginner",
            "career_goal": "Internship",
            "preparation_timeline": "3 months"
        }
        sel_resp = self.client.post("/api/v1/student/select-role", json=sel_payload, headers=self.headers)
        self.assertEqual(sel_resp.status_code, 200, sel_resp.text)
        sel_data = sel_resp.json()

        # 3. Verify compatibility score & gap detection
        compat = sel_data["compatibility"]
        self.assertEqual(compat["role_title"], "AI Engineer")
        self.assertGreater(compat["compatibility_score"], 0)
        self.assertIn("Python", compat["matched_skills"])
        self.assertIn("Machine Learning", compat["matched_skills"])
        self.assertTrue(any("Deep Learning" in m or "PyTorch" in m or "Docker" in m for m in compat["missing_skills"]))
        self.assertIn(compat["career_readiness"], ["Beginner", "Developing", "Nearly Ready", "Strong Match"])

    def test_interactive_roadmap_progress(self):
        roles_resp = self.client.get("/api/v1/student/career-roles", headers=self.headers)
        role_id = roles_resp.json()[0]["id"]
        self.client.post("/api/v1/student/select-role", json={"role_id": role_id}, headers=self.headers)

        # Get roadmap
        rm_resp = self.client.get("/api/v1/student/roadmap", headers=self.headers)
        self.assertEqual(rm_resp.status_code, 200)
        rm_data = rm_resp.json()
        self.assertTrue(rm_data["has_roadmap"])
        activities = rm_data["roadmap"]["activities"]
        self.assertGreater(len(activities), 0)

        # Check off first activity
        first_act_id = activities[0]["id"]
        patch_resp = self.client.patch(
            f"/api/v1/student/roadmap/activity/{first_act_id}",
            json={"is_completed": True},
            headers=self.headers
        )
        self.assertEqual(patch_resp.status_code, 200)
        p_data = patch_resp.json()
        self.assertTrue(p_data["is_completed"])
        self.assertGreater(p_data["roadmap_progress"]["progress_percentage"], 0.0)

if __name__ == "__main__":
    unittest.main()
