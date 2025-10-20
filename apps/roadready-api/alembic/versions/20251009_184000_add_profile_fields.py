"""add profile fields

Revision ID: 20251009_184000
Revises: 20251009_183000
Create Date: 2025-10-09 18:40:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '20251009_184000'
down_revision = '20251009_183000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user', sa.Column('phone_number', sa.String(length=20), nullable=True))
    op.add_column('user', sa.Column('date_of_birth', sa.Date(), nullable=True))
    op.add_column('user', sa.Column('avatar_url', sa.String(length=500), nullable=True))
    op.add_column('user', sa.Column('license_number', sa.String(length=50), nullable=True))
    op.add_column('user', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.alter_column('user', 'email_verified', server_default=None)


def downgrade() -> None:
    op.drop_column('user', 'email_verified')
    op.drop_column('user', 'license_number')
    op.drop_column('user', 'avatar_url')
    op.drop_column('user', 'date_of_birth')
    op.drop_column('user', 'phone_number')
