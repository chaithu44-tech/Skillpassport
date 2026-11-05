import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models import (
    User, StudentProfile, RecruiterProfile, Resume, ResumeAnalysis,
    CareerRole, RoleRequirement, Opportunity, Application, AuditLog,
    PlatformSetting, Notification
)
from backend.auth import require_admin
from backend.config import settings
from backend.schemas import (
    UserStatusUpdate, CareerRoleCreate, PlatformSettingUpdate
)
from backend.services.document_parser import DocumentParserService
from backend.services.ai_service import AIService
from backend.services.notification_service import NotificationService

router = APIRouter(prefix="/admin", tags=["Super Admin (Owner Only)"])

@router.get("/stats")
def get_admin_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Calculates live metrics exclusively from the database."""
    total_students = db.query(User).filter(User.role == "student").count()
    total_recruiters = db.query(User).filter(User.role == "recruiter").count()
    verified_recruiters = db.query(RecruiterProfile).filter(RecruiterProfile.is_verified == True).count()
    total_resumes = db.query(Resume).count()
    completed_analyses = db.query(ResumeAnalysis).filter(ResumeAnalysis.status == "completed").count()
    failed_jobs = db.query(Resume).filter(Resume.upload_status == "failed").count()
    active_opportunities = db.query(Opportunity).filter(Opportunity.is_active == True).count()
    total_applications = db.query(Application).count()
    active_users = db.query(User).filter(User.is_active == True).count()

    # Determine real AI Service status
    if settings.AI_API_KEY and len(settings.AI_API_KEY.strip()) > 5:
        ai_status = f"Active - Google Gemini ({settings.AI_MODEL})"
        ai_mode = "Cloud LLM"
    else:
        ai_status = "Active - Local Semantic Parser (Dev Mode)"
        ai_mode = "Local NLP"

    # Storage statistics
    storage_size_bytes = 0
    if settings.STORAGE_DIR.exists():
        for f in settings.STORAGE_DIR.rglob("*"):
            if f.is_file():
                storage_size_bytes += f.stat().st_size
    storage_mb = round(storage_size_bytes / (1024 * 1024), 2)

    return {
        "metrics": {
            "total_students": total_students,
            "total_recruiters": total_recruiters,
            "verified_recruiters": verified_recruiters,
            "total_resumes": total_resumes,
            "completed_ai_analyses": completed_analyses,
            "failed_processing_jobs": failed_jobs,
            "active_opportunities": active_opportunities,
            "total_applications": total_applications,
            "active_users": active_users
        },
        "system_health": {
            "status": "Operational",
            "database_engine": "SQLite / SQLAlchemy ORM",
            "ai_service_status": ai_status,
            "ai_mode": ai_mode,
            "storage_provider": settings.STORAGE_PROVIDER,
            "storage_usage_mb": storage_mb,
            "storage_path": str(settings.STORAGE_DIR)
        }
    }

@router.get("/users")
def list_users(
    role: Optional[str] = None,
    query: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Searches and filters all registered platform users."""
    q = db.query(User)
    if role and role != "all":
        q = q.filter(User.role == role)
    if query:
        term = f"%{query.strip()}%"
        q = q.filter(User.email.ilike(term))

    users = q.order_by(User.created_at.desc()).limit(100).all()
    results = []
    for u in users:
        name = u.email
        extra = {}
        if u.role == "student" and u.student_profile:
            name = u.student_profile.full_name
            extra = {
                "college": u.student_profile.college,
                "readiness_score": u.student_profile.readiness_score,
                "selected_role": u.student_profile.selected_role.title if u.student_profile.selected_role else None
            }
        elif u.role == "recruiter" and u.recruiter_profile:
            name = u.recruiter_profile.full_name
            extra = {
                "company": u.recruiter_profile.company_name,
                "is_verified": u.recruiter_profile.is_verified,
                "official_email": u.recruiter_profile.official_email
            }
        elif u.role == "admin":
            name = "Super Admin (Owner)"

        results.append({
            "id": u.id,
            "email": u.email,
            "name": name,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M"),
            "extra": extra
        })
    return results

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin controls: activate/suspend account, verify recruiter."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.email.lower() == settings.OWNER_EMAIL.lower() and payload.is_active is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate the website owner account.")

    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.is_verified is not None:
        user.is_verified = payload.is_verified
        if user.recruiter_profile:
            user.recruiter_profile.is_verified = payload.is_verified
            if payload.verification_notes:
                user.recruiter_profile.verification_notes = payload.verification_notes

    db.add(AuditLog(
        user_id=current_user.id,
        action="USER_STATUS_UPDATED",
        resource_type="user",
        resource_id=str(user.id),
        details={"email": user.email, "is_active": user.is_active, "is_verified": user.is_verified},
        ip_address=request.client.host if request.client else None
    ))
    db.commit()

    return {"message": "User status updated successfully."}

