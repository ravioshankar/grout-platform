"""add password and auth fields

Revision ID: 20251009_180000
Revises: 20251009_174822
Create Date: 2025-10-09 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '20251009_180000'
down_revision = '20251009_174822'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user', sa.Column('hashed_password', sa.String(length=255), nullable=False, server_default=''))
    op.add_column('user', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.alter_column('user', 'hashed_password', server_default=None)
    op.alter_column('user', 'is_active', server_default=None)


def downgrade() -> None:
    op.drop_column('user', 'is_active')
    op.drop_column('user', 'hashed_password')
