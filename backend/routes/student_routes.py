import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import (
    User, StudentProfile, Resume, ResumeAnalysis, CareerRole, StudentSkill,
    Project, Certification, LearningRoadmap, RoadmapActivity, Opportunity
)
from backend.auth import require_student, get_optional_current_user
from backend.config import settings
from backend.services.document_parser import DocumentParserService, DocumentParseError
from backend.services.ai_service import AIService
from backend.services.career_engine import CareerEngine
from backend.services.roadmap_engine import RoadmapEngine
from backend.services.notification_service import NotificationService
from backend.schemas import (
    StudentProfileUpdate, StudentSkillCreate, ProjectCreate, CertificationCreate,
    RoleSelectionRequest, RoadmapActivityUpdate
)

router = APIRouter(prefix="/student", tags=["Student Portal"])

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Secure multi-page PDF/DOCX resume upload, text extraction, and AI analysis."""
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not found.")

    # 1. Read bytes and validate
    file_bytes = await file.read()
    try:
        ext = DocumentParserService.validate_file(file.filename, file_bytes, max_mb=settings.MAX_FILE_SIZE_MB)
    except DocumentParseError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Store file in student-isolated private directory
    student_dir = settings.STORAGE_DIR / f"student_{student.id}"
    student_dir.mkdir(parents=True, exist_ok=True)
    
    # Clean filename
    safe_name = Path(file.filename).name.replace(" ", "_")
    target_path = student_dir / safe_name
    with open(target_path, "wb") as f:
        f.write(file_bytes)

    # 3. Extract text using PyMuPDF / python-docx
    try:
        extracted_text, page_count = DocumentParserService.parse_document(str(target_path), file.filename)
    except DocumentParseError as e:
        # Save failed resume record for transparency
        failed_resume = Resume(
            student_id=student.id,
            file_name=file.filename,
            file_path=str(target_path),
            file_size=len(file_bytes),
            file_type=ext,
            upload_status="failed",
            error_message=str(e)
        )
        db.add(failed_resume)
        db.commit()
        NotificationService.send_notification(
            db=db,
            user_id=current_user.id,
            title="Resume Processing Failed",
            message=f"Extraction error for '{file.filename}': {str(e)}",
            notification_type="error",
            action_link="#student/resume"
        )
        raise HTTPException(status_code=400, detail=str(e))

    # 4. Save Resume record
    resume_record = Resume(
        student_id=student.id,
        file_name=file.filename,
        file_path=str(target_path),
        file_size=len(file_bytes),
        file_type=ext,
        extracted_text=extracted_text,
        page_count=page_count,
        upload_status="parsed"
    )
    db.add(resume_record)
    db.flush()

    # 5. AI Resume Analysis Engine
    ai_result = await AIService.analyze_resume(extracted_text)

    # 6. Save ResumeAnalysis record
    analysis_record = ResumeAnalysis(
        resume_id=resume_record.id,
        student_id=student.id,
        personal_info=ai_result.get("personal_info"),
        technical_skills=ai_result.get("technical_skills"),
        other_info=ai_result.get("other_info"),
        quality_analysis=ai_result.get("quality_analysis"),
        ai_provider_used=ai_result.get("ai_provider_used", "Local Semantic Parser"),
        status="completed"
    )
    db.add(analysis_record)

    # 7. Sync extracted skills to student profile
    tech_skills = ai_result.get("technical_skills", {})
    all_extracted = []
    for cat, skills in tech_skills.items():
        for s in skills:
            all_extracted.append((s, cat))
            
    # Add new skills if not already present
    existing_skills = {s.skill_name.lower(): s for s in student.skills}
    for s_name, cat in all_extracted:
        if s_name.lower() not in existing_skills:
            db.add(StudentSkill(
                student_id=student.id,
                skill_name=s_name,
                category=cat,
                source="resume_extracted",
                proficiency_level="Intermediate",
                verified=True
            ))

    # 8. Sync personal info if not set
    p_info = ai_result.get("personal_info", {})
    if p_info.get("phone") and p_info["phone"] != "Not found in resume" and not student.phone:
        student.phone = p_info["phone"]
    if p_info.get("college") and p_info["college"] != "Not found in resume" and not student.college:
        student.college = p_info["college"]
    if p_info.get("degree") and p_info["degree"] != "Not found in resume" and not student.course_branch:
        student.course_branch = p_info["degree"]

    db.commit()

    # 9. Send success notification
    NotificationService.send_notification(
        db=db,
        user_id=current_user.id,
        title="Resume Analysis Completed",
        message=f"Successfully analyzed '{file.filename}'. Found {len(all_extracted)} technical competencies and quality recommendations.",
        notification_type="success",
        action_link="#student/analysis"
    )

    return {
        "resume_id": resume_record.id,
        "file_name": resume_record.file_name,
        "page_count": resume_record.page_count,
        "upload_status": resume_record.upload_status,
        "analysis": {
            "personal_info": analysis_record.personal_info,
            "technical_skills": analysis_record.technical_skills,
            "other_info": analysis_record.other_info,
            "quality_analysis": analysis_record.quality_analysis,
            "ai_provider_used": analysis_record.ai_provider_used
        }
    }

@router.get("/resume")
def get_student_resume(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Retrieves student's active resume and latest analysis."""
    student = current_user.student_profile
    resume = db.query(Resume).filter(
        Resume.student_id == student.id
    ).order_by(Resume.created_at.desc()).first()

    if not resume:
        return {"has_resume": False, "resume": None, "analysis": None}

    analysis = resume.analysis
    return {
        "has_resume": True,
        "resume": {
            "id": resume.id,
            "file_name": resume.file_name,
            "file_size": resume.file_size,
            "file_type": resume.file_type,
            "page_count": resume.page_count,
            "upload_status": resume.upload_status,
            "created_at": resume.created_at.isoformat()
        },
        "analysis": {
            "personal_info": analysis.personal_info if analysis else None,
            "technical_skills": analysis.technical_skills if analysis else None,
            "other_info": analysis.other_info if analysis else None,
            "quality_analysis": analysis.quality_analysis if analysis else None,
            "ai_provider_used": analysis.ai_provider_used if analysis else None,
            "created_at": analysis.created_at.isoformat() if analysis else None
        } if analysis else None
    }

