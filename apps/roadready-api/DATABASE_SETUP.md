# RoadReady API - Database Setup Guide

## 🗄️ Database Options

You have **3 options** for the database:

1. **PostgreSQL with Docker** (Recommended for production-like setup)
2. **SQLite** (Easiest - no setup required)
3. **PostgreSQL without Docker** (Manual installation)

---

## Option 1: PostgreSQL with Docker (Recommended)

### Prerequisites
- Docker Desktop installed

### Install Docker Desktop

**macOS:**
```bash
# Download from: https://www.docker.com/products/docker-desktop
# Or install with Homebrew:
brew install --cask docker
```

**After installation:**
1. Open Docker Desktop application
2. Wait for Docker to start (whale icon in menu bar)

### Start PostgreSQL

```bash
cd apps/roadready-api

# Start PostgreSQL container
docker compose up -d

# Verify it's running
docker compose ps

# Check logs
docker compose logs postgres
```

### Database Connection Details
- **Host:** localhost
- **Port:** 5433 (mapped from container's 5432)
- **Database:** roadready
- **User:** roadready
- **Password:** roadready
- **Connection String:** `postgresql+psycopg://roadready:roadready@localhost:5433/roadready`

### Useful Commands

```bash
# Start database
docker compose up -d

# Stop database
docker compose down

# Stop and remove data
docker compose down -v

# View logs
docker compose logs -f postgres

# Access PostgreSQL shell
docker compose exec postgres psql -U roadready -d roadready

# Restart database
docker compose restart
```

---

## Option 2: SQLite (Easiest - No Setup Required)

### Setup

1. **Update `.env` file:**
   ```bash
   # Change this line:
   DATABASE_URL=postgresql+psycopg://roadready:roadready@localhost:5433/roadready
   
   # To this:
   DATABASE_URL=sqlite:///./roadready.db
   ```

2. **That's it!** SQLite will create the database file automatically.

### Advantages
- ✅ No installation required
- ✅ No Docker needed
- ✅ Perfect for development
- ✅ Portable (single file)

### Disadvantages
- ⚠️ Not suitable for production
- ⚠️ Limited concurrent connections
- ⚠️ Fewer features than PostgreSQL

### Database File Location
- File: `apps/roadready-api/roadready.db`
- Created automatically on first run

---

## Option 3: PostgreSQL without Docker

### Install PostgreSQL

**macOS (Homebrew):**
```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database and user
psql postgres
```

**In PostgreSQL shell:**
```sql
CREATE USER roadready WITH PASSWORD 'roadready';
CREATE DATABASE roadready OWNER roadready;
GRANT ALL PRIVILEGES ON DATABASE roadready TO roadready;
\q
```

### Update Configuration

The default `.env` should work, but verify:
```bash
DATABASE_URL=postgresql+psycopg://roadready:roadready@localhost:5432/roadready
```

Note: Port is 5432 (not 5433 like Docker)

---

## 🚀 Initialize Database

After choosing your database option, initialize the schema:

### Method 1: Using the roadready script
```bash
./roadready db:push
```

### Method 2: Using Python
```bash
python scripts/create_migrations.py
```

### Method 3: Using Alembic
```bash
alembic upgrade head
```

---

## ✅ Verify Database Connection

### Test Connection

```bash
# Run verification script
python verify_setup.py

# Or test manually
python -c "
from app.core.database import engine
from sqlmodel import text
with engine.connect() as conn:
    result = conn.execute(text('SELECT 1'))
    print('✅ Database connection successful!')
"
```

### Check Tables

```bash
# For PostgreSQL
docker compose exec postgres psql -U roadready -d roadready -c "\dt"

# For SQLite
sqlite3 roadready.db ".tables"
```

---

## 🔧 Troubleshooting

### Docker Issues

**"Docker command not found"**
```bash
# Install Docker Desktop
# macOS: https://www.docker.com/products/docker-desktop
# Or: brew install --cask docker
```

**"Cannot connect to Docker daemon"**
```bash
# Start Docker Desktop application
# Wait for whale icon to appear in menu bar
```

**"Port 5433 already in use"**
```bash
# Find what's using the port
lsof -i :5433

# Kill the process or change port in docker-compose.yml
```

### PostgreSQL Issues

**"Connection refused"**
```bash
# Check if PostgreSQL is running
docker compose ps

# Check logs
docker compose logs postgres

# Restart
docker compose restart
```

**"Authentication failed"**
```bash
# Verify credentials in .env match docker-compose.yml
# Default: roadready/roadready
```

### SQLite Issues

**"Database is locked"**
```bash
# Close all connections to the database
# Restart the server
```

**"No such table"**
```bash
# Initialize database
./roadready db:push
```

---

## 📊 Database Management

### Backup Database

**PostgreSQL:**
```bash
# Backup
docker compose exec postgres pg_dump -U roadready roadready > backup.sql

# Restore
docker compose exec -T postgres psql -U roadready roadready < backup.sql
```

**SQLite:**
```bash
# Backup
cp roadready.db roadready.db.backup

# Restore
cp roadready.db.backup roadready.db
```

### Reset Database

**PostgreSQL:**
```bash
# Stop and remove
docker compose down -v

# Start fresh
docker compose up -d

# Initialize
./roadready db:push
```

**SQLite:**
```bash
# Delete database file
rm roadready.db

# Restart server (will recreate)
./start-server.sh
```

---

## 🎯 Recommended Setup for Different Scenarios

### Development (Local)
**Recommendation:** SQLite
- No setup required
- Fast and simple
- Easy to reset

### Development (Team)
**Recommendation:** PostgreSQL with Docker
- Consistent environment
- Production-like setup
- Easy to share

### Production
**Recommendation:** Managed PostgreSQL
- AWS RDS
- Google Cloud SQL
- Heroku Postgres
- DigitalOcean Managed Database

---

## 📝 Quick Reference

### Docker Commands
```bash
docker compose up -d          # Start
docker compose down           # Stop
docker compose ps             # Status
docker compose logs postgres  # Logs
docker compose restart        # Restart
```

### Database Commands
```bash
./roadready db:push           # Sync schema
./roadready db:revision "msg" # Create migration
./roadready db:migrate        # Apply migrations
```

### Connection Strings
```bash
# PostgreSQL (Docker)
DATABASE_URL=postgresql+psycopg://roadready:roadready@localhost:5433/roadready

# PostgreSQL (Local)
DATABASE_URL=postgresql+psycopg://roadready:roadready@localhost:5432/roadready

# SQLite
DATABASE_URL=sqlite:///./roadready.db
```

---

## ✅ Success Checklist

- [ ] Database option chosen
- [ ] Database installed/configured
- [ ] Database running
- [ ] Connection string in `.env`
- [ ] Database initialized
- [ ] Connection verified
- [ ] Server starts successfully

---

## 🚀 Next Steps

1. **Choose your database option** (SQLite for quick start)
2. **Update `.env` if needed**
3. **Initialize database:** `./roadready db:push`
4. **Start server:** `./start-server.sh`
5. **Test:** http://localhost:8888/docs

---

**Need help?** See `TROUBLESHOOTING.md` for more solutions.
