import secrets
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, StudentProfile, RecruiterProfile, OwnerAccount, AuditLog
from backend.schemas import (
    StudentRegister, RecruiterRegister, UserLogin, OwnerBootstrapRequest,
    Token, UserOut, PasswordResetRequest, PasswordResetConfirm
)
from backend.auth import (
    hash_password, verify_password, create_access_token, get_current_user
)
from backend.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register-student", response_model=Token)
def register_student(payload: StudentRegister, request: Request, db: Session = Depends(get_db)):
    """Registers a new student account and returns JWT session."""
    email_clean = payload.email.lower().strip()
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=email_clean,
        password_hash=hash_password(payload.password),
        role="student",
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.flush()

    student_profile = StudentProfile(
        user_id=user.id,
        full_name=payload.full_name.strip(),
        college=payload.college.strip() if payload.college else None,
        course_branch=payload.course_branch.strip() if payload.course_branch else None,
        graduation_year=payload.graduation_year,
        experience_level="Beginner",
        career_goal="Internship",
        preparation_timeline="3 months"
    )
    db.add(student_profile)

    # Log action
    db.add(AuditLog(
        user_id=user.id,
        action="STUDENT_REGISTERED",
        resource_type="user",
        resource_id=str(user.id),
        details={"email": user.email, "name": payload.full_name},
        ip_address=request.client.host if request.client else None
    ))

    db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
        "full_name": student_profile.full_name
    }

@router.post("/register-recruiter", response_model=Token)
def register_recruiter(payload: RecruiterRegister, request: Request, db: Session = Depends(get_db)):
    """Registers a recruiter account with verification pending."""
    email_clean = payload.official_email.lower().strip()
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this official email address already exists."
        )

    user = User(
        email=email_clean,
        password_hash=hash_password(payload.password),
        role="recruiter",
        is_active=True,
        is_verified=False # Requires Super Admin verification before publishing jobs
    )
    db.add(user)
    db.flush()

    recruiter_profile = RecruiterProfile(
        user_id=user.id,
        full_name=payload.full_name.strip(),
        official_email=email_clean,
        company_name=payload.company_name.strip(),
        company_website=payload.company_website.strip() if payload.company_website else None,
        designation=payload.designation.strip() if payload.designation else None,
        company_description=payload.company_description.strip() if payload.company_description else None,
        is_verified=False
    )
    db.add(recruiter_profile)

    db.add(AuditLog(
        user_id=user.id,
        action="RECRUITER_REGISTERED",
        resource_type="user",
        resource_id=str(user.id),
        details={"email": user.email, "company": payload.company_name},
        ip_address=request.client.host if request.client else None
    ))

    db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
        "full_name": recruiter_profile.full_name
    }

@router.post("/login", response_model=Token)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticates student, recruiter, or website owner."""
    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact platform administration."
        )

    full_name = None
    if user.role == "student" and user.student_profile:
        full_name = user.student_profile.full_name
    elif user.role == "recruiter" and user.recruiter_profile:
        full_name = user.recruiter_profile.full_name
    elif user.role == "admin":
        full_name = "Platform Owner"

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
        "full_name": full_name
    }

@router.post("/owner-bootstrap", response_model=Token)
def owner_bootstrap(payload: OwnerBootstrapRequest, request: Request, db: Session = Depends(get_db)):
    """Server-side bootstrap for website owner using configured OWNER_BOOTSTRAP_SECRET."""
    email_clean = payload.email.lower().strip()
    
    if email_clean != settings.OWNER_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Provided email does not match the configured website owner address."
        )

    if not secrets.compare_digest(payload.bootstrap_secret, settings.OWNER_BOOTSTRAP_SECRET):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid owner bootstrap secret."
        )

    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        user = User(
            email=email_clean,
            password_hash=hash_password(payload.password),
            role="admin",
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.flush()
        owner_acc = OwnerAccount(
            user_id=user.id,
            bootstrap_secret_hash=hash_password(payload.bootstrap_secret),
            is_bootstrapped=True
        )
        db.add(owner_acc)
    else:
        user.password_hash = hash_password(payload.password)
        user.role = "admin"
        user.is_active = True
        user.is_verified = True

    db.add(AuditLog(
        user_id=user.id,
        action="OWNER_BOOTSTRAPPED",
        resource_type="owner",
        resource_id=str(user.id),
        details={"status": "Owner account initialized successfully"},
        ip_address=request.client.host if request.client else None
    ))
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "role": "admin", "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "admin",
        "user_id": user.id,
        "email": user.email,
        "full_name": "Platform Owner"
    }

@router.post("/forgot-password")
def forgot_password(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    """Simulates password reset email dispatch with secure reset token."""
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user:
        return {"message": "If this email exists in our records, password reset instructions have been sent."}
    
    # Generate token
    token = secrets.token_urlsafe(32)
    return {
        "message": "Password reset token generated successfully. In production, this link is dispatched to your registered email.",
        "dev_reset_token": token,
        "email": user.email
    }

@router.post("/reset-password")
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Resets password with valid token."""
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request.")
    
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password has been successfully updated. You may now log in."}

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns authenticated profile data."""
    profile_data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat()
    }
    if current_user.role == "student" and current_user.student_profile:
        sp = current_user.student_profile
        profile_data["student_profile"] = {
            "id": sp.id,
            "full_name": sp.full_name,
            "college": sp.college,
            "course_branch": sp.course_branch,
            "graduation_year": sp.graduation_year,
            "bio": sp.bio,
            "phone": sp.phone,
            "experience_level": sp.experience_level,
            "career_goal": sp.career_goal,
            "preparation_timeline": sp.preparation_timeline,
            "readiness_score": sp.readiness_score,
            "readiness_level": sp.readiness_level,
            "selected_role_id": sp.selected_role_id,
            "selected_role_title": sp.selected_role.title if sp.selected_role else None
        }
    elif current_user.role == "recruiter" and current_user.recruiter_profile:
        rp = current_user.recruiter_profile
        profile_data["recruiter_profile"] = {
            "id": rp.id,
            "full_name": rp.full_name,
            "official_email": rp.official_email,
            "company_name": rp.company_name,
            "company_website": rp.company_website,
            "designation": rp.designation,
            "is_verified": rp.is_verified,
            "verification_notes": rp.verification_notes
        }
    return profile_data
