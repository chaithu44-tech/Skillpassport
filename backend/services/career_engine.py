from typing import Dict, Any, List, Set, Tuple
from sqlalchemy.orm import Session
from backend.models import CareerRole, RoleRequirement, StudentProfile, StudentSkill

class CareerEngine:
    @classmethod
    def evaluate_role_compatibility(
        cls,
        student_skills: List[str],
        role: CareerRole,
        experience_level: str = "Beginner",
        career_goal: str = "Internship",
        preparation_timeline: str = "3 months"
    ) -> Dict[str, Any]:
        """Calculates compatibility score, categorizes matched/related/missing skills, and builds actionable career intelligence."""
        student_skills_normalized = {s.lower().strip() for s in student_skills}
        
        required_reqs = [r for r in role.requirements if r.requirement_type == "required"]
        preferred_reqs = [r for r in role.requirements if r.requirement_type == "preferred"]
        related_reqs = [r for r in role.requirements if r.requirement_type == "related"]

        matched_skills: List[str] = []
        related_skills: List[str] = []
        missing_skills: List[str] = []

        total_weight = 0.0
        earned_weight = 0.0

        # Evaluate required skills (highest weight)
        for req in required_reqs:
            w = req.weight if req.weight else 1.5
            total_weight += w
            req_skill_lower = req.skill_name.lower().strip()
            if cls._skill_matches(req_skill_lower, student_skills_normalized):
                earned_weight += w
                matched_skills.append(req.skill_name)
            else:
                missing_skills.append(req.skill_name)

        # Evaluate preferred skills (medium weight)
        for req in preferred_reqs:
            w = req.weight if req.weight else 1.0
            total_weight += w
            req_skill_lower = req.skill_name.lower().strip()
            if cls._skill_matches(req_skill_lower, student_skills_normalized):
                earned_weight += w
                matched_skills.append(req.skill_name)
            else:
                # Add to missing if important, else related
                missing_skills.append(req.skill_name)

        # Evaluate related skills
        for req in related_reqs:
            w = req.weight if req.weight else 0.5
            total_weight += w
            req_skill_lower = req.skill_name.lower().strip()
            if cls._skill_matches(req_skill_lower, student_skills_normalized):
                earned_weight += w
                related_skills.append(req.skill_name)
            else:
                related_skills.append(req.skill_name)

        # Fallback if no requirements configured in DB
        if total_weight == 0:
            total_weight = 1.0
            earned_weight = 0.5

        raw_percentage = (earned_weight / total_weight) * 100.0
        score = round(min(100.0, max(5.0, raw_percentage)), 1)

        # Career Readiness determination
        if score >= 85.0:
            readiness = "Strong Match"
        elif score >= 65.0:
            readiness = "Nearly Ready"
        elif score >= 40.0:
            readiness = "Developing"
        else:
            readiness = "Beginner"

        # Honest score explanation
        score_explanation = (
            f"Compatibility score of {score}% is derived by evaluating {len(matched_skills)} matched competencies "
            f"against {len(required_reqs)} core required and {len(preferred_reqs)} preferred skills for {role.title}. "
            "Note: This score assesses skill overlap and curriculum alignment; it is not a guaranteed hiring probability."
        )

        # What can the student achieve?
        what_student_can_achieve = cls._build_achievable_paths(
            role_title=role.title,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            score=score,
            career_goal=career_goal,
            experience_level=experience_level
        )

        # Personalized Recommendations
        recommendations = cls._generate_recommendations(
            role_title=role.title,
            missing_skills=missing_skills,
            matched_skills=matched_skills,
            timeline=preparation_timeline
        )

        return {
            "role_id": role.id,
            "role_title": role.title,
            "compatibility_score": score,
            "score_explanation": score_explanation,
            "matched_skills": list(dict.fromkeys(matched_skills)),
            "related_skills": list(dict.fromkeys(related_skills)),
            "missing_skills": list(dict.fromkeys(missing_skills)),
            "career_readiness": readiness,
            "what_student_can_achieve": what_student_can_achieve,
            "recommendations": recommendations
        }

    @staticmethod
    def _skill_matches(req_skill: str, student_skills: Set[str]) -> bool:
        """Fuzzy/substring check for skill matches (e.g. react matches react.js, python matches python3)."""
        if req_skill in student_skills:
            return True
        for s in student_skills:
            if req_skill in s or s in req_skill:
                return True
        return False

    @classmethod
    def _build_achievable_paths(
        cls,
        role_title: str,
        matched_skills: List[str],
        missing_skills: List[str],
        score: float,
        career_goal: str,
        experience_level: str
    ) -> Dict[str, Any]:
        matched_str = ", ".join(matched_skills[:3]) if matched_skills else "your current coursework"
        
        if score >= 65.0:
            ready_roles = [f"Junior {role_title}", f"{role_title} Intern", "Associate Developer"]
            prep_roles = [f"Mid-Level {role_title}", "Specialized Domain Roles"]
            long_term = [f"Senior {role_title}", f"Lead {role_title} / Architect"]
            narrative = (
                f"Based on your verified skills in {matched_str}, your profile exhibits high alignment for {role_title} "
                f"{career_goal.lower()} positions. You have the foundational requirements to start applying for entry-level opportunities."
            )
        elif score >= 40.0:
            ready_roles = [f"Junior Support / Associate in {role_title.split()[0]}", f"Foundational {role_title} Intern"]
            prep_roles = [f"Full {role_title}", "High-Growth Startup Engineering Roles"]
            long_term = [f"Senior {role_title}", "Specialized Architect"]
            narrative = (
                f"Your background in {matched_str} provides a viable starting point. With targeted preparation focusing on "
                f"missing skills ({', '.join(missing_skills[:3])}), you can reach entry-level job readiness."
            )
        else:
            ready_roles = ["Campus Technical Ambassador", "Foundational Lab Assistant", "Entry Tech Explorer"]
            prep_roles = [f"Junior {role_title}", f"{role_title} Intern"]
            long_term = [f"Professional {role_title}", "Technical Specialist"]
            narrative = (
                f"You are at the introductory stage for {role_title}. By systematically following your roadmap and acquiring core "
                f"skills like {', '.join(missing_skills[:3])}, you can build strong competency for upcoming placements."
            )

        return {
            "narrative": narrative,
            "roles_ready_to_apply": ready_roles,
            "roles_requiring_preparation": prep_roles,
            "long_term_goals": long_term,
            "disclaimer": "Skill Passport provides educational and readiness guidance based on skill matching. We never guarantee employment, salary brackets, or interview selection."
        }

    @classmethod
    def _generate_recommendations(
        cls,
        role_title: str,
        missing_skills: List[str],
        matched_skills: List[str],
        timeline: str
    ) -> Dict[str, Any]:
        top_missing = missing_skills[:4] if missing_skills else ["Advanced System Architecture", "Performance Profiling"]
        
        # Project recommendations tailored to the career role
        projects_catalog = {
            "AI Engineer": [
                "End-to-End Multimodal RAG Pipeline with Vector Search and FastAPI",
                "Fine-Tuned LLM Domain Chatbot with PyTorch and HuggingFace",
                "Automated Document Intelligence System with PyMuPDF and Embeddings"
            ],
            "Machine Learning Engineer": [
                "Real-Time Fraud Detection Pipeline with Scikit-Learn and Kafka",
                "Computer Vision Defect Detection using PyTorch and OpenCV",
                "Model Deployment & Monitoring Dashboard with Docker and MLflow"
            ],
            "Full Stack Developer": [
                "SaaS Multi-Tenant Collaboration Platform with React, FastAPI & PostgreSQL",
                "Real-Time Collaborative Code Editor with WebSockets and Redis",
                "E-Commerce Platform with Stripe Checkout and Automated Testing"
            ],
            "Frontend Developer": [
                "High-Performance Analytics Dashboard with Tailwind CSS and D3/Chart.js",
                "Accessible Component Library with Storybook and Unit Tests",
                "Modern Neo-Editorial Portfolio with Responsive Dark Mode"
            ],
            "Backend Developer": [
                "Distributed Task Queue with Redis and Asynchronous Workers",
                "Secure REST API Microservice with Rate Limiting and JWT Auth",
                "High-Throughput URL Shortener with Caching and PostgreSQL"
            ],
            "Cybersecurity Analyst": [
                "Vulnerability Assessment & Network Traffic Monitor with Scapy/Wireshark",
                "Automated Security Incident & Event Management (SIEM) Log Parser",
                "Web Application Security Audit following OWASP Top 10"
            ],
            "Data Scientist": [
                "Predictive Customer Churn Model with Feature Engineering and SHAP",
                "Automated Exploratory Data Analysis Dashboard with Streamlit",
                "Time-Series Forecasting for Financial Market Trends"
            ],
            "Cloud Engineer": [
                "Automated Multi-Region Cloud Infrastructure using Terraform",
                "Kubernetes Cluster Deployment with Prometheus & Grafana Monitoring",
                "Serverless REST API with AWS Lambda, API Gateway and DynamoDB"
            ],
            "DevOps Engineer": [
                "Zero-Downtime CI/CD Pipeline with GitHub Actions and Docker",
                "Infrastructure as Code Configuration Management with Ansible",
                "Centralized Log Aggregation and Alerting Stack"
            ]
        }

        recommended_projects = projects_catalog.get(role_title, [
            f"End-to-End {role_title} Showcase Application demonstrating clean architecture",
            f"Production-ready deployment pipeline with containerization and automated testing"
        ])

        certifications = [
            f"Relevant industry credentials for {role_title} (e.g. AWS Certified, Google Cloud, Meta Developer, DeepLearning.AI)",
            "Verified open-source contributions or peer-reviewed GitHub repositories"
        ]

        interview_topics = [
            "Data Structures & Algorithmic Complexity (Big-O analysis)",
            f"Core {role_title} domain architecture and system design patterns",
            "Behavioral STAR method responses for technical projects and collaboration"
        ]

        return {
            "skills_to_learn_first": top_missing,
            "recommended_projects": recommended_projects,
            "certifications_to_consider": certifications,
            "technologies_to_practice": top_missing,
            "interview_preparation_topics": interview_topics,
            "suggested_pacing": f"Allocate 8-12 hours per week over your selected {timeline} timeline."
        }
