from sqlalchemy.orm import Session
from backend.models import (
    CareerRole, RoleRequirement, Opportunity, OpportunityRequirement,
    PlatformSetting, User, OwnerAccount, Skill
)
from backend.auth import hash_password
from backend.config import settings

CAREER_ROLES_DATA = [
    {
        "title": "Software Developer",
        "slug": "software-developer",
        "category": "Engineering",
        "description": "Designs, develops, tests, and maintains software applications and core algorithms.",
        "requirements": [
            ("Python", "required", 1.8),
            ("Java", "required", 1.8),
            ("Data Structures", "required", 2.0),
            ("Algorithms", "required", 2.0),
            ("Git", "required", 1.2),
            ("SQL", "preferred", 1.2),
            ("Docker", "preferred", 1.0),
            ("Unit Testing", "preferred", 1.0),
            ("Linux", "related", 0.8),
            ("CI/CD", "related", 0.8)
        ]
    },
    {
        "title": "Full Stack Developer",
        "slug": "full-stack-developer",
        "category": "Engineering",
        "description": "Builds both client-facing interfaces and server-side systems, APIs, and databases.",
        "requirements": [
            ("JavaScript", "required", 1.8),
            ("TypeScript", "preferred", 1.2),
            ("React.js", "required", 1.8),
            ("Node.js", "required", 1.5),
            ("Python", "preferred", 1.2),
            ("FastAPI", "preferred", 1.2),
            ("PostgreSQL", "required", 1.5),
            ("MongoDB", "preferred", 1.0),
            ("Git", "required", 1.2),
            ("REST APIs", "required", 1.5),
            ("Tailwind CSS", "preferred", 1.0),
            ("Docker", "preferred", 1.0)
        ]
    },
    {
        "title": "Frontend Developer",
        "slug": "frontend-developer",
        "category": "Engineering",
        "description": "Creates responsive, accessible, interactive web interfaces and client experiences.",
        "requirements": [
            ("HTML", "required", 1.5),
            ("CSS", "required", 1.5),
            ("JavaScript", "required", 2.0),
            ("TypeScript", "preferred", 1.5),
            ("React.js", "required", 2.0),
            ("Tailwind CSS", "required", 1.4),
            ("Next.js", "preferred", 1.2),
            ("Git", "required", 1.2),
            ("Figma", "related", 0.8),
            ("Web Performance", "preferred", 1.0)
        ]
    },
    {
        "title": "Backend Developer",
        "slug": "backend-developer",
        "category": "Engineering",
        "description": "Constructs robust server architectures, business logic, microservices, and databases.",
        "requirements": [
            ("Python", "required", 1.8),
            ("FastAPI", "required", 1.5),
            ("SQL", "required", 1.8),
            ("PostgreSQL", "required", 1.8),
            ("Redis", "preferred", 1.2),
            ("Docker", "required", 1.5),
            ("Git", "required", 1.2),
            ("REST APIs", "required", 1.8),
            ("Microservices", "preferred", 1.2),
            ("Linux", "related", 1.0)
        ]
    },
    {
        "title": "Python Developer",
        "slug": "python-developer",
        "category": "Engineering",
        "description": "Builds backend services, automation scripts, data pipelines, and web tools with Python.",
        "requirements": [
            ("Python", "required", 2.0),
            ("Django", "preferred", 1.5),
            ("FastAPI", "required", 1.8),
            ("SQL", "required", 1.5),
            ("PostgreSQL", "preferred", 1.2),
            ("Git", "required", 1.2),
            ("Docker", "preferred", 1.0),
            ("Unit Testing", "preferred", 1.2),
            ("AsyncIO", "preferred", 1.2)
        ]
    },
    {
        "title": "Java Developer",
        "slug": "java-developer",
        "category": "Engineering",
        "description": "Develops enterprise-grade backends, microservices, and distributed applications in Java.",
        "requirements": [
            ("Java", "required", 2.0),
            ("Spring Boot", "required", 2.0),
            ("SQL", "required", 1.6),
            ("Hibernate", "preferred", 1.4),
            ("PostgreSQL", "preferred", 1.2),
            ("Docker", "preferred", 1.2),
            ("Git", "required", 1.2),
            ("Microservices", "preferred", 1.4),
            ("REST APIs", "required", 1.5)
        ]
    },
    {
        "title": "AI Engineer",
        "slug": "ai-engineer",
        "category": "Data & AI",
        "description": "Builds and deploys generative AI models, LLM pipelines, RAG systems, and AI microservices.",
        "requirements": [
            ("Python", "required", 2.0),
            ("Machine Learning", "required", 1.8),
            ("Deep Learning", "required", 1.8),
            ("PyTorch", "required", 1.8),
            ("LLM", "required", 1.8),
            ("LangChain", "preferred", 1.4),
            ("FastAPI", "required", 1.5),
            ("Docker", "preferred", 1.2),
            ("Vector Databases", "preferred", 1.2),
            ("TensorFlow", "related", 1.0),
            ("HuggingFace", "preferred", 1.4)
        ]
    },
    {
        "title": "Machine Learning Engineer",
        "slug": "ml-engineer",
        "category": "Data & AI",
        "description": "Designs ML architectures, trains predictive models, and automates production ML pipelines.",
        "requirements": [
            ("Python", "required", 2.0),
            ("Scikit-Learn", "required", 1.8),
            ("PyTorch", "required", 1.8),
            ("TensorFlow", "preferred", 1.4),
            ("Machine Learning", "required", 2.0),
            ("Pandas", "required", 1.5),
            ("NumPy", "required", 1.5),
            ("MLOps", "preferred", 1.4),
            ("Docker", "preferred", 1.2),
            ("SQL", "preferred", 1.2)
        ]
    },
    {
        "title": "Data Scientist",
        "slug": "data-scientist",
        "category": "Data & AI",
        "description": "Extracts actionable insights from complex datasets using statistics, ML, and experiments.",
        "requirements": [
            ("Python", "required", 2.0),
            ("R", "related", 0.8),
            ("SQL", "required", 2.0),
            ("Pandas", "required", 1.8),
            ("NumPy", "required", 1.5),
            ("Machine Learning", "required", 1.8),
            ("Statistics", "required", 1.8),
            ("Data Visualization", "preferred", 1.4),
            ("Scikit-Learn", "required", 1.5)
        ]
    },
    {
        "title": "Data Analyst",
        "slug": "data-analyst",
        "category": "Data & AI",
        "description": "Analyzes trends, creates interactive dashboards, and communicates key business metrics.",
        "requirements": [
            ("SQL", "required", 2.0),
            ("Python", "preferred", 1.5),
            ("Pandas", "preferred", 1.4),
            ("Excel", "required", 1.5),
            ("Tableau", "preferred", 1.5),
            ("Power BI", "preferred", 1.5),
            ("Statistics", "preferred", 1.2),
            ("Data Visualization", "required", 1.5)
        ]
    },
    {
        "title": "Data Engineer",
        "slug": "data-engineer",
        "category": "Data & AI",
        "description": "Builds robust ETL pipelines, data warehouses, and streaming platforms for analytics.",
        "requirements": [
            ("Python", "required", 1.8),
            ("SQL", "required", 2.0),
            ("PostgreSQL", "required", 1.5),
            ("Apache Spark", "preferred", 1.6),
            ("Kafka", "preferred", 1.4),
            ("Docker", "preferred", 1.2),
            ("AWS", "preferred", 1.4),
            ("Airflow", "preferred", 1.4),
            ("Data Warehousing", "preferred", 1.5)
        ]
    },
    {
        "title": "Cybersecurity Analyst",
        "slug": "cybersecurity-analyst",
        "category": "Cloud & Security",
        "description": "Protects digital assets, monitors network activity, and responds to vulnerabilities.",
        "requirements": [
            ("Linux", "required", 1.8),
            ("Networking", "required", 2.0),
            ("Python", "preferred", 1.4),
            ("Bash", "preferred", 1.4),
            ("Vulnerability Assessment", "required", 1.8),
            ("SIEM", "preferred", 1.4),
            ("OWASP Top 10", "required", 1.6),
            ("Cryptography", "preferred", 1.2)
        ]
    },
    {
        "title": "Cloud Engineer",
        "slug": "cloud-engineer",
        "category": "Cloud & Security",
        "description": "Architects, scales, and manages reliable infrastructure on AWS, Azure, or GCP.",
        "requirements": [
            ("AWS", "required", 2.0),
            ("GCP", "preferred", 1.2),
            ("Terraform", "required", 1.8),
            ("Docker", "required", 1.6),
            ("Kubernetes", "preferred", 1.6),
            ("Linux", "required", 1.5),
            ("CI/CD", "preferred", 1.4),
            ("Python", "preferred", 1.2)
        ]
    },
    {
        "title": "DevOps Engineer",
        "slug": "devops-engineer",
        "category": "Cloud & Security",
        "description": "Bridges development and operations through automation, CI/CD, and monitoring.",
        "requirements": [
            ("Docker", "required", 2.0),
            ("Kubernetes", "required", 1.8),
            ("CI/CD", "required", 2.0),
            ("Linux", "required", 1.8),
            ("Git", "required", 1.5),
            ("Terraform", "preferred", 1.5),
            ("AWS", "preferred", 1.5),
            ("Prometheus", "preferred", 1.2),
            ("Python", "preferred", 1.2)
        ]
    },
    {
        "title": "UI/UX Designer",
        "slug": "ui-ux-designer",
        "category": "Design",
        "description": "Designs intuitive, visually appealing user journeys, wireframes, and prototypes.",
        "requirements": [
            ("Figma", "required", 2.0),
            ("UI Design", "required", 2.0),
            ("User Research", "required", 1.6),
            ("Prototyping", "required", 1.8),
            ("Wireframing", "required", 1.6),
            ("Design Systems", "required", 1.6),
            ("HTML", "related", 0.8),
            ("CSS", "related", 0.8)
        ]
    },
    {
        "title": "Mobile App Developer",
        "slug": "mobile-app-developer",
        "category": "Engineering",
        "description": "Builds high-performance native and cross-platform apps for iOS and Android.",
        "requirements": [
            ("React Native", "required", 1.8),
            ("Flutter", "preferred", 1.6),
            ("JavaScript", "required", 1.5),
            ("TypeScript", "preferred", 1.2),
            ("REST APIs", "required", 1.5),
            ("Git", "required", 1.2),
            ("Mobile UI Design", "preferred", 1.2)
        ]
    }
]

