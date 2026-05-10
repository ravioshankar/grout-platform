# RoadReady API - Complete Setup Guide 🚀

Welcome to RoadReady API! This guide covers everything needed to get started with development and deployment.

## 📋 Prerequisites

- Python 3.8+ 
- PostgreSQL (recommended) or SQLite for local development
- Git

## 🗂️ Architecture Overview

```
roadready-api/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/          # Individual endpoint handlers
│   │   │   ├── auth.py         # Authentication (signup, login, etc.)
│   │   │   ├── users.py        # User CRUD operations
│   │   │   ├── tests.py        # Test-related endpoints
│   │   │   └── ...             # Organized by domain
│   │   ├── router.py           # API v1 router configuration
│   │   └── subdomains/         # Domain-based endpoint grouping (future)
│   ├── core/
│   │   ├── config.py          # Application settings & environment
│   │   ├── database.py        # Database connection & ORM setup
│   │   ├── security.py        # JWT, password hashing, sessions
│   │   └── oauth.py           # OAuth provider integration
│   ├── services/              # Business logic layer
│   │   ├── gamification_service.py  # XP, streaks, achievements
│   │   └── email_service.py         # Email notifications
│   ├── models/                # SQLAlchemy/SQLModel database models
│   ├── schemas/               # Pydantic request/response schemas
│   └── main.py                # FastAPI application entry point
├── tests/                     # Unit and integration tests
├── docker/                    # Docker configuration
└── migrations/                # Alembic database migrations
```

## ⚡ Quick Start (Docker - Recommended)

### 1. Clone & Navigate
```bash
git clone REPO_URL
cd grout-platform/apps/roadready-api
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
# Edit .env with your secrets
nano .env
```

Generate a secure SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Build & Run with Docker
```bash
docker-compose up -d --build
```

API will be available at: http://localhost:8888  
Docs: http://localhost:8888/docs  

### 4. Database Migrations
The migrations are applied automatically on first run via Alembic.

## 🐍 Docker-Less Setup (Local Development)

### 1. Install uv (Python package manager)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
```

### 2. Create Virtual Environment
```bash
uv venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
uv pip install -r requirements.txt
```

### 4. Configure .env
Copy and edit `.env.example` to create your `.env`:
```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

**Important:** Generate a SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))" >> .env
```

### 5. Initialize Database
```bash
uv python main.py init-db
```

Or using Python directly:
```bash
uv python -c "from app.core.database import init_db; init_db()"
```

### 6. Run the API
```bash
uv python main.py
```

Access at http://localhost:8888/docs for interactive API documentation.

## 🧪 Running Tests

### Unit Tests
```bash
uv pytest tests/unit -v
```

### Integration Tests
```bash
uv pytest app/api/v1/endpoints/test_integration.py -v
```

Full test suite:
```bash
uv pytest -v --cov=app --cov-report=term-missing
```

### Test Coverage Report
```bash
uv pytest --cov=app --cov-report=html coverage.html
```

## 🔒 Security Checklist

Before deploying to production, verify:

- [ ] SECRET_KEY is set from environment variable (not default)
- [ ] CORS_ORIGINS only allows your UI domain(s)
- [ ] DATABASE_URL uses PostgreSQL in production
- [ ] Debug mode is disabled (DEBUG=false)
- [ ] OAuth credentials are configured for all providers you use
- [ ] .env file is not committed to Git

Generate secure secrets:
```bash
python -c "import secrets; print('SECRET_KEY:', secrets.token_urlsafe(32))"
```

## 📊 Monitoring & Logging

Logs are written to `logs/app.log` with rotation (10MB per file, 5 backups).

Check logs:
```bash
tail -f logs/app.log
```

Enable debug logging in .env:
```
LOG_LEVEL=DEBUG
```

## 🐳 Docker Production Deployment

### Build Image
```bash
docker build -t roadready-api:latest .
```

### Run with docker-compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
Edit `docker-compose.prod.yml`:
```yaml
environment:
  - DEBUG=false
  - DATABASE_URL=postgresql+psycopg://user:pass@db:5432/roadready
  - CORS_ORIGINS=https://your-production-domain.com
  - LOG_LEVEL=INFO
```

## 🔄 API Versioning & Migrations

### Making Breaking Changes
RoadReady API uses `/api/v1` prefix for versioned APIs. To upgrade to v2:

1. Create new router under `app/api/v2/`
2. Update `main.py` to use v2 endpoints
3. Run database migrations before deploying v2
4. Consider maintaining v1 during migration window

### Database Migrations (Alembic)
```bash
# Create new migration
uv alembic revision --autogenerate -m "Add new field"

# Apply migrations
uv alembic upgrade head

# View migration history
uv alembic history
```

## 📚 API Documentation

FastAPI auto-generates documentation at:

- **Swagger UI**: http://localhost:8888/docs
- **ReDoc**: http://localhost:8888/redoc  
- **OpenAPI JSON**: http://localhost:8888/openapi.json

## 🛠️ Development Tools

### IDE Configuration
- VS Code settings available in `vs-code-extention/`
- Recommended extensions: Python, Pylance, Django Indentation

### API Testing with curl
```bash
# Signup
curl -X POST http://localhost:8888/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'

# Login
curl -X POST http://localhost:8888/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'
```

### API Testing with Postman/Insomnia
Import `docs/openapi.json` to your tool or use the interactive docs.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `psql --version`
- Check DATABASE_URL in .env matches your connection string
- For SQLite: ensure file path is writable

### ImportError Issues
```bash
uv sync  # Reinstall dependencies
uv pip install -r requirements.txt
```

### CORS Errors from Browser
- Update CORS_ORIGINS in .env to include your browser's origin
- Example: `CORS_ORIGINS=http://localhost:8081`

## 📖 Next Steps

1. Read individual feature documentation in docs/ folder
2. Review authentication flow in auth.py
3. Explore gamification in gamification_service.py
4. Check database schema in models/ directory

---

**Need Help?** See `TROUBLESHOOTING.md` for common issues and error messages.
