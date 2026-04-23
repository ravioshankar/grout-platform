# RoadReady API

FastAPI backend for RoadReady DMV application.

## Setup

```bash
pip install -r requirements.txt
```

## Docker (recommended on Linux / Ubuntu)

From `apps/roadready-api`, build and run the API and PostgreSQL together:

```bash
./docker-up.sh
```

That uses **`docker compose`** when available (Docker Desktop), otherwise **`docker-compose`**. If you see `unknown flag: --build`, your `docker` CLI does not include Compose V2—install [Docker Desktop](https://www.docker.com/products/docker-desktop/) or run `brew install docker-compose` and use:

```bash
docker-compose up --build -d
```

Manual equivalents:

```bash
docker compose up --build -d
```

- Swagger: http://localhost:8888/docs  
- Postgres is also exposed on **localhost:5433** for GUI clients (optional).

Set a real secret in production:

```bash
export SECRET_KEY="$(openssl rand -base64 32)"
./docker-up.sh
```

## Database Setup

**PostgreSQL only (API still on host):**
```bash
docker compose up -d postgres
# or: docker-compose up -d postgres
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

**Local (Python on your machine):**
```bash
./start-server.sh
# or
./roadready start
```

**In Docker:** use `docker compose up` (see above); the container runs migrations then starts Uvicorn (no `--reload`).

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

- Swagger UI: http://localhost:8888/docs
- ReDoc: http://localhost:8888/redoc

## Endpoints

- `GET /api/v1/` - Root
- `GET /api/v1/health` - Health check
- `GET /api/v1/tests` - Tests list
