"""add name fields

Revision ID: 20251009_182500
Revises: 20251009_182000
Create Date: 2025-10-09 18:25:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '20251009_182500'
down_revision = '20251009_182000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user', sa.Column('first_name', sa.String(length=100), nullable=True))
    op.add_column('user', sa.Column('last_name', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('user', 'last_name')
    op.drop_column('user', 'first_name')
