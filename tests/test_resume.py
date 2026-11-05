import io
import os
import unittest
import uuid
import pymupdf
import docx
from fastapi.testclient import TestClient
from backend.main import app

class TestResumeSystem(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.email = f"resumestudent_{uuid.uuid4().hex[:8]}@test.com"
        reg = self.client.post("/api/v1/auth/register-student", json={
            "full_name": "Jordan Lee",
            "email": self.email,
            "password": "Password123!",
            "college": "MIT",
            "course_branch": "Computer Science",
            "graduation_year": 2026
        })
        self.assertEqual(reg.status_code, 200, reg.text)
        self.token = reg.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def _create_sample_pdf(self) -> bytes:
        doc = pymupdf.open()
        page1 = doc.new_page()
        text_page1 = (
            "Jordan Lee\n"
            "Email: jordan.lee@example.edu | Phone: +1-555-019-2834\n"
            "Massachusetts Institute of Technology (MIT) - B.S. Computer Science, 2026\n\n"
            "TECHNICAL SKILLS\n"
            "Languages: Python, JavaScript, TypeScript, SQL, HTML, CSS\n"
            "Frameworks & Tools: React.js, FastAPI, Docker, Git, PostgreSQL\n"
            "Machine Learning: PyTorch, Scikit-Learn, Pandas, NumPy\n\n"
            "PROJECTS\n"
            "AI Document Analyzer\n"
            "Built a high-performance document extraction pipeline using PyTorch and FastAPI.\n"
        )
        page1.insert_text((50, 72), text_page1, fontsize=11)

        page2 = doc.new_page()
        text_page2 = (
            "WORK EXPERIENCE\n"
            "Software Engineering Intern - CloudScale Inc (Summer 2025)\n"
            "Developed REST APIs with FastAPI and optimized PostgreSQL database queries.\n"
        )
        page2.insert_text((50, 72), text_page2, fontsize=11)

        pdf_bytes = doc.tobytes()
        doc.close()
        return pdf_bytes

    def _create_sample_docx(self) -> bytes:
        doc = docx.Document()
        doc.add_heading("Jordan Lee - Resume", 0)
        doc.add_paragraph("Email: jordan.docx@example.edu | Phone: 555-987-6543")
        doc.add_paragraph("Education: Stanford University, B.S. in Software Engineering, Class of 2026")
        doc.add_heading("Technical Skills", level=1)
        doc.add_paragraph("Proficient in Python, Java, Docker, Git, React, and MongoDB.")
        doc.add_heading("Projects", level=1)
        doc.add_paragraph("Real-Time Code Collaboration Tool built with React and Docker.")
        
        bio = io.BytesIO()
        doc.save(bio)
        return bio.getvalue()

    def test_pdf_resume_upload_and_extraction(self):
        pdf_bytes = self._create_sample_pdf()
        files = {"file": ("Jordan_Lee_Resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        resp = self.client.post("/api/v1/student/upload-resume", files=files, headers=self.headers)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertEqual(data["file_name"], "Jordan_Lee_Resume.pdf")
        self.assertEqual(data["page_count"], 2)
        self.assertEqual(data["upload_status"], "parsed")
        
        analysis = data["analysis"]
        self.assertIsNotNone(analysis)
        tech_skills = analysis["technical_skills"]
        self.assertIn("Python", tech_skills["languages"])
        self.assertIn("JavaScript", tech_skills["languages"])
        self.assertTrue(any("FastAPI" in f or "React" in f for f in tech_skills["frameworks"]))
        self.assertIn("ats_readability_score", analysis["quality_analysis"])

    def test_docx_resume_upload_and_extraction(self):
        docx_bytes = self._create_sample_docx()
        files = {"file": ("Jordan_Resume.docx", io.BytesIO(docx_bytes), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        resp = self.client.post("/api/v1/student/upload-resume", files=files, headers=self.headers)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertEqual(data["upload_status"], "parsed")
        self.assertIn("Python", data["analysis"]["technical_skills"]["languages"])

    def test_unsupported_file_rejected(self):
        invalid_bytes = b"This is just an image or text file"
        files = {"file": ("unsupported.txt", io.BytesIO(invalid_bytes), "text/plain")}
        resp = self.client.post("/api/v1/student/upload-resume", files=files, headers=self.headers)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Unsupported file format", resp.json()["detail"])

    def test_empty_file_rejected(self):
        files = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
        resp = self.client.post("/api/v1/student/upload-resume", files=files, headers=self.headers)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("empty", resp.json()["detail"].lower())

if __name__ == "__main__":
    unittest.main()
