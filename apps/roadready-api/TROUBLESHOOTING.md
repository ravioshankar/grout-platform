# RoadReady API - Troubleshooting Guide

## 🔴 Port 8000 Connection Issues

### Problem: "Unable to connect to port 8000"

This usually means either:
1. The server isn't running
2. Port 8000 is blocked by another process
3. Firewall is blocking the connection

---

## ✅ Solution 1: Check if Server is Running

```bash
# Check if anything is running on port 8000
lsof -i :8000
```

**If nothing shows up:**
- Server is not running
- Start it with: `./start-server.sh` or `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

**If processes show up:**
- Server might be running already
- Try accessing: http://localhost:8888/docs

---

## ✅ Solution 2: Kill Existing Processes

If port 8000 is occupied by old/stuck processes:

```bash
# Find processes on port 8000
lsof -i :8000

# Kill them (replace PID with actual process ID)
kill -9 PID

# Or kill all processes on port 8000
lsof -ti :8000 | xargs kill -9
```

---

## ✅ Solution 3: Use the Startup Script

We've created a helper script that handles everything:

```bash
./start-server.sh
```

This script will:
1. Check if port 8000 is in use
2. Offer to kill existing processes
3. Start the server
4. Show you the URLs to access

---

## ✅ Solution 4: Use a Different Port

If port 8000 is permanently blocked:

```bash
# Start on port 8001 instead
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Then access at:
# http://localhost:8001/docs
```

---

## ✅ Solution 5: Verify Setup

Run the verification script:

```bash
python verify_setup.py
```

This checks:
- All imports working
- Configuration correct
- Endpoints registered
- Test client working

---

## 🔍 Common Issues

### Issue 1: "Module not found" errors

**Solution:**
```bash
pip install -r requirements.txt
```

### Issue 2: "Database connection failed"

**Solution:**
```bash
# Start PostgreSQL
docker-compose up -d

# Or use SQLite (no setup needed)
# Edit .env and set:
# DATABASE_URL=sqlite:///./roadready.db
```

### Issue 3: "Import errors"

**Solution:**
```bash
# Make sure you're in the right directory
cd apps/roadready-api

# Set PYTHONPATH
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Try starting again
uvicorn app.main:app --reload
```

### Issue 4: "Permission denied"

**Solution:**
```bash
# Make scripts executable
chmod +x start-server.sh
chmod +x roadready

# Try again
./start-server.sh
```

---

## 📋 Quick Checklist

Before starting the server, verify:

- [ ] You're in the `apps/roadready-api` directory
- [ ] Dependencies are installed: `pip install -r requirements.txt`
- [ ] Port 8000 is free: `lsof -i :8000`
- [ ] Verification passes: `python verify_setup.py`
- [ ] Database is running (if using PostgreSQL)

---

## 🚀 Start Server (Multiple Methods)

### Method 1: Startup Script (Recommended)
```bash
./start-server.sh
```

### Method 2: Direct uvicorn
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Method 3: Using roadready script
```bash
./roadready start
```

### Method 4: Python module
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🌐 Access the API

Once started, access at:

- **Swagger UI:** http://localhost:8888/docs
- **ReDoc:** http://localhost:8888/redoc
- **Root:** http://localhost:8888/
- **Health Check:** http://localhost:8888/api/v1/health

---

## 🔍 Verify Server is Running

### Test with curl:
```bash
# Test root endpoint
curl http://localhost:8888/

# Test health endpoint
curl http://localhost:8888/api/v1/health

# Test Swagger UI
curl http://localhost:8888/docs
```

### Test in browser:
Open: http://localhost:8888/docs

You should see the Swagger UI interface.

---

## 🐛 Debug Mode

For more detailed error messages:

```bash
# Enable debug logging
export DEBUG=1

# Start with verbose output
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

---

## 📊 Check Server Status

```bash
# Check if server is responding
curl -I http://localhost:8888/

# Check specific endpoint
curl http://localhost:8888/api/v1/health

# Check all routes
curl http://localhost:8888/openapi.json | jq '.paths | keys'
```

---

## 🔄 Restart Server

If server is misbehaving:

```bash
# 1. Stop the server (Ctrl+C in terminal)

# 2. Kill any lingering processes
lsof -ti :8000 | xargs kill -9

# 3. Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null

# 4. Start fresh
./start-server.sh
```

---

## 🆘 Still Having Issues?

### Check Logs
Look at the terminal output when starting the server for error messages.

### Verify Python Version
```bash
python --version
# Should be Python 3.8+
```

### Verify Dependencies
```bash
pip list | grep -E "fastapi|uvicorn|sqlmodel"
```

### Check File Permissions
```bash
ls -la start-server.sh
ls -la roadready
# Should show execute permissions (x)
```

### Test Imports
```bash
python -c "from app.main import app; print('✓ App imports successfully')"
```

---

## 📞 Quick Help Commands

```bash
# Kill processes on port 8000
lsof -ti :8000 | xargs kill -9

# Verify setup
python verify_setup.py

# Start server
./start-server.sh

# Check if running
curl http://localhost:8888/api/v1/health
```

---

## ✅ Success Indicators

When server starts successfully, you should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Then you can access:
- http://localhost:8888/docs ✅

---

## 🎯 Next Steps

Once server is running:

1. ✅ Open http://localhost:8888/docs
2. ✅ Try the health endpoint
3. ✅ Test authentication endpoints
4. ✅ Review API documentation

---

**Need more help?** Check the other documentation files:
- `START_HERE.md` - Quick start guide
- `FIXES_APPLIED.md` - Recent fixes
- `verify_setup.py` - Automated verification
