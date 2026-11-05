import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, Index, JSON
)
from sqlalchemy.orm import relationship
from backend.database import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

# 1. User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student") # student, recruiter, admin
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recruiter_profile = relationship("RecruiterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    owner_account = relationship("OwnerAccount", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

# 2. Student Profile Model
class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    college = Column(String(255), nullable=True)
    course_branch = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    
    # Preferences & Role Targeting
    experience_level = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    career_goal = Column(String(100), default="Internship") # Internship, Entry-level job, Placement preparation, Advanced career preparation
    preparation_timeline = Column(String(50), default="3 months") # 1 month, 3 months, 6 months, 12 months
    selected_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    readiness_score = Column(Float, default=0.0) # 0 to 100
    readiness_level = Column(String(50), default="Beginner") # Beginner, Developing, Nearly Ready, Strong Match
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    selected_role = relationship("CareerRole")
    resumes = relationship("Resume", back_populates="student", cascade="all, delete-orphan")
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="student", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="student", cascade="all, delete-orphan")

# 3. Recruiter Profile Model
class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    official_email = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    company_website = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    company_description = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    user = relationship("User", back_populates="recruiter_profile")
    opportunities = relationship("Opportunity", back_populates="recruiter", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="recruiter")

# 4. Owner Account Model
class OwnerAccount(Base):
    __tablename__ = "owner_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bootstrap_secret_hash = Column(String(255), nullable=False)
    is_bootstrapped = Column(Boolean, default=True)
    bootstrapped_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="owner_account")

# 5. Resume Model
class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False) # .pdf or .docx
    extracted_text = Column(Text, nullable=True)
    page_count = Column(Integer, default=1)
    upload_status = Column(String(50), default="uploaded") # uploaded, processing, parsed, failed
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    student = relationship("StudentProfile", back_populates="resumes")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False, cascade="all, delete-orphan")

# 6. Resume Analysis Model
class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    
    # Structured Extracted Fields (stored as JSON)
    personal_info = Column(JSON, nullable=True)     # name, email, phone, college, degree, grad_year
    technical_skills = Column(JSON, nullable=True)  # languages, frameworks, databases, tools, cloud, aiml
    other_info = Column(JSON, nullable=True)        # projects, internships, work_exp, certs, extracurriculars
    quality_analysis = Column(JSON, nullable=True)  # structure, descriptions, missing_sections, readability, suggestions
    
    ai_provider_used = Column(String(100), default="Local Semantic Parser")
    raw_ai_response = Column(Text, nullable=True)
    status = Column(String(50), default="completed") # processing, completed, failed
    created_at = Column(DateTime, default=utcnow)
    
    resume = relationship("Resume", back_populates="analysis")

# 7. Global Skill Model
class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False) # language, framework, database, tool, cloud, aiml, soft_skill
    is_verified = Column(Boolean, default=True)

# 8. Student Skill Model (Distinguishes resume vs manual skills)
class StudentSkill(Base):
    __tablename__ = "student_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), index=True, nullable=False)
    category = Column(String(50), nullable=False)
    source = Column(String(50), default="resume_extracted") # resume_extracted, manual
    proficiency_level = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced
    evidence_note = Column(Text, nullable=True) # proof, course link or project where used
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    
    student = relationship("StudentProfile", back_populates="skills")

# 9. Career Role Model
class CareerRole(Base):
    __tablename__ = "career_roles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # Engineering, Data & AI, Cloud & Security, Design
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    requirements = relationship("RoleRequirement", back_populates="role", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="career_role")

# 10. Role Requirement Model
class RoleRequirement(Base):
    __tablename__ = "role_requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), index=True, nullable=False)
    requirement_type = Column(String(50), default="required") # required, preferred, related
    weight = Column(Float, default=1.0) # 0.5 to 2.0
    minimum_proficiency = Column(String(50), default="Intermediate")
    
    role = relationship("CareerRole", back_populates="requirements")

