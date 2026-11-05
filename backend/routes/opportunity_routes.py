from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models import (
    Opportunity, OpportunityRequirement, Application, Interview,
    User, StudentProfile, Notification
)
from backend.auth import get_current_user, get_optional_current_user, require_student
from backend.schemas import ApplicationCreate, ApplicationStatusUpdate
from backend.services.notification_service import NotificationService

router = APIRouter(prefix="/opportunities", tags=["Opportunities Portal"])

@router.get("")
def list_opportunities(
    type: Optional[str] = None, # internship, full_time, part_time
    mode: Optional[str] = None, # remote, on_site, hybrid
    query: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Lists verified, active opportunities with dynamic AI skill-match scoring for logged-in students."""
    q = db.query(Opportunity).filter(Opportunity.is_active == True, Opportunity.verification_status == "verified")

    if type and type != "all":
        q = q.filter(Opportunity.opportunity_type == type)
    if mode and mode != "all":
        q = q.filter(Opportunity.work_mode == mode)
    if query:
        term = f"%{query.strip()}%"
        q = q.filter(or_(
            Opportunity.title.ilike(term),
            Opportunity.company.ilike(term),
            Opportunity.description.ilike(term),
            Opportunity.location.ilike(term)
        ))

    opportunities = q.order_by(Opportunity.created_at.desc()).all()

    # If student is logged in, calculate personalized match metrics
    student_skills_set = set()
    saved_app_map = {}
    if current_user and current_user.role == "student" and current_user.student_profile:
        sp = current_user.student_profile
        student_skills_set = {s.skill_name.lower().strip() for s in sp.skills}
        apps = db.query(Application).filter(Application.student_id == sp.id).all()
        saved_app_map = {a.opportunity_id: a.status for a in apps}

    results = []
    for opp in opportunities:
        req_skills = [r.skill_name for r in opp.requirements]
        matched = []
        missing = []
        for r_skill in req_skills:
            r_lower = r_skill.lower().strip()
            if any(r_lower in s or s in r_lower for s in student_skills_set):
                matched.append(r_skill)
            else:
                missing.append(r_skill)

        match_pct = round((len(matched) / len(req_skills) * 100.0), 0) if req_skills else 50.0

        results.append({
            "id": opp.id,
            "title": opp.title,
            "company": opp.company,
            "description": opp.description,
            "opportunity_type": opp.opportunity_type,
            "work_mode": opp.work_mode,
            "location": opp.location,
            "stipend_or_salary": opp.stipend_or_salary,
            "eligibility": opp.eligibility,
            "deadline": opp.deadline,
            "application_link": opp.application_link,
            "source": opp.source,
            "verification_status": opp.verification_status,
            "last_verified_at": opp.last_verified_at.strftime("%Y-%m-%d") if opp.last_verified_at else None,
            "required_skills": req_skills,
            "match_metrics": {
                "match_percentage": match_pct if student_skills_set else None,
                "matched_skills": matched,
                "missing_skills": missing
            },
            "application_status": saved_app_map.get(opp.id)
        })

    return results

@router.get("/{opp_id}")
def get_opportunity_details(
    opp_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Detailed view for single verified opportunity."""
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp or not opp.is_active:
        raise HTTPException(status_code=404, detail="Opportunity not found or expired.")

    req_skills = [r.skill_name for r in opp.requirements]
    student_skills_set = set()
    app_status = None
    if current_user and current_user.role == "student" and current_user.student_profile:
        sp = current_user.student_profile
        student_skills_set = {s.skill_name.lower().strip() for s in sp.skills}
        existing_app = db.query(Application).filter(Application.student_id == sp.id, Application.opportunity_id == opp.id).first()
        if existing_app:
            app_status = existing_app.status

    matched = [s for s in req_skills if any(s.lower() in sk or sk in s.lower() for sk in student_skills_set)]
    missing = [s for s in req_skills if s not in matched]
    match_pct = round((len(matched) / len(req_skills) * 100.0), 0) if req_skills else 50.0

    return {
        "id": opp.id,
        "title": opp.title,
        "company": opp.company,
        "description": opp.description,
        "opportunity_type": opp.opportunity_type,
        "work_mode": opp.work_mode,
        "location": opp.location,
        "stipend_or_salary": opp.stipend_or_salary,
        "eligibility": opp.eligibility,
        "deadline": opp.deadline,
        "application_link": opp.application_link,
        "source": opp.source,
        "verification_status": opp.verification_status,
        "last_verified_at": opp.last_verified_at.strftime("%Y-%m-%d") if opp.last_verified_at else None,
        "required_skills": req_skills,
        "match_percentage": match_pct if student_skills_set else None,
        "matched_skills": matched,
        "missing_skills": missing,
        "application_status": app_status
    }

@router.post("/{opp_id}/apply")
def apply_to_opportunity(
    opp_id: int,
    payload: ApplicationCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Records an application to an opportunity and triggers notifications."""
    sp = current_user.student_profile
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id, Opportunity.is_active == True).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    app = db.query(Application).filter(Application.student_id == sp.id, Application.opportunity_id == opp.id).first()
    if app:
        app.status = "applied"
        if payload.notes:
            app.notes = payload.notes
    else:
        app = Application(
            student_id=sp.id,
            opportunity_id=opp.id,
            status="applied",
            notes=payload.notes
        )
        db.add(app)

    db.commit()

    # Notify student
    NotificationService.send_notification(
        db=db,
        user_id=current_user.id,
        title="Application Recorded",
        message=f"Application for '{opp.title}' at {opp.company} recorded to your tracker.",
        notification_type="success",
        action_link="#student/applications"
    )

    # If opportunity is posted by a recruiter, notify recruiter
    if opp.recruiter and opp.recruiter.user:
        NotificationService.send_notification(
            db=db,
            user_id=opp.recruiter.user.id,
            title="New Candidate Application",
            message=f"{sp.full_name} applied for your '{opp.title}' opening.",
            notification_type="info",
            action_link="#recruiter/applicants"
        )

    return {"message": "Application submitted and tracked successfully.", "application_id": app.id}

@router.post("/{opp_id}/save")
def save_opportunity(
    opp_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Saves opportunity to student's tracker under 'saved' status."""
    sp = current_user.student_profile
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id, Opportunity.is_active == True).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    app = db.query(Application).filter(Application.student_id == sp.id, Application.opportunity_id == opp.id).first()
    if not app:
        app = Application(
            student_id=sp.id,
            opportunity_id=opp.id,
            status="saved"
        )
        db.add(app)
        db.commit()

    return {"message": "Opportunity saved to your application tracker."}

@router.get("/tracker/my-applications")
def get_student_applications(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Returns all tracked applications for the logged-in student."""
    sp = current_user.student_profile
    apps = db.query(Application).filter(Application.student_id == sp.id).order_by(Application.applied_at.desc()).all()

    results = []
    for a in apps:
        opp = a.opportunity
        interviews = [
            {
                "id": i.id,
                "scheduled_time": i.scheduled_time.isoformat(),
                "duration_minutes": i.duration_minutes,
                "meeting_link": i.meeting_link,
                "interview_type": i.interview_type,
                "status": i.status
            }
            for i in a.interviews
        ]
        results.append({
            "application_id": a.id,
            "opportunity_id": opp.id,
            "title": opp.title,
            "company": opp.company,
            "opportunity_type": opp.opportunity_type,
            "work_mode": opp.work_mode,
            "location": opp.location,
            "stipend_or_salary": opp.stipend_or_salary,
            "deadline": opp.deadline,
            "status": a.status,
            "notes": a.notes,
            "applied_at": a.applied_at.strftime("%Y-%m-%d %H:%M"),
            "interviews": interviews
        })

    # Summary counts
    counts = {
        "total": len(results),
        "saved": sum(1 for r in results if r["status"] == "saved"),
        "applied": sum(1 for r in results if r["status"] == "applied"),
        "under_review": sum(1 for r in results if r["status"] == "under_review"),
        "shortlisted": sum(1 for r in results if r["status"] == "shortlisted"),
        "interview_scheduled": sum(1 for r in results if r["status"] == "interview_scheduled"),
        "selected": sum(1 for r in results if r["status"] == "selected"),
        "rejected": sum(1 for r in results if r["status"] == "rejected")
    }

    return {"applications": results, "summary": counts}

@router.patch("/tracker/applications/{app_id}")
def update_application_status(
    app_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Allows student to update their personal notes or local status tracking."""
    sp = current_user.student_profile
    app = db.query(Application).filter(Application.id == app_id, Application.student_id == sp.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if payload.status:
        app.status = payload.status
    if payload.notes is not None:
        app.notes = payload.notes
    db.commit()
    return {"message": "Application tracker updated successfully."}
