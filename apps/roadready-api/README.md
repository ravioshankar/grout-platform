# RoadReady API

FastAPI backend for RoadReady DMV application.

## Setup

```bash
pip install -r requirements.txt
```

## Run

```bash
./roadready start
```

## Commands

- `./roadready start` - Start development server with auto-reload
- `./roadready console` - Interactive Python console

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
