"""add sessions table

Revision ID: 241132d3910d
Revises: 20251009_184000
Create Date: 2025-10-15 14:04:47.849171

"""
from alembic import op
import sqlalchemy as sa


revision = '241132d3910d'
down_revision = '20251009_184000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.String(length=64), nullable=False),
        sa.Column('token_hash', sa.String(length=128), nullable=False),
        sa.Column('refresh_token_hash', sa.String(length=128), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('last_activity', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('revoked_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id']),
    )
    op.create_index('ix_sessions_user_id', 'sessions', ['user_id'])
    op.create_index('ix_sessions_session_id', 'sessions', ['session_id'], unique=True)
    op.create_index('ix_sessions_token_hash', 'sessions', ['token_hash'])


def downgrade() -> None:
    op.drop_index('ix_sessions_token_hash', 'sessions')
    op.drop_index('ix_sessions_session_id', 'sessions')
    op.drop_index('ix_sessions_user_id', 'sessions')
    op.drop_table('sessions')
