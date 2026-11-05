from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models import Notification, User

class NotificationService:
    @classmethod
    def send_notification(
        cls,
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: str = "info",
        action_link: Optional[str] = None
    ) -> Notification:
        """Persists notification in database for user."""
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            action_link=action_link,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @classmethod
    def notify_admins(
        cls,
        db: Session,
        title: str,
        message: str,
        notification_type: str = "warning"
    ):
        """Sends notification to all active admin / owner accounts."""
        admins = db.query(User).filter(User.role == "admin").all()
        for admin in admins:
            cls.send_notification(
                db=db,
                user_id=admin.id,
                title=title,
                message=message,
                notification_type=notification_type,
                action_link="#admin/monitor"
            )

    @classmethod
    def get_user_notifications(cls, db: Session, user_id: int, limit: int = 30) -> List[Notification]:
        return db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).limit(limit).all()

    @classmethod
    def mark_as_read(cls, db: Session, notification_id: int, user_id: int) -> bool:
        notif = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if notif:
            notif.is_read = True
            db.commit()
            return True
        return False

    @classmethod
    def mark_all_as_read(cls, db: Session, user_id: int) -> int:
        updated = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return updated
