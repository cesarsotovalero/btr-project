"""Add pdf_path column to regulation_sources.

Revision ID: 005
Revises: 004
Create Date: 2026-03-09
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "005"
down_revision: str | None = "004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "regulation_sources",
        sa.Column("pdf_path", sa.String(512), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("regulation_sources", "pdf_path")
