"""Review schemas — request/response models for analyst review endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    reviewer_name: str = Field(..., max_length=256)
    action: str = Field(..., pattern="^(approve|reject|request_info)$")
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: str
    case_id: str
    reviewer_name: str
    action: str
    comment: str | None
    reviewed_at: datetime

    model_config = {"from_attributes": True}


class AuditLogResponse(BaseModel):
    id: str
    case_id: str
    event_type: str
    actor: str
    payload: dict | None
    timestamp: datetime

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    audit_logs: list[AuditLogResponse]
    total: int
