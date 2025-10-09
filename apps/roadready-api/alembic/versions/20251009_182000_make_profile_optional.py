"""make profile fields optional

Revision ID: 20251009_182000
Revises: 20251009_181500
Create Date: 2025-10-09 18:20:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '20251009_182000'
down_revision = '20251009_181500'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('user', 'state', nullable=True)
    op.alter_column('user', 'test_type', nullable=True)


def downgrade() -> None:
    op.alter_column('user', 'test_type', nullable=False)
    op.alter_column('user', 'state', nullable=False)
