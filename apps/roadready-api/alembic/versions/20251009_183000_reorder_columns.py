"""reorder columns for better readability

Revision ID: 20251009_183000
Revises: 20251009_182500
Create Date: 2025-10-09 18:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '20251009_183000'
down_revision = '20251009_182500'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create new table with proper column order
    op.execute("""
        CREATE TABLE user_new (
            id INTEGER PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            hashed_password VARCHAR(255),
            oauth_provider VARCHAR(50),
            oauth_provider_id VARCHAR(255),
            state VARCHAR(2),
            test_type VARCHAR(50),
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
    """)
    
    # Copy data from old table to new table
    op.execute("""
        INSERT INTO user_new (
            id, email, first_name, last_name, hashed_password, 
            oauth_provider, oauth_provider_id, state, test_type, 
            is_active, created_at, updated_at
        )
        SELECT 
            id, email, first_name, last_name, hashed_password,
            oauth_provider, oauth_provider_id, state, test_type,
            is_active, created_at, updated_at
        FROM "user"
    """)
    
    # Drop old table
    op.execute('DROP TABLE "user"')
    
    # Rename new table to original name
    op.execute('ALTER TABLE user_new RENAME TO "user"')
    
    # Recreate index
    op.create_index('ix_user_email', 'user', ['email'], unique=True)


def downgrade() -> None:
    # Downgrade would recreate with old order, but not critical for development
    pass
