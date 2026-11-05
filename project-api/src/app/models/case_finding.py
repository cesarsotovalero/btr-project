"""CaseFinding model — individual findings from agent analysis."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CaseFinding(Base):
    __tablename__ = "case_findings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    case_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("cases.id"), nullable=False, index=True
    )
    finding_type: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False, default="info")
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    source_refs: Mapped[dict | None] = mapped_column(JSON)
    evidence_artifact_ids: Mapped[list | None] = mapped_column(JSON)
    created_by_agent: Mapped[str | None] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    case = relationship("Case", back_populates="findings")
    evidence_refs = relationship(
        "EvidenceRef", back_populates="finding", lazy="selectin"
    )
