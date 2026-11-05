"""Reference data schemas — regulations and historical cases."""

from datetime import datetime

from pydantic import BaseModel, Field

# ── Regulations ──────────────────────────────────────────────────────────


class RegulationCreateBase(BaseModel):
    source_name: str = Field(..., min_length=1, max_length=256)
    source_type: str = Field(..., min_length=1, max_length=64)
    version: str | None = Field(None, max_length=64)
    content_reference: str | None = None
    content_text: str | None = None


class RegulationResponse(BaseModel):
    id: str
    source_name: str
    source_type: str
    version: str | None
    content_reference: str | None
    content_text: str | None
    pdf_path: str | None
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RegulationListResponse(BaseModel):
    regulations: list[RegulationResponse]
    total: int


# ── Historical Cases ─────────────────────────────────────────────────────


class HistoricalCaseCreateBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=256)
    sector: str | None = Field(None, max_length=128)
    country: str | None = Field(None, max_length=128)
    revenue_band: str | None = Field(None, max_length=64)
    debt_profile: str | None = Field(None, max_length=64)
    outcome: str | None = Field(None, max_length=64)
    final_risk_class: str | None = Field(None, max_length=64)
    decision_notes: str | None = None


class HistoricalCaseResponse(BaseModel):
    id: str
    company_name: str
    sector: str | None
    country: str | None
    revenue_band: str | None
    debt_profile: str | None
    outcome: str | None
    final_risk_class: str | None
    decision_notes: str | None
    case_features: dict | None
    closed_at: datetime | None
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoricalCaseSearchRequest(BaseModel):
    sector: str | None = Field(None, max_length=128)
    country: str | None = Field(None, max_length=128)
    revenue_band: str | None = Field(None, max_length=64)
    debt_profile: str | None = Field(None, max_length=64)
    limit: int = Field(5, ge=1, le=20)


class HistoricalCaseSearchResponse(BaseModel):
    cases: list[HistoricalCaseResponse]
    total: int


class HistoricalCaseListResponse(BaseModel):
    cases: list[HistoricalCaseResponse]
    total: int


# ── Shared ───────────────────────────────────────────────────────────────


class ToggleActiveRequest(BaseModel):
    active: bool
