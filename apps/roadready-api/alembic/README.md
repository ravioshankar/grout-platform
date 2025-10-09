# Database Migrations

This directory contains Alembic database migrations for the RoadReady API.

## Commands

### Create a new migration
```bash
alembic revision --autogenerate -m "description_of_changes"
```

### Apply migrations
```bash
# Upgrade to latest
alembic upgrade head

# Upgrade one version
alembic upgrade +1

# Upgrade to specific revision
alembic upgrade <revision_id>
```

### Rollback migrations
```bash
# Downgrade one version
alembic downgrade -1

# Downgrade to specific revision
alembic downgrade <revision_id>

# Downgrade all
alembic downgrade base
```

### View migration history
```bash
# Current version
alembic current

# Migration history
alembic history

# Show pending migrations
alembic history --verbose
```

## Migration Files

- `20251009_174822_initial_user_table.py` - Initial User table with email, state, test_type fields
- `20251009_180000_add_password_auth.py` - Add hashed_password and is_active fields for authentication
- `20251009_181500_add_oauth_fields.py` - Add oauth_provider and oauth_provider_id for SSO support
