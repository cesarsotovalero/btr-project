"""Review API router — analyst reviews and audit logs."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models.analyst_review import AnalystReview
from app.models.audit_log import AuditLog
from app.models.case import Case
from app.models.user import User
from app.schemas.review import AuditLogListResponse, ReviewCreate, ReviewResponse

router = APIRouter(tags=["reviews"])

STATUS_MAP = {
    "approve": "approved",
    "reject": "rejected",
    "request_info": "needs_info",
}


@router.post(
    "/cases/{case_id}/review",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_review(
    case_id: str,
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit an analyst review decision for a case."""
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Case not found."
        )

    review = AnalystReview(
        case_id=case_id,
        reviewer_name=data.reviewer_name,
        action=data.action,
        comment=data.comment,
    )
    db.add(review)

    # Update case status based on action
    new_status = STATUS_MAP.get(data.action, case.status)
    case.status = new_status

    db.add(
        AuditLog(
            case_id=case_id,
            event_type="analyst_review",
            actor=data.reviewer_name,
            payload={
                "action": data.action,
                "new_status": new_status,
                "comment": data.comment,
            },
        )
    )
    await db.flush()
    return review


@router.get("/cases/{case_id}/audit-log", response_model=AuditLogListResponse)
async def get_audit_log(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the full audit log for a case."""
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.case_id == case_id)
        .order_by(AuditLog.timestamp.asc())
    )
    logs = result.scalars().all()
    return AuditLogListResponse(audit_logs=logs, total=len(logs))
