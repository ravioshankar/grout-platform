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