# 11. Project Model
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    technologies_used = Column(String(255), nullable=True)
    project_url = Column(String(255), nullable=True)
    source = Column(String(50), default="manual") # resume_extracted, manual
    created_at = Column(DateTime, default=utcnow)
    
    student = relationship("StudentProfile", back_populates="projects")

# 12. Certification Model
class Certification(Base):
    __tablename__ = "certifications"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    issuing_organization = Column(String(255), nullable=True)
    issue_date = Column(String(100), nullable=True)
    certificate_url = Column(String(255), nullable=True)
    credential_id = Column(String(100), nullable=True)
    source = Column(String(50), default="manual") # resume_extracted, manual
    created_at = Column(DateTime, default=utcnow)
    
    student = relationship("StudentProfile", back_populates="certifications")

# 13. Learning Roadmap Model
class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    total_phases = Column(Integer, default=0)
    completed_phases = Column(Integer, default=0)
    progress_percentage = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    student = relationship("StudentProfile", back_populates="roadmaps")
    career_role = relationship("CareerRole", back_populates="roadmaps")
    activities = relationship("RoadmapActivity", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapActivity.order_index")

# 14. Roadmap Activity Model
class RoadmapActivity(Base):
    __tablename__ = "roadmap_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), nullable=False)
    phase_number = Column(Integer, nullable=False)
    phase_title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    learning_objective = Column(Text, nullable=True)
    estimated_duration = Column(String(100), default="1 week")
    recommended_resources = Column(JSON, nullable=True) # list of {title, url, type}
    practical_task = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    order_index = Column(Integer, default=0)
    
    roadmap = relationship("LearningRoadmap", back_populates="activities")

# 15. Opportunity Model (Internships and Jobs)
class Opportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiter_profiles.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    opportunity_type = Column(String(50), default="internship") # internship, full_time, part_time
    work_mode = Column(String(50), default="remote") # remote, on_site, hybrid
    location = Column(String(255), default="Remote / Hybrid")
    stipend_or_salary = Column(String(100), nullable=True)
    eligibility = Column(Text, nullable=True)
    deadline = Column(String(100), nullable=True)
    application_link = Column(String(512), nullable=True)
    verification_status = Column(String(50), default="verified") # verified, pending, rejected
    source = Column(String(100), default="Verified Partner")
    is_active = Column(Boolean, default=True)
    last_verified_at = Column(DateTime, default=utcnow)
    created_at = Column(DateTime, default=utcnow)
    
    recruiter = relationship("RecruiterProfile", back_populates="opportunities")
    requirements = relationship("OpportunityRequirement", back_populates="opportunity", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")

# 16. Opportunity Requirement Model
class OpportunityRequirement(Base):
    __tablename__ = "opportunity_requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    
    opportunity = relationship("Opportunity", back_populates="requirements")

# 17. Application Model
class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="applied") # saved, applied, under_review, shortlisted, interview_scheduled, selected, rejected
    notes = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    student = relationship("StudentProfile", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")

# 18. Interview Model
class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    recruiter_id = Column(Integer, ForeignKey("recruiter_profiles.id", ondelete="CASCADE"), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=45)
    meeting_link = Column(String(512), nullable=True)
    interview_type = Column(String(50), default="technical") # technical, hr, cultural
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="scheduled") # scheduled, completed, rescheduled, cancelled
    created_at = Column(DateTime, default=utcnow)
    
    application = relationship("Application", back_populates="interviews")
    student = relationship("StudentProfile", back_populates="interviews")
    recruiter = relationship("RecruiterProfile", back_populates="interviews")

# 19. Notification Model
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info") # info, success, warning, system
    action_link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="notifications")

# 20. Audit Log Model
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="audit_logs")

# 21. Platform Setting Model
class PlatformSetting(Base):
    __tablename__ = "platform_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, index=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
