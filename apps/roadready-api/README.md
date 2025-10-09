# RoadReady API

FastAPI backend for RoadReady DMV application.

## Setup

```bash
pip install -r requirements.txt
```

## Database Setup

**Start PostgreSQL 16:**
```bash
docker-compose up -d
```

**Prisma-like commands:**
```bash
./roadready db:push              # Sync schema (like prisma db push)
./roadready db:revision "name"   # Create migration (like prisma migrate dev)
./roadready db:migrate           # Apply migrations (like prisma migrate deploy)
```

**Seed database:**
```bash
python scripts/seed.py           # Add sample data
python scripts/seed.py --clear   # Clear all data
```

**OAuth Setup:**
See [docs/OAUTH_SETUP.md](docs/OAUTH_SETUP.md) for Google and Facebook OAuth configuration

## Run

```bash
./roadready start
```

## Commands

- `./roadready start` - Start development server with auto-reload
- `./roadready console` - Interactive Python console
- `./roadready db:push` - Sync database schema (Prisma-like)
- `./roadready db:revision "name"` - Create migration
- `./roadready db:migrate` - Apply migrations

## Project Structure

```
app/
├── main.py              # App entry point
├── core/
│   └── config.py        # Settings & config
├── api/
│   └── v1/
│       ├── router.py    # API router
│       └── endpoints/   # Route handlers
│           ├── health.py
│           └── tests.py
├── models/              # Database models
├── schemas/             # Pydantic schemas
└── services/            # Business logic
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

- `GET /api/v1/` - Root
- `GET /api/v1/health` - Health check
- `GET /api/v1/tests` - Tests list
