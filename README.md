# SKILL PASSPORT
### AI-Powered Career Intelligence and Skill Development Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=Python&logoColor=white)](https://python.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Neo--Editorial-06B6D4.svg?style=flat&logo=TailwindCSS&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/Security-Owner--Controlled-7C5CFC.svg?style=flat)]()

**Skill Passport** is an AI-powered career development platform built for college students. It helps students understand their current competencies, extract and analyze multi-page resumes, identify target career roles, detect missing skill gaps, and follow a personalized interactive roadmap to become job-ready.

---

## 🏛️ Platform Portals

The platform is organized into three distinct portals with strict server-side authorization:

1. **Student Portal**
   - Multi-page resume upload (`.pdf` and `.docx`) with PyMuPDF and python-docx text extraction.
   - Truthful AI Resume Analysis: identifies verified technical competencies, projects, work experience, certifications, and provides actionable ATS readability suggestions.
   - Career Role Selection across **16+ industry domains** (Software Developer, Full Stack, Python, Java, AI Engineer, ML Engineer, Data Scientist, Data Analyst, Cloud Engineer, DevOps, Cybersecurity, UI/UX, Mobile App, etc.).
   - Role-Based Compatibility Scoring (%) with mathematical derivation, matched competencies, and missing skill gap detection.
   - Interactive Personalized Learning Roadmaps with real verified resource links and progress tracking.
   - Application Tracker for managing job submissions through all stages: *Saved*, *Applied*, *Under Review*, *Shortlisted*, *Interview Scheduled*, *Selected*, *Rejected*.
   - Skill Management clearly distinguishing resume-extracted skills from manual skills with attached evidence.

2. **Recruiter Portal**
   - Recruiter registration with company details and mandatory Super Admin verification.
   - Job & Internship listing management with required skill tags, stipend/salary, and work mode.
   - Candidate screening: view authorized applicants with automated AI match percentages.
   - Interview scheduling with calendar times, duration, and Google Meet/Zoom links.
   - Strict student data privacy: candidate profiles are only accessible when the student explicitly applies.

3. **Super Admin Portal (Website Owner Only)**
   - Exclusively controlled by the permanent website owner via `OWNER_EMAIL` and `OWNER_BOOTSTRAP_SECRET`.
   - Real-time database metrics: total students, recruiters, verified recruiters, uploaded resumes, completed AI analyses, active opportunities, and total applications (100% genuine database counts).
   - User Management: search, verify recruiters, suspend or reactivate accounts.
   - AI & Resume Pipeline Monitor: inspect extraction logs, view failure causes, and trigger one-click job retries.
   - Career Role & Requirements Manager: add custom roles, update requirements, and tune skill weights.
   - Immutable security and administrative audit trail.

---

## 🎨 Design Theme: Dark Premium + Neo-Editorial Tech

- **Primary Background**: `#0B0F19`
- **Secondary Background**: `#111827`
- **Card Background**: `#172033`
- **Primary Accent**: `#7C5CFC` (Electric Violet Glow)
- **Secondary Accent**: `#22D3EE` (Cyan Tech Highlight)
- **Success / Warning / Danger**: `#22C55E` / `#F59E0B` / `#EF4444`
- **Typography**: Inter, Plus Jakarta Sans, and JetBrains Mono for metrics and technical skills.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.11+
- Virtualenv (recommended)

### 2. Environment Configuration
Copy the configuration template:
```bash
cp .env.example .env
```
Default `.env` values are already set for local development:
```env
DATABASE_URL=sqlite:///./skill_passport.db
OWNER_EMAIL=owner@skillpassport.ai
OWNER_BOOTSTRAP_SECRET=SkillPassportOwner2026!Bootstrap
SECRET_KEY=your-secure-jwt-secret-key-here
AI_API_KEY=
AI_MODEL=gemini-1.5-flash
STORAGE_DIR=./storage/resumes
```

> **Note on AI Engine**: If `AI_API_KEY` is configured with a Google Gemini API key, the platform uses Gemini 1.5 Flash for high-level semantic analysis. If left empty, Skill Passport seamlessly operates using its built-in **Local Semantic NLP Parser** and displays honest development mode badges across the UI and admin monitors.

### 3. Run the Automated Test Suite
Skill Passport includes a comprehensive 15-test automated verification suite:
```bash
python3 test_runner.py
```