@router.get("/resumes/monitor")
def monitor_resumes(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Inspects resume processing pipeline, errors, and extracted metadata."""
    resumes = db.query(Resume).order_by(Resume.created_at.desc()).limit(50).all()
    results = []
    for r in resumes:
        results.append({
            "id": r.id,
            "student_id": r.student_id,
            "student_name": r.student.full_name if r.student else "Unknown",
            "file_name": r.file_name,
            "file_size": r.file_size,
            "file_type": r.file_type,
            "page_count": r.page_count,
            "upload_status": r.upload_status,
            "error_message": r.error_message,
            "ai_provider": r.analysis.ai_provider_used if r.analysis else None,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return results

@router.post("/resumes/{resume_id}/retry")
async def retry_resume_analysis(
    resume_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin action to re-run text extraction and AI analysis on a resume file."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=400, detail="Underlying resume file missing on storage disk.")

    try:
        extracted_text, page_count = DocumentParserService.parse_document(resume.file_path, resume.file_name)
        resume.extracted_text = extracted_text
        resume.page_count = page_count
        resume.upload_status = "parsed"
        resume.error_message = None

        ai_result = await AIService.analyze_resume(extracted_text)
        if resume.analysis:
            resume.analysis.personal_info = ai_result.get("personal_info")
            resume.analysis.technical_skills = ai_result.get("technical_skills")
            resume.analysis.other_info = ai_result.get("other_info")
            resume.analysis.quality_analysis = ai_result.get("quality_analysis")
            resume.analysis.ai_provider_used = ai_result.get("ai_provider_used")
            resume.analysis.status = "completed"
        else:
            analysis = ResumeAnalysis(
                resume_id=resume.id,
                student_id=resume.student_id,
                personal_info=ai_result.get("personal_info"),
                technical_skills=ai_result.get("technical_skills"),
                other_info=ai_result.get("other_info"),
                quality_analysis=ai_result.get("quality_analysis"),
                ai_provider_used=ai_result.get("ai_provider_used"),
                status="completed"
            )
            db.add(analysis)

        db.commit()
        return {"message": "Resume processing retried and completed successfully."}
    except Exception as e:
        resume.upload_status = "failed"
        resume.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Retry failed: {str(e)}")

@router.get("/career-roles")
def list_admin_career_roles(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Lists career roles with their full skill requirements and weights."""
    roles = db.query(CareerRole).order_by(CareerRole.title.asc()).all()
    results = []
    for r in roles:
        reqs = [
            {"id": rq.id, "skill_name": rq.skill_name, "type": rq.requirement_type, "weight": rq.weight}
            for rq in r.requirements
        ]
        results.append({
            "id": r.id,
            "title": r.title,
            "slug": r.slug,
            "category": r.category,
            "description": r.description,
            "is_active": r.is_active,
            "requirements": reqs
        })
    return results

@router.post("/career-roles")
def create_career_role(
    payload: CareerRoleCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Adds a new career role to the platform."""
    existing = db.query(CareerRole).filter(CareerRole.title.ilike(payload.title.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="A role with this title already exists.")

    role = CareerRole(
        title=payload.title.strip(),
        slug=payload.slug.strip().lower(),
        category=payload.category,
        description=payload.description.strip(),
        is_active=True
    )
    db.add(role)
    db.flush()

    for s in payload.required_skills:
        db.add(RoleRequirement(role_id=role.id, skill_name=s.strip(), requirement_type="required", weight=1.8))
    for s in payload.preferred_skills:
        db.add(RoleRequirement(role_id=role.id, skill_name=s.strip(), requirement_type="preferred", weight=1.2))
    for s in payload.related_skills:
        db.add(RoleRequirement(role_id=role.id, skill_name=s.strip(), requirement_type="related", weight=0.6))

    db.commit()
    return {"message": "Career role created successfully.", "role_id": role.id}

@router.delete("/career-roles/{role_id}")
def delete_career_role(
    role_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Deletes or deactivates a career role."""
    role = db.query(CareerRole).filter(CareerRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    db.delete(role)
    db.commit()
    return {"message": "Career role deleted."}

@router.get("/audit-logs")
def list_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Inspects immutable audit trail of system and administrative events."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "user_email": l.user.email if l.user else "System",
            "details": l.details,
            "ip_address": l.ip_address,
            "timestamp": l.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for l in logs
    ]

@router.get("/settings")
def list_platform_settings(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieves all platform settings."""
    settings_records = db.query(PlatformSetting).all()
    return [
        {"key": s.setting_key, "value": s.setting_value, "description": s.description}
        for s in settings_records
    ]

@router.put("/settings")
def update_platform_setting(
    payload: PlatformSettingUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Modifies platform settings."""
    setting = db.query(PlatformSetting).filter(PlatformSetting.setting_key == payload.setting_key).first()
    if not setting:
        setting = PlatformSetting(
            setting_key=payload.setting_key,
            setting_value=payload.setting_value,
            description=payload.description,
            updated_by_user_id=current_user.id
        )
        db.add(setting)
    else:
        setting.setting_value = payload.setting_value
        if payload.description:
            setting.description = payload.description
        setting.updated_by_user_id = current_user.id

    db.commit()
    return {"message": "Platform setting updated."}
