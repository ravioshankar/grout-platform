"""add oauth fields

Revision ID: 20251009_181500
Revises: 20251009_180000
Create Date: 2025-10-09 18:15:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '20251009_181500'
down_revision = '20251009_180000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('user', 'hashed_password', nullable=True)
    op.add_column('user', sa.Column('oauth_provider', sa.String(length=50), nullable=True))
    op.add_column('user', sa.Column('oauth_provider_id', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('user', 'oauth_provider_id')
    op.drop_column('user', 'oauth_provider')
    op.alter_column('user', 'hashed_password', nullable=False)
