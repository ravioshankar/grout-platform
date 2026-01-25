"""add gamification tables

Revision ID: 20250128_gamification
Revises: 20250128_verification
Create Date: 2025-01-28

"""
from alembic import op
import sqlalchemy as sa

revision = '20250128_gamification'
down_revision = '20250128_verification'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('user', sa.Column('current_streak', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user', sa.Column('longest_streak', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user', sa.Column('total_xp', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user', sa.Column('last_activity_date', sa.Date(), nullable=True))
    
    op.create_table('achievement',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('achievement_type', sa.String(length=50), nullable=False),
        sa.Column('earned_at', sa.DateTime(), nullable=False),
        sa.Column('xp_earned', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_achievement_user_id', 'achievement', ['user_id'])

def downgrade() -> None:
    op.drop_index('ix_achievement_user_id', table_name='achievement')
    op.drop_table('achievement')
    op.drop_column('user', 'last_activity_date')
    op.drop_column('user', 'total_xp')
    op.drop_column('user', 'longest_streak')
    op.drop_column('user', 'current_streak')
