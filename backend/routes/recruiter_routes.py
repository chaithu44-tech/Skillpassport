from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models import (
    User, RecruiterProfile, Opportunity, OpportunityRequirement,
    Application, Interview, StudentProfile, StudentSkill
)
from backend.auth import require_recruiter, require_verified_recruiter
from backend.schemas import (
    OpportunityCreate, OpportunityUpdate, ApplicationStatusUpdate, InterviewCreate
)
from backend.services.notification_service import NotificationService

router = APIRouter(prefix="/recruiter", tags=["Recruiter Portal"])

@router.get("/dashboard")
def get_recruiter_dashboard(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Consolidated recruiter dashboard metrics from database."""
    rp = current_user.recruiter_profile
    my_opportunities = db.query(Opportunity).filter(Opportunity.recruiter_id == rp.id).all()
    opp_ids = [o.id for o in my_opportunities]

    total_applications = 0
    shortlisted_candidates = 0
    applications = []
    if opp_ids:
        applications = db.query(Application).filter(Application.opportunity_id.in_(opp_ids)).all()
        total_applications = len(applications)
        shortlisted_candidates = sum(1 for a in applications if a.status in ["shortlisted", "interview_scheduled", "selected"])

    interviews = db.query(Interview).filter(Interview.recruiter_id == rp.id).order_by(Interview.scheduled_time.desc()).limit(5).all()

    return {
        "recruiter_profile": {
            "id": rp.id,
            "full_name": rp.full_name,
            "company_name": rp.company_name,
            "is_verified": rp.is_verified,
            "verification_notes": rp.verification_notes
        },
        "stats": {
            "active_listings": len([o for o in my_opportunities if o.is_active]),
            "total_listings": len(my_opportunities),
            "total_applications": total_applications,
            "shortlisted_candidates": shortlisted_candidates,
            "scheduled_interviews": len(interviews)
        },
        "recent_interviews": [
            {
                "id": i.id,
                "student_name": i.student.full_name if i.student else "Candidate",
                "scheduled_time": i.scheduled_time.isoformat(),
                "interview_type": i.interview_type,
                "status": i.status,
                "meeting_link": i.meeting_link
            }
            for i in interviews
        ]
    }

@router.get("/opportunities")
def list_recruiter_opportunities(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Lists all opportunities created by this recruiter."""
    rp = current_user.recruiter_profile
    opps = db.query(Opportunity).filter(Opportunity.recruiter_id == rp.id).order_by(Opportunity.created_at.desc()).all()
    results = []
    for o in opps:
        app_count = db.query(Application).filter(Application.opportunity_id == o.id).count()
        results.append({
            "id": o.id,
            "title": o.title,
            "company": o.company,
            "opportunity_type": o.opportunity_type,
            "work_mode": o.work_mode,
            "location": o.location,
            "stipend_or_salary": o.stipend_or_salary,
            "deadline": o.deadline,
            "is_active": o.is_active,
            "verification_status": o.verification_status,
            "application_count": app_count,
            "required_skills": [r.skill_name for r in o.requirements]
        })
    return results

@router.post("/opportunities")
def create_recruiter_opportunity(
    payload: OpportunityCreate,
    current_user: User = Depends(require_verified_recruiter),
    db: Session = Depends(get_db)
):
    """Allows verified recruiters to publish new career opportunities."""
    rp = current_user.recruiter_profile
    opp = Opportunity(
        recruiter_id=rp.id,
        title=payload.title.strip(),
        company=rp.company_name,
        description=payload.description.strip(),
        opportunity_type=payload.opportunity_type,
        work_mode=payload.work_mode,
        location=payload.location.strip() if payload.location else "Remote",
        stipend_or_salary=payload.stipend_or_salary,
        eligibility=payload.eligibility,
        deadline=payload.deadline,
        application_link=payload.application_link,
        verification_status="verified",
        source=f"Verified Recruiter ({rp.company_name})",
        is_active=True
    )
    db.add(opp)
    db.flush()

    for s in payload.required_skills:
        db.add(OpportunityRequirement(opportunity_id=opp.id, skill_name=s.strip(), is_mandatory=True))

    db.commit()
    db.refresh(opp)
    return {"message": "Opportunity published successfully.", "opportunity_id": opp.id}

@router.put("/opportunities/{opp_id}")
def update_recruiter_opportunity(
    opp_id: int,
    payload: OpportunityUpdate,
    current_user: User = Depends(require_verified_recruiter),
    db: Session = Depends(get_db)
):
    """Updates listing details."""
    rp = current_user.recruiter_profile
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id, Opportunity.recruiter_id == rp.id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found or unauthorized.")

    for k, v in payload.dict(exclude_unset=True).items():
        if hasattr(opp, k):
            setattr(opp, k, v)
    db.commit()
    return {"message": "Opportunity updated successfully."}

@router.get("/applications")
def list_recruiter_applications(
    opportunity_id: Optional[int] = None,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Lists applications submitted to this recruiter's listings."""
    rp = current_user.recruiter_profile
    my_opp_ids = [o.id for o in db.query(Opportunity).filter(Opportunity.recruiter_id == rp.id).all()]
    if not my_opp_ids:
        return []

    q = db.query(Application).filter(Application.opportunity_id.in_(my_opp_ids))
    if opportunity_id:
        q = q.filter(Application.opportunity_id == opportunity_id)

    apps = q.order_by(Application.applied_at.desc()).all()
    results = []
    for a in apps:
        student = a.student
        opp = a.opportunity
        req_skills = [r.skill_name for r in opp.requirements]
        student_skills = [s.skill_name for s in student.skills]
        matched = [s for s in req_skills if any(s.lower() in sk.lower() or sk.lower() in s.lower() for sk in student_skills)]
        match_pct = round((len(matched) / len(req_skills) * 100.0), 0) if req_skills else 50.0

        results.append({
            "application_id": a.id,
            "opportunity_id": opp.id,
            "opportunity_title": opp.title,
            "student_id": student.id,
            "student_name": student.full_name,
            "college": student.college,
            "course_branch": student.course_branch,
            "graduation_year": student.graduation_year,
            "readiness_score": student.readiness_score,
            "status": a.status,
            "applied_at": a.applied_at.strftime("%Y-%m-%d %H:%M"),
            "match_percentage": match_pct,
            "matched_skills": matched
        })
    return results

@router.get("/applicants/{app_id}")
def get_applicant_details(
    app_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Strictly authorized candidate view: only accessible if candidate applied to recruiter's opening."""
    rp = current_user.recruiter_profile
    app = db.query(Application).join(Opportunity).filter(
        Application.id == app_id,
        Opportunity.recruiter_id == rp.id
    ).first()

    if not app:
        raise HTTPException(
            status_code=403,
            detail="Access restricted: Candidate details are only accessible for candidates who have applied to your openings."
        )

    student = app.student
    return {
        "application_id": app.id,
        "status": app.status,
        "notes": app.notes,
        "candidate": {
            "id": student.id,
            "full_name": student.full_name,
            "college": student.college,
            "course_branch": student.course_branch,
            "graduation_year": student.graduation_year,
            "bio": student.bio,
            "readiness_score": student.readiness_score,
            "readiness_level": student.readiness_level,
            "skills": [
                {"name": s.skill_name, "category": s.category, "proficiency": s.proficiency_level, "source": s.source}
                for s in student.skills
            ],
            "projects": [
                {"title": p.title, "description": p.description, "technologies": p.technologies_used, "url": p.project_url}
                for p in student.projects
            ],
            "certifications": [
                {"title": c.title, "organization": c.issuing_organization, "url": c.certificate_url}
                for c in student.certifications
            ]
        }
    }

@router.patch("/applications/{app_id}/status")
def update_application_status(
    app_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Updates candidate status and sends notification to student."""
    rp = current_user.recruiter_profile
    app = db.query(Application).join(Opportunity).filter(
        Application.id == app_id,
        Opportunity.recruiter_id == rp.id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found or unauthorized.")

    app.status = payload.status
    if payload.notes:
        app.notes = payload.notes
    db.commit()

    # Notify student
    status_display = payload.status.replace("_", " ").title()
    NotificationService.send_notification(
        db=db,
        user_id=app.student.user_id,
        title=f"Application Update: {status_display}",
        message=f"Your application status for '{app.opportunity.title}' has been updated to: {status_display}.",
        notification_type="info",
        action_link="#student/applications"
    )

    return {"message": f"Candidate status updated to {payload.status}."}

@router.post("/interviews")
def schedule_interview(
    payload: InterviewCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Schedules an interview with candidate and notifies them."""
    rp = current_user.recruiter_profile
    app = db.query(Application).join(Opportunity).filter(
        Application.id == payload.application_id,
        Opportunity.recruiter_id == rp.id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    interview = Interview(
        application_id=app.id,
        student_id=app.student_id,
        recruiter_id=rp.id,
        scheduled_time=payload.scheduled_time,
        duration_minutes=payload.duration_minutes,
        meeting_link=payload.meeting_link,
        interview_type=payload.interview_type,
        notes=payload.notes,
        status="scheduled"
    )
    db.add(interview)
    app.status = "interview_scheduled"
    db.commit()
    db.refresh(interview)

    # Notify student
    time_str = payload.scheduled_time.strftime("%b %d, %Y at %I:%M %p UTC")
    NotificationService.send_notification(
        db=db,
        user_id=app.student.user_id,
        title="Interview Scheduled!",
        message=f"{rp.company_name} scheduled a {payload.interview_type} interview for '{app.opportunity.title}' on {time_str}.",
        notification_type="success",
        action_link="#student/applications"
    )

    return {"message": "Interview scheduled successfully.", "interview_id": interview.id}
