# 🔧 Quick Fix - Port 8000 Connection Issue

## ⚡ Fastest Solution

```bash
cd apps/roadready-api

# Kill any processes on port 8000
lsof -ti :8000 | xargs kill -9

# Start the server
./start-server.sh
```

Then open: **http://localhost:8888/docs**

---

## 🎯 Alternative Methods

### Method 1: Use the startup script
```bash
./start-server.sh
```

### Method 2: Direct command
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Method 3: Use roadready script
```bash
./roadready start
```

---

## ✅ Verify It's Working

```bash
# Test in terminal
curl http://localhost:8888/api/v1/health

# Or open in browser
open http://localhost:8888/docs
```

---

## 🐛 Still Not Working?

1. **Check if dependencies are installed:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Verify setup:**
   ```bash
   python verify_setup.py
   ```

3. **Check detailed troubleshooting:**
   See `TROUBLESHOOTING.md`

---

## 📞 Quick Commands

```bash
# Kill port 8000 processes
lsof -ti :8000 | xargs kill -9

# Start server
./start-server.sh

# Verify it's running
curl http://localhost:8888/api/v1/health
```

---

**That's it!** Your server should now be running on http://localhost:8888 🎉
