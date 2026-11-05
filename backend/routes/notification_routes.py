from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Notification
from backend.auth import get_current_user
from backend.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_my_notifications(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = NotificationService.get_user_notifications(db=db, user_id=current_user.id, limit=limit)
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.notification_type,
            "action_link": n.action_link,
            "is_read": n.is_read,
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for n in notifs
    ]

@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}

@router.patch("/{notif_id}/read")
def mark_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = NotificationService.mark_as_read(db=db, notification_id=notif_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"message": "Marked as read."}

@router.post("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = NotificationService.mark_all_as_read(db=db, user_id=current_user.id)
    return {"message": f"Marked {count} notifications as read."}