OPPORTUNITIES_SEED = [
    {
        "title": "AI/ML Engineering Intern",
        "company": "DeepPulse Intelligence",
        "opportunity_type": "internship",
        "work_mode": "remote",
        "location": "Remote (Global)",
        "stipend_or_salary": "$1,800 - $2,500 / month",
        "eligibility": "Enrolled in Computer Science or related degree; strong Python and PyTorch foundations.",
        "deadline": "2026-12-31",
        "application_link": "https://careers.deeppulse.io/apply/intern-aiml",
        "description": "Join our AI research team to build and evaluate LLM agent workflows and document extraction pipelines using PyTorch and FastAPI.",
        "required_skills": ["Python", "PyTorch", "Machine Learning", "FastAPI"],
        "source": "Verified Partner"
    },
    {
        "title": "Junior Full Stack Developer",
        "company": "Nexus Flow Technologies",
        "opportunity_type": "full_time",
        "work_mode": "hybrid",
        "location": "Bengaluru / Hybrid",
        "stipend_or_salary": "$18,000 - $24,000 / year",
        "eligibility": "Recent graduate or final year student with hands-on React and Node.js or Python backend projects.",
        "deadline": "2026-12-15",
        "application_link": "https://nexusflow.tech/careers/fullstack-junior",
        "description": "Collaborate on modern web applications utilizing React, Tailwind CSS, and Python microservices.",
        "required_skills": ["JavaScript", "React.js", "Python", "SQL", "Git"],
        "source": "Verified Partner"
    },
    {
        "title": "Data Analytics Intern",
        "company": "Aura Global Metrics",
        "opportunity_type": "internship",
        "work_mode": "remote",
        "location": "Remote",
        "stipend_or_salary": "$1,200 / month",
        "eligibility": "Passionate about data modeling, SQL queries, and visualization dashboards.",
        "deadline": "2026-11-30",
        "application_link": "https://aurametrics.com/jobs/data-intern",
        "description": "Build high-impact visual reports and KPI tracking dashboards for international operations.",
        "required_skills": ["SQL", "Python", "Pandas", "Data Visualization"],
        "source": "Verified Partner"
    },
    {
        "title": "Cloud & DevOps Associate",
        "company": "Skyline Cloud Labs",
        "opportunity_type": "full_time",
        "work_mode": "remote",
        "location": "Remote",
        "stipend_or_salary": "$20,000 - $28,000 / year",
        "eligibility": "Familiarity with containerization (Docker), Linux shell scripting, and CI/CD pipelines.",
        "deadline": "2026-12-20",
        "application_link": "https://skylinecloud.io/careers/devops-assoc",
        "description": "Assist our infrastructure team with automated deployments, Docker containers, and cloud monitoring.",
        "required_skills": ["Docker", "Linux", "Git", "CI/CD", "AWS"],
        "source": "Verified Partner"
    },
    {
        "title": "Frontend Engineering Intern (React / UI)",
        "company": "VividCraft Interactive",
        "opportunity_type": "internship",
        "work_mode": "remote",
        "location": "Remote",
        "stipend_or_salary": "$1,500 / month",
        "eligibility": "Strong visual aesthetic, modern JavaScript / React experience, and passion for UI/UX.",
        "deadline": "2026-12-25",
        "application_link": "https://vividcraft.design/jobs/frontend-intern",
        "description": "Build responsive web interfaces using React and Tailwind CSS for client products.",
        "required_skills": ["JavaScript", "React.js", "HTML", "CSS", "Tailwind CSS"],
        "source": "Verified Partner"
    }
]

