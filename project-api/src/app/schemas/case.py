"""Case schemas — request/response models for case endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field


class CaseCreate(BaseModel):
    company_name: str = Field(..., max_length=256)
    sector: str | None = Field(None, max_length=128)
    country: str | None = Field(None, max_length=128)
    description: str | None = None
    esg_relevant: bool = False


class CaseUpdate(BaseModel):
    company_name: str | None = Field(None, max_length=256)
    sector: str | None = Field(None, max_length=128)
    country: str | None = Field(None, max_length=128)
    status: str | None = Field(None, max_length=32)
    description: str | None = None


class CaseResponse(BaseModel):
    id: str
    case_number: str
    company_name: str
    sector: str | None
    country: str | None
    status: str
    esg_relevant: bool = False
    owner_id: str | None = None
    workflow_paused_at_checkpoint: str | None = None
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CaseListResponse(BaseModel):
    cases: list[CaseResponse]
    total: int
