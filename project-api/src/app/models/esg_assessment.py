"""EsgAssessment model — ESG and climate risk evaluation for a case."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class EsgAssessment(Base):
    __tablename__ = "esg_assessments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    case_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("cases.id"), nullable=False, index=True
    )
    climate_risk_rating: Mapped[str | None] = mapped_column(String(64))
    environmental_flags: Mapped[list | None] = mapped_column(JSON)
    social_flags: Mapped[list | None] = mapped_column(JSON)
    governance_flags: Mapped[list | None] = mapped_column(JSON)
    taxonomy_alignment: Mapped[dict | None] = mapped_column(JSON)
    missing_esg_data: Mapped[list | None] = mapped_column(JSON)
    esg_risk_horizon: Mapped[str | None] = mapped_column(String(32))
    confidence: Mapped[float | None] = mapped_column(Float)
    details: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    case = relationship("Case", back_populates="esg_assessments")
