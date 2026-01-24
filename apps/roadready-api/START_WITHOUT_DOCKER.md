# 🚀 Start RoadReady API Without Docker

## ⚡ Quick Start (No Docker Required)

Since Docker is not installed, we'll use **SQLite** which requires zero setup!

### Step 1: Configure SQLite (30 seconds)

Edit the `.env` file:

```bash
# Change this line:
DATABASE_URL=postgresql+psycopg://roadready:roadready@localhost:5433/roadready

# To this:
DATABASE_URL=sqlite:///./roadready.db
```

Or use this command:
```bash
cd apps/roadready-api
sed -i.bak 's|DATABASE_URL=postgresql.*|DATABASE_URL=sqlite:///./roadready.db|g' .env
```

### Step 2: Initialize Database (10 seconds)

```bash
python scripts/create_migrations.py
```

### Step 3: Start Server (5 seconds)

```bash
./start-server.sh
```

### Step 4: Test It! (5 seconds)

Open: **http://localhost:8888/docs**

---

## ✅ That's It!

You're now running with SQLite:
- ✅ No Docker needed
- ✅ No PostgreSQL installation
- ✅ Database file: `roadready.db`
- ✅ All features work the same

---

## 🔄 Want to Use PostgreSQL Later?

### Option 1: Install Docker

1. **Download Docker Desktop:**
   - macOS: https://www.docker.com/products/docker-desktop
   - Or: `brew install --cask docker`

2. **Start Docker Desktop**

3. **Run setup:**
   ```bash
   docker compose up -d
   ```

4. **Update `.env` back to PostgreSQL:**
   ```bash
   DATABASE_URL=postgresql+psycopg://roadready:roadready@localhost:5433/roadready
   ```

5. **Initialize database:**
   ```bash
   ./roadready db:push
   ```

### Option 2: Install PostgreSQL Directly

```bash
# Install PostgreSQL
brew install postgresql@16

# Start service
brew services start postgresql@16

# Create database
createdb roadready

# Update .env
DATABASE_URL=postgresql+psycopg://roadready:roadready@localhost:5432/roadready
```

---

## 📊 SQLite vs PostgreSQL

### SQLite (Current Setup)
- ✅ Zero setup
- ✅ Perfect for development
- ✅ Single file database
- ✅ Fast for small datasets
- ⚠️ Not for production

### PostgreSQL (Optional)
- ✅ Production-ready
- ✅ Better for large datasets
- ✅ More features
- ⚠️ Requires Docker or installation

---

## 🎯 Recommended Workflow

1. **Start with SQLite** (what you're doing now)
2. **Develop and test** your features
3. **Switch to PostgreSQL** when ready for production

---

## ✅ Current Status

- ✅ SQLite configured
- ✅ No Docker needed
- ✅ Ready to start server
- ✅ All features available

---

## 🚀 Start Now

```bash
cd apps/roadready-api

# Make sure .env uses SQLite
cat .env | grep DATABASE_URL

# Should show:
# DATABASE_URL=sqlite:///./roadready.db

# Start server
./start-server.sh

# Open browser
open http://localhost:8888/docs
```

---

**You're all set!** 🎉

No Docker needed. SQLite works perfectly for development.