def seed_database(db: Session):
    """Seeds career roles, requirements, verified opportunities, platform settings, and ensures owner account."""
    # 1. Seed Career Roles & Requirements
    for r_data in CAREER_ROLES_DATA:
        role = db.query(CareerRole).filter(CareerRole.title == r_data["title"]).first()
        if not role:
            role = CareerRole(
                title=r_data["title"],
                slug=r_data["slug"],
                category=r_data["category"],
                description=r_data["description"],
                is_active=True
            )
            db.add(role)
            db.flush()

            for skill_name, req_type, weight in r_data["requirements"]:
                req = RoleRequirement(
                    role_id=role.id,
                    skill_name=skill_name,
                    requirement_type=req_type,
                    weight=weight
                )
                db.add(req)
                # Also ensure skill exists in global skills catalog
                existing_skill = db.query(Skill).filter(Skill.name == skill_name).first()
                if not existing_skill:
                    cat = "framework"
                    if req_type == "required" and skill_name in ["Python", "Java", "JavaScript", "TypeScript", "SQL", "HTML", "CSS"]:
                        cat = "language"
                    elif skill_name in ["PostgreSQL", "MongoDB", "Redis", "SQLite"]:
                        cat = "database"
                    elif skill_name in ["Docker", "Kubernetes", "Git", "Linux", "CI/CD", "Terraform"]:
                        cat = "tool"
                    elif skill_name in ["AWS", "GCP", "Azure"]:
                        cat = "cloud"
                    elif skill_name in ["Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "LLM", "NLP"]:
                        cat = "aiml"
                    db.add(Skill(name=skill_name, category=cat, is_verified=True))

    # 2. Seed Verified Opportunities
    for opp_data in OPPORTUNITIES_SEED:
        existing_opp = db.query(Opportunity).filter(Opportunity.title == opp_data["title"], Opportunity.company == opp_data["company"]).first()
        if not existing_opp:
            opp = Opportunity(
                title=opp_data["title"],
                company=opp_data["company"],
                description=opp_data["description"],
                opportunity_type=opp_data["opportunity_type"],
                work_mode=opp_data["work_mode"],
                location=opp_data["location"],
                stipend_or_salary=opp_data["stipend_or_salary"],
                eligibility=opp_data["eligibility"],
                deadline=opp_data["deadline"],
                application_link=opp_data["application_link"],
                verification_status="verified",
                source=opp_data["source"],
                is_active=True
            )
            db.add(opp)
            db.flush()
            for s in opp_data["required_skills"]:
                db.add(OpportunityRequirement(opportunity_id=opp.id, skill_name=s, is_mandatory=True))

    # 3. Seed Platform Settings
    settings_seed = [
        ("maintenance_mode", "false", "Global maintenance mode flag"),
        ("ai_analysis_enabled", "true", "Controls whether AI resume analysis engine is active"),
        ("max_resume_size_mb", "10", "Maximum uploaded resume file size limit in megabytes"),
        ("announcement_banner", "Welcome to Skill Passport 1.0! Upload your resume to discover your AI career roadmap.", "Site-wide announcement banner")
    ]
    for key, val, desc in settings_seed:
        existing = db.query(PlatformSetting).filter(PlatformSetting.setting_key == key).first()
        if not existing:
            db.add(PlatformSetting(setting_key=key, setting_value=val, description=desc))

    # 4. Bootstrap Website Owner Account (if configured in environment)
    if settings.OWNER_EMAIL and settings.OWNER_BOOTSTRAP_SECRET:
        owner_user = db.query(User).filter(User.email == settings.OWNER_EMAIL).first()
        if not owner_user:
            owner_user = User(
                email=settings.OWNER_EMAIL,
                password_hash=hash_password(settings.OWNER_BOOTSTRAP_SECRET),
                role="admin",
                is_active=True,
                is_verified=True
            )
            db.add(owner_user)
            db.flush()
            db.add(OwnerAccount(
                user_id=owner_user.id,
                bootstrap_secret_hash=hash_password(settings.OWNER_BOOTSTRAP_SECRET),
                is_bootstrapped=True
            ))
            print(f"[Skill Passport] Bootstrapped exclusive website owner account for {settings.OWNER_EMAIL}")

    db.commit()
    print("[Skill Passport] Initial seed data loaded successfully.")
