"""add email verification fields

Revision ID: 20250128_verification
Revises: f12347881a84
Create Date: 2025-01-28

"""
from alembic import op
import sqlalchemy as sa

revision = '20250128_verification'
down_revision = '991c39fd7158'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('user', sa.Column('verification_token', sa.String(length=255), nullable=True))
    op.add_column('user', sa.Column('verification_token_expires', sa.DateTime(), nullable=True))

def downgrade() -> None:
    op.drop_column('user', 'verification_token_expires')
    op.drop_column('user', 'verification_token')
