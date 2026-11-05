"""Case model — the central entity for risk assessments."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    case_number: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    company_name: Mapped[str] = mapped_column(String(256), nullable=False)
    sector: Mapped[str | None] = mapped_column(String(128))
    country: Mapped[str | None] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="created")
    esg_relevant: Mapped[bool] = mapped_column(Boolean, default=False)
    workflow_paused_at_checkpoint: Mapped[str | None] = mapped_column(String(64))
    owner_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    owner = relationship("User", back_populates="cases", lazy="selectin")
    documents = relationship("Document", back_populates="case", lazy="selectin")
    findings = relationship("CaseFinding", back_populates="case", lazy="selectin")
    risk_assessments = relationship(
        "RiskAssessment", back_populates="case", lazy="selectin"
    )
    agent_runs = relationship("AgentRun", back_populates="case", lazy="selectin")
    analyst_reviews = relationship(
        "AnalystReview", back_populates="case", lazy="selectin"
    )
    audit_logs = relationship("AuditLog", back_populates="case", lazy="selectin")
    esg_assessments = relationship(
        "EsgAssessment", back_populates="case", lazy="selectin"
    )
    workflow_checkpoints = relationship(
        "WorkflowCheckpoint", back_populates="case", lazy="selectin"
    )
