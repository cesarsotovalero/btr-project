"""ESG assessments, evidence refs, workflow checkpoints, new columns.

Revision ID: 002
Revises: 001
Create Date: 2026-03-08
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: str | None = "001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # --- Alter existing tables ---

    # Cases: add esg_relevant and workflow_paused_at_checkpoint
    op.add_column(
        "cases",
        sa.Column("esg_relevant", sa.Boolean, server_default="false"),
    )
    op.add_column(
        "cases",
        sa.Column("workflow_paused_at_checkpoint", sa.String(64)),
    )

    # Case Findings: add evidence_artifact_ids
    op.add_column(
        "case_findings",
        sa.Column("evidence_artifact_ids", sa.JSON),
    )

    # Risk Assessments: add generated_by
    op.add_column(
        "risk_assessments",
        sa.Column("generated_by", sa.String(256)),
    )

    # --- New tables ---

    # ESG Assessments
    op.create_table(
        "esg_assessments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "case_id",
            sa.String(36),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("climate_risk_rating", sa.String(64)),
        sa.Column("environmental_flags", sa.JSON),
        sa.Column("social_flags", sa.JSON),
        sa.Column("governance_flags", sa.JSON),
        sa.Column("taxonomy_alignment", sa.JSON),
        sa.Column("missing_esg_data", sa.JSON),
        sa.Column("esg_risk_horizon", sa.String(32)),
        sa.Column("confidence", sa.Float),
        sa.Column("details", sa.JSON),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_esg_assessments_case_id", "esg_assessments", ["case_id"])

    # Evidence Refs
    op.create_table(
        "evidence_refs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "finding_id",
            sa.String(36),
            sa.ForeignKey("case_findings.id"),
            nullable=False,
        ),
        sa.Column("artifact_id", sa.String(256), nullable=False),
        sa.Column("source_type", sa.String(64), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_evidence_refs_finding_id", "evidence_refs", ["finding_id"])

    # Workflow Checkpoints
    op.create_table(
        "workflow_checkpoints",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "case_id",
            sa.String(36),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("checkpoint_name", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("reviewer_name", sa.String(256)),
        sa.Column("comment", sa.Text),
        sa.Column(
            "paused_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column("resolved_at", sa.DateTime(timezone=True)),
    )
    op.create_index(
        "ix_workflow_checkpoints_case_id",
        "workflow_checkpoints",
        ["case_id"],
    )


def downgrade() -> None:
    op.drop_table("workflow_checkpoints")
    op.drop_table("evidence_refs")
    op.drop_table("esg_assessments")
    op.drop_column("risk_assessments", "generated_by")
    op.drop_column("case_findings", "evidence_artifact_ids")
    op.drop_column("cases", "workflow_paused_at_checkpoint")
    op.drop_column("cases", "esg_relevant")
