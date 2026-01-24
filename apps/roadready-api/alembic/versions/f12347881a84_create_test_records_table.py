"""create_test_records_table

Revision ID: f12347881a84
Revises: 241132d3910d
Create Date: 2025-10-20 21:14:12.812380

"""
from alembic import op
import sqlalchemy as sa


revision = 'f12347881a84'
down_revision = '241132d3910d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'test_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('state_code', sa.String(length=2), nullable=False),
        sa.Column('test_type', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('total_questions', sa.Integer(), nullable=False),
        sa.Column('correct_answers', sa.Integer(), nullable=False),
        sa.Column('time_spent', sa.Integer(), nullable=False),
        sa.Column('questions', sa.Text(), nullable=False),
        sa.Column('user_answers', sa.Text(), nullable=False),
        sa.Column('is_correct', sa.Text(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_test_records_user_id', 'test_records', ['user_id'])
    op.create_index('idx_test_records_completed_at', 'test_records', ['completed_at'])


def downgrade() -> None:
    op.drop_index('idx_test_records_completed_at', table_name='test_records')
    op.drop_index('idx_test_records_user_id', table_name='test_records')
    op.drop_table('test_records')