### 4. Launch the Application
Run the startup script:
```bash
./start.sh
```
Or run directly with Uvicorn:
```bash
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Open your browser at:
- **Web Application**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Super Admin (Owner Login)**: [http://localhost:8000/#owner-login](http://localhost:8000/#owner-login)
  - **Email**: `owner@skillpassport.ai`
  - **Bootstrap Secret**: `SkillPassportOwner2026!Bootstrap`

---

## 🧭 The End-to-End User Journey

```
[Student Signs Up] 
       │
       ▼
[Uploads PDF / DOCX Resume] ──► [PyMuPDF / docx Text Extraction] ──► [AI Identifies Skills & Quality]
       │
       ▼
["Which career role do you want to pursue?"] ──► [Selects e.g. AI Engineer, Level, Goal, Timeline]
       │
       ▼
[AI Skill Gap Comparison] ──► [Compatibility Score %] + [Matched Skills] + [Missing Skills]
       │
       ▼
[Personalized Roadmap] ──► [Interactive 8-Phase Curriculum with Checkboxes & Verified Links]
       │
       ▼
[Opportunities Matching] ──► [Applies to Verified Jobs] ──► [Recruiter Shortlists & Schedules Interview]
```

---

## 🔒 Security & Privacy Implementation

- **Password Hashing**: PBKDF2-HMAC-SHA256 with 100,000 rounds and random salt.
- **JWT Authorization**: Role-based claims (`student`, `recruiter`, `admin`) validated on every sensitive route.
- **Owner Isolation**: Super Admin endpoints strictly require `user.role == 'admin'` AND `user.email == OWNER_EMAIL`.
- **Private Resumes**: Stored on backend storage in user-isolated directories (`storage/resumes/student_{id}/`).
- **Recruiter Sandbox**: Recruiters cannot access candidate resumes or contact info unless a candidate has submitted an application to their listing.
- **Audit Logging**: Sensitive actions (registrations, verifications, suspensions, role edits) are recorded into `audit_logs` with IP and timestamp.

---

## 📁 Repository Structure

```
skill-passport/
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── README.md                 # System documentation & deployment guide
├── start.sh                  # Execution shell script
├── test_runner.py            # Automated test suite runner
├── backend/
│   ├── config.py             # Settings, storage paths, AI credentials
│   ├── database.py           # SQLAlchemy engine & session factory
│   ├── models.py             # 21 Relational database models
│   ├── schemas.py            # Pydantic request & response schemas
│   ├── auth.py               # PBKDF2 hashing, JWT tokens & role guards
│   ├── initial_data.py       # Seeds 16+ roles, opportunities, platform settings & owner
│   ├── main.py               # FastAPI app, CORS, static mounting & lifecycle
│   ├── services/
│   │   ├── document_parser.py# Multi-page PyMuPDF & docx text extraction
│   │   ├── ai_service.py     # Gemini LLM + Local Semantic NLP engine
│   │   ├── career_engine.py  # Compatibility %, skill matching & recommendations
│   │   ├── roadmap_engine.py # Phased personalized roadmap generation
│   │   └── notification_service.py # Persistent database notifications
│   └── routes/
│       ├── auth_routes.py    # Register, login, owner bootstrap, password reset
│       ├── student_routes.py # Resume upload, role selection, roadmap, profile
│       ├── opportunity_routes.py # Listings, filtering, application tracker
│       ├── recruiter_routes.py # Recruiter jobs, applicants review, interviews
│       ├── admin_routes.py   # Live stats, user management, role manager, monitor
│       └── notification_routes.py # Read/unread notifications
├── frontend/
│   ├── index.html            # Main SPA entry point
│   ├── css/custom.css        # Neo-Editorial dark theme & glassmorphism
│   └── js/
│       ├── api.js            # REST API client
│       ├── state.js          # Central reactive state manager
│       ├── app.js            # Router, notifications polling & initialization
│       ├── components/       # Navbar, Toast alerts, Modal dialogs, SVG gauges
│       └── pages/            # Landing, Auth, Student, Recruiter, Admin views
├── storage/
│   └── resumes/              # Secure isolated local resume repository
└── tests/
    ├── test_auth.py          # Authentication tests
    ├── test_resume.py        # PDF & DOCX upload and parsing tests
    ├── test_career_engine.py # Compatibility & roadmap tests
    ├── test_admin_security.py# Owner authorization & security tests
    └── test_opportunities.py # Opportunities & candidate screening tests
```

---

## 🛡️ License & Platform Ownership
Exclusively owned and controlled by the configured website owner. Designed and engineered for high-impact college career readiness.
