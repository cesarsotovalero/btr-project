"""Analysis schemas — request/response models for analysis endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    force_rerun: bool = False


class AnalyzeResponse(BaseModel):
    case_id: str
    status: str
    message: str
    agent_run_ids: list[str] = []


class FindingResponse(BaseModel):
    id: str
    case_id: str
    finding_type: str
    severity: str
    title: str
    description: str | None
    source_refs: dict | None
    evidence_artifact_ids: list | None = None
    created_by_agent: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class FindingListResponse(BaseModel):
    findings: list[FindingResponse]
    total: int


class RiskAssessmentResponse(BaseModel):
    id: str
    case_id: str
    proposed_risk_class: str
    compliance_status: str
    recommendation: str | None
    reasoning: str | None
    confidence: float | None
    details: dict | None
    generated_by: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AgentRunResponse(BaseModel):
    id: str
    case_id: str
    agent_name: str
    input_snapshot: dict | None
    output_snapshot: dict | None
    status: str
    error_message: str | None
    started_at: datetime | None
    ended_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AgentRunListResponse(BaseModel):
    agent_runs: list[AgentRunResponse]
    total: int


class EsgAssessmentResponse(BaseModel):
    id: str
    case_id: str
    climate_risk_rating: str | None
    environmental_flags: list | None
    social_flags: list | None
    governance_flags: list | None
    taxonomy_alignment: dict | None
    missing_esg_data: list | None
    esg_risk_horizon: str | None
    confidence: float | None
    details: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkflowCheckpointResponse(BaseModel):
    id: str
    case_id: str
    checkpoint_name: str
    status: str
    reviewer_name: str | None
    comment: str | None
    paused_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}


class CheckpointListResponse(BaseModel):
    checkpoints: list[WorkflowCheckpointResponse]
    total: int


class CheckpointActionRequest(BaseModel):
    reviewer_name: str = Field(..., max_length=256)
    comment: str | None = None


class FindingExplanationResponse(BaseModel):
    explanation: str
    document_references: list[dict] = []
    confidence: float = 0.0
