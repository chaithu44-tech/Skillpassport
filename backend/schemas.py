from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
import datetime
import re

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

# --- Auth Schemas ---
class StudentRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)
    college: Optional[str] = None
    course_branch: Optional[str] = None
    graduation_year: Optional[int] = None

    @field_validator("email")
    def validate_email(cls, v):
        if not re.match(EMAIL_REGEX, v.strip()):
            raise ValueError("Invalid email format.")
        return v.strip().lower()

class RecruiterRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    official_email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)
    company_name: str = Field(..., min_length=2, max_length=150)
    company_website: Optional[str] = None
    designation: Optional[str] = None
    company_description: Optional[str] = None

    @field_validator("official_email")
    def validate_email(cls, v):
        if not re.match(EMAIL_REGEX, v.strip()):
            raise ValueError("Invalid official email format.")
        return v.strip().lower()

class UserLogin(BaseModel):
    email: str
    password: str

class OwnerBootstrapRequest(BaseModel):
    email: str
    bootstrap_secret: str
    password: str = Field(..., min_length=8)

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    email: str
    reset_token: str
    new_password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    email: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime.datetime
    student_profile: Optional[Dict[str, Any]] = None
    recruiter_profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- Student Profile Schemas ---
class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    college: Optional[str] = None
    course_branch: Optional[str] = None
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    experience_level: Optional[str] = None
    career_goal: Optional[str] = None
    preparation_timeline: Optional[str] = None

class StudentSkillCreate(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    category: str = "framework" # language, framework, database, tool, cloud, aiml, soft_skill
    proficiency_level: str = "Intermediate" # Beginner, Intermediate, Advanced
    evidence_note: Optional[str] = None

class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    technologies_used: Optional[str] = None
    project_url: Optional[str] = None

class CertificationCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    certificate_url: Optional[str] = None
    credential_id: Optional[str] = None

# --- Career Role & Gap Analysis Schemas ---
class RoleSelectionRequest(BaseModel):
    role_id: Optional[int] = None
    custom_role_title: Optional[str] = None
    experience_level: str = "Beginner"
    career_goal: str = "Internship"
    preparation_timeline: str = "3 months"

class CareerCompatibilityOut(BaseModel):
    role_id: Optional[int]
    role_title: str
    compatibility_score: float # 0 to 100
    score_explanation: str
    matched_skills: List[str]
    related_skills: List[str]
    missing_skills: List[str]
    career_readiness: str # Beginner, Developing, Nearly Ready, Strong Match
    what_student_can_achieve: Dict[str, Any]
    recommendations: Dict[str, Any]

# --- Roadmap Schemas ---
class RoadmapActivityUpdate(BaseModel):
    is_completed: bool

# --- Recruiter & Opportunity Schemas ---
class OpportunityCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    company: Optional[str] = None
    description: str = Field(..., min_length=10)
    opportunity_type: str = "internship" # internship, full_time, part_time
    work_mode: str = "remote" # remote, on_site, hybrid
    location: str = "Remote"
    stipend_or_salary: Optional[str] = None
    eligibility: Optional[str] = None
    deadline: Optional[str] = None
    application_link: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    opportunity_type: Optional[str] = None
    work_mode: Optional[str] = None
    location: Optional[str] = None
    stipend_or_salary: Optional[str] = None
    eligibility: Optional[str] = None
    deadline: Optional[str] = None
    application_link: Optional[str] = None
    is_active: Optional[bool] = None

class ApplicationCreate(BaseModel):
    notes: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str # saved, applied, under_review, shortlisted, interview_scheduled, selected, rejected
    notes: Optional[str] = None

class InterviewCreate(BaseModel):
    application_id: int
    scheduled_time: datetime.datetime
    duration_minutes: int = 45
    meeting_link: Optional[str] = None
    interview_type: str = "technical"
    notes: Optional[str] = None

# --- Admin Schemas ---
class UserStatusUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    verification_notes: Optional[str] = None

class CareerRoleCreate(BaseModel):
    title: str
    slug: str
    description: str
    category: str = "Engineering"
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    related_skills: List[str] = []

class PlatformSettingUpdate(BaseModel):
    setting_key: str
    setting_value: str
    description: Optional[str] = None