@router.delete("/resume")
def remove_resume(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Allows student to remove their resume to upload an updated version."""
    student = current_user.student_profile
    resumes = db.query(Resume).filter(Resume.student_id == student.id).all()
    for r in resumes:
        if os.path.exists(r.file_path):
            try:
                os.remove(r.file_path)
            except Exception:
                pass
        db.delete(r)
    db.commit()
    return {"message": "Resume removed successfully. You may now upload a fresh document."}

@router.get("/career-roles")
def list_career_roles(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Returns all available career roles for selection."""
    roles = db.query(CareerRole).filter(CareerRole.is_active == True).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "slug": r.slug,
            "category": r.category,
            "description": r.description,
            "core_skills": [req.skill_name for req in r.requirements if req.requirement_type == "required"][:4]
        }
        for r in roles
    ]

@router.post("/select-role")
def select_career_role(
    payload: RoleSelectionRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Stores student's chosen career role, answers, computes compatibility, and generates roadmap."""
    student = current_user.student_profile
    
    # 1. Resolve role
    role = None
    if payload.role_id:
        role = db.query(CareerRole).filter(CareerRole.id == payload.role_id).first()
    elif payload.custom_role_title:
        role = db.query(CareerRole).filter(CareerRole.title.ilike(payload.custom_role_title.strip())).first()
        if not role:
            # Create on-the-fly custom role
            role = CareerRole(
                title=payload.custom_role_title.strip(),
                slug=payload.custom_role_title.strip().lower().replace(" ", "-"),
                category="Specialized Domain",
                description=f"Custom career path for {payload.custom_role_title.strip()}",
                is_active=True
            )
            db.add(role)
            db.flush()

    if not role:
        raise HTTPException(status_code=400, detail="Please select a valid career role.")

    # 2. Update Student Profile answers
    student.selected_role_id = role.id
    student.experience_level = payload.experience_level
    student.career_goal = payload.career_goal
    student.preparation_timeline = payload.preparation_timeline

    # 3. Gather student skills
    student_skills = [s.skill_name for s in student.skills]

    # 4. Evaluate compatibility
    eval_result = CareerEngine.evaluate_role_compatibility(
        student_skills=student_skills,
        role=role,
        experience_level=payload.experience_level,
        career_goal=payload.career_goal,
        preparation_timeline=payload.preparation_timeline
    )

    student.readiness_score = eval_result["compatibility_score"]
    student.readiness_level = eval_result["career_readiness"]

    # 5. Generate personalized learning roadmap
    roadmap = RoadmapEngine.generate_roadmap(
        db=db,
        student=student,
        role=role,
        missing_skills=eval_result["missing_skills"]
    )

    db.commit()

    NotificationService.send_notification(
        db=db,
        user_id=current_user.id,
        title=f"Career Roadmap Generated for {role.title}",
        message=f"Career compatibility evaluated at {eval_result['compatibility_score']}%. Your personalized {len(roadmap.activities)}-phase learning roadmap is ready.",
        notification_type="success",
        action_link="#student/roadmap"
    )

    return {
        "role_selection": {
            "role_id": role.id,
            "role_title": role.title,
            "experience_level": student.experience_level,
            "career_goal": student.career_goal,
            "preparation_timeline": student.preparation_timeline
        },
        "compatibility": eval_result,
        "roadmap_id": roadmap.id
    }

@router.get("/career-analysis")
def get_career_analysis(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Gets latest career compatibility evaluation for the student's selected role."""
    student = current_user.student_profile
    if not student.selected_role_id:
        return {"has_selected_role": False, "analysis": None}

    role = db.query(CareerRole).filter(CareerRole.id == student.selected_role_id).first()
    if not role:
        return {"has_selected_role": False, "analysis": None}

    student_skills = [s.skill_name for s in student.skills]
    eval_result = CareerEngine.evaluate_role_compatibility(
        student_skills=student_skills,
        role=role,
        experience_level=student.experience_level or "Beginner",
        career_goal=student.career_goal or "Internship",
        preparation_timeline=student.preparation_timeline or "3 months"
    )

    return {
        "has_selected_role": True,
        "role": {
            "id": role.id,
            "title": role.title,
            "category": role.category,
            "description": role.description
        },
        "student_preferences": {
            "experience_level": student.experience_level,
            "career_goal": student.career_goal,
            "preparation_timeline": student.preparation_timeline
        },
        "analysis": eval_result
    }

@router.get("/roadmap")
def get_roadmap(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Retrieves active learning roadmap and activities."""
    student = current_user.student_profile
    roadmap = db.query(LearningRoadmap).filter(
        LearningRoadmap.student_id == student.id,
        LearningRoadmap.is_active == True
    ).order_by(LearningRoadmap.created_at.desc()).first()

    if not roadmap:
        return {"has_roadmap": False, "roadmap": None}

    activities_data = [
        {
            "id": a.id,
            "phase_number": a.phase_number,
            "phase_title": a.phase_title,
            "topic": a.topic,
            "description": a.description,
            "learning_objective": a.learning_objective,
            "estimated_duration": a.estimated_duration,
            "recommended_resources": a.recommended_resources,
            "practical_task": a.practical_task,
            "is_completed": a.is_completed,
            "completed_at": a.completed_at.isoformat() if a.completed_at else None,
            "order_index": a.order_index
        }
        for a in roadmap.activities
    ]

    return {
        "has_roadmap": True,
        "roadmap": {
            "id": roadmap.id,
            "title": roadmap.title,
            "summary": roadmap.summary,
            "role_title": roadmap.career_role.title if roadmap.career_role else "",
            "total_phases": roadmap.total_phases,
            "completed_phases": roadmap.completed_phases,
            "progress_percentage": roadmap.progress_percentage,
            "activities": activities_data
        }
    }

@router.patch("/roadmap/activity/{activity_id}")
def update_roadmap_activity(
    activity_id: int,
    payload: RoadmapActivityUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Checks off or unchecks a learning activity and updates roadmap progress."""
    student = current_user.student_profile
    try:
        activity, roadmap = RoadmapEngine.update_activity_status(
            db=db,
            activity_id=activity_id,
            is_completed=payload.is_completed,
            student_id=student.id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {
        "activity_id": activity.id,
        "is_completed": activity.is_completed,
        "completed_at": activity.completed_at.isoformat() if activity.completed_at else None,
        "roadmap_progress": {
            "progress_percentage": roadmap.progress_percentage,
            "completed_phases": roadmap.completed_phases,
            "total_phases": roadmap.total_phases
        }
    }

@router.post("/roadmap/regenerate")
def regenerate_roadmap(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Regenerates roadmap for the currently selected career role."""
    student = current_user.student_profile
    if not student.selected_role_id:
        raise HTTPException(status_code=400, detail="No career role selected yet.")

    role = db.query(CareerRole).filter(CareerRole.id == student.selected_role_id).first()
    student_skills = [s.skill_name for s in student.skills]
    eval_result = CareerEngine.evaluate_role_compatibility(
        student_skills=student_skills,
        role=role,
        experience_level=student.experience_level or "Beginner",
        career_goal=student.career_goal or "Internship",
        preparation_timeline=student.preparation_timeline or "3 months"
    )

    roadmap = RoadmapEngine.generate_roadmap(
        db=db,
        student=student,
        role=role,
        missing_skills=eval_result["missing_skills"]
    )

    return {"message": "Roadmap regenerated successfully.", "roadmap_id": roadmap.id}

@router.get("/profile")
def get_student_full_profile(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Returns detailed student profile distinguishing resume vs manual skills."""
    sp = current_user.student_profile
    resume_skills = [
        {"id": s.id, "name": s.skill_name, "category": s.category, "source": s.source, "proficiency": s.proficiency_level}
        for s in sp.skills if s.source == "resume_extracted"
    ]
    manual_skills = [
        {"id": s.id, "name": s.skill_name, "category": s.category, "source": s.source, "proficiency": s.proficiency_level, "evidence": s.evidence_note}
        for s in sp.skills if s.source == "manual"
    ]
    projects = [
        {"id": p.id, "title": p.title, "description": p.description, "technologies": p.technologies_used, "url": p.project_url, "source": p.source}
        for p in sp.projects
    ]
    certifications = [
        {"id": c.id, "title": c.title, "organization": c.issuing_organization, "date": c.issue_date, "url": c.certificate_url, "credential_id": c.credential_id}
        for c in sp.certifications
    ]

    return {
        "id": sp.id,
        "full_name": sp.full_name,
        "email": current_user.email,
        "college": sp.college,
        "course_branch": sp.course_branch,
        "graduation_year": sp.graduation_year,
        "bio": sp.bio,
        "phone": sp.phone,
        "linkedin_url": sp.linkedin_url,
        "github_url": sp.github_url,
        "experience_level": sp.experience_level,
        "career_goal": sp.career_goal,
        "preparation_timeline": sp.preparation_timeline,
        "readiness_score": sp.readiness_score,
        "readiness_level": sp.readiness_level,
        "selected_role": {
            "id": sp.selected_role.id,
            "title": sp.selected_role.title
        } if sp.selected_role else None,
        "resume_skills": resume_skills,
        "manual_skills": manual_skills,
        "projects": projects,
        "certifications": certifications
    }

@router.put("/profile")
def update_student_profile(
    payload: StudentProfileUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Updates student profile fields."""
    sp = current_user.student_profile
    for key, val in payload.dict(exclude_unset=True).items():
        if hasattr(sp, key):
            setattr(sp, key, val)
    db.commit()
    return {"message": "Profile updated successfully."}

@router.post("/skills")
def add_manual_skill(
    payload: StudentSkillCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Adds a manually entered skill with optional evidence note."""
    sp = current_user.student_profile
    skill = StudentSkill(
        student_id=sp.id,
        skill_name=payload.skill_name.strip(),
        category=payload.category,
        source="manual",
        proficiency_level=payload.proficiency_level,
        evidence_note=payload.evidence_note,
        verified=True
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return {"message": "Skill added.", "skill": {"id": skill.id, "name": skill.skill_name, "category": skill.category, "source": skill.source}}

@router.delete("/skills/{skill_id}")
def delete_student_skill(
    skill_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Removes a skill from student profile."""
    sp = current_user.student_profile
    skill = db.query(StudentSkill).filter(StudentSkill.id == skill_id, StudentSkill.student_id == sp.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted."}

@router.post("/projects")
def add_student_project(
    payload: ProjectCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    sp = current_user.student_profile
    proj = Project(
        student_id=sp.id,
        title=payload.title.strip(),
        description=payload.description,
        technologies_used=payload.technologies_used,
        project_url=payload.project_url,
        source="manual"
    )
    db.add(proj)
    db.commit()
    return {"message": "Project added successfully."}

@router.post("/certifications")
def add_student_certification(
    payload: CertificationCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    sp = current_user.student_profile
    cert = Certification(
        student_id=sp.id,
        title=payload.title.strip(),
        issuing_organization=payload.issuing_organization,
        issue_date=payload.issue_date,
        certificate_url=payload.certificate_url,
        credential_id=payload.credential_id,
        source="manual"
    )
    db.add(cert)
    db.commit()
    return {"message": "Certification added successfully."}

@router.get("/dashboard")
def get_student_dashboard(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Consolidated student dashboard metrics from database."""
    sp = current_user.student_profile
    latest_resume = db.query(Resume).filter(Resume.student_id == sp.id).order_by(Resume.created_at.desc()).first()
    active_roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.student_id == sp.id, LearningRoadmap.is_active == True).first()

    # Calculate skill statistics
    all_skills = [s.skill_name for s in sp.skills]
    missing_skills = []
    if sp.selected_role:
        eval_res = CareerEngine.evaluate_role_compatibility(
            student_skills=all_skills,
            role=sp.selected_role,
            experience_level=sp.experience_level or "Beginner",
            career_goal=sp.career_goal or "Internship",
            preparation_timeline=sp.preparation_timeline or "3 months"
        )
        missing_skills = eval_res.get("missing_skills", [])[:5]

    # Get recommended opportunities matching student skills
    opportunities = db.query(Opportunity).filter(Opportunity.is_active == True).limit(4).all()
    recommended_opps = []
    for opp in opportunities:
        req_skills = [r.skill_name for r in opp.requirements]
        matched = [s for s in req_skills if any(s.lower() in sk.lower() or sk.lower() in s.lower() for sk in all_skills)]
        match_pct = round((len(matched) / len(req_skills) * 100.0), 0) if req_skills else 50.0
        recommended_opps.append({
            "id": opp.id,
            "title": opp.title,
            "company": opp.company,
            "opportunity_type": opp.opportunity_type,
            "work_mode": opp.work_mode,
            "location": opp.location,
            "stipend_or_salary": opp.stipend_or_salary,
            "match_percentage": match_pct,
            "matched_skills": matched
        })

    # Recent notifications
    notifications = NotificationService.get_user_notifications(db=db, user_id=current_user.id, limit=5)

    return {
        "student": {
            "id": sp.id,
            "full_name": sp.full_name,
            "college": sp.college,
            "readiness_score": sp.readiness_score,
            "readiness_level": sp.readiness_level,
            "selected_role": sp.selected_role.title if sp.selected_role else None
        },
        "resume_status": {
            "has_resume": latest_resume is not None,
            "file_name": latest_resume.file_name if latest_resume else None,
            "upload_status": latest_resume.upload_status if latest_resume else None,
            "uploaded_at": latest_resume.created_at.isoformat() if latest_resume else None
        },
        "skills_summary": {
            "total_skills": len(sp.skills),
            "resume_extracted": len([s for s in sp.skills if s.source == "resume_extracted"]),
            "manual_added": len([s for s in sp.skills if s.source == "manual"]),
            "missing_skills": missing_skills
        },
        "roadmap_progress": {
            "has_roadmap": active_roadmap is not None,
            "progress_percentage": active_roadmap.progress_percentage if active_roadmap else 0.0,
            "completed_phases": active_roadmap.completed_phases if active_roadmap else 0,
            "total_phases": active_roadmap.total_phases if active_roadmap else 0
        },
        "recommended_opportunities": recommended_opps,
        "recent_notifications": [
            {"id": n.id, "title": n.title, "message": n.message, "type": n.notification_type, "is_read": n.is_read, "created_at": n.created_at.isoformat()}
            for n in notifications
        ]
    }
