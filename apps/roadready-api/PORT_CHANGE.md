# ✅ Port Changed to 8888

## 🔄 What Changed

The RoadReady API now runs on **port 8888** instead of port 8000.

---

## 📝 Files Updated

### Configuration Files
- ✅ `.env` - Updated OAUTH_REDIRECT_URI
- ✅ `.env.example` - Updated API_PORT and OAUTH_REDIRECT_URI
- ✅ `start-server.sh` - Updated port and URLs
- ✅ `roadready` - Updated uvicorn command

### Documentation Files
- ✅ All `.md` files updated with new port
- ✅ All examples and curl commands updated

---

## 🚀 New URLs

### API Access
- **Swagger UI:** http://localhost:8888/docs
- **ReDoc:** http://localhost:8888/redoc
- **Root:** http://localhost:8888/
- **Health Check:** http://localhost:8888/api/v1/health

### OAuth Redirect
- **Redirect URI:** http://localhost:8888/api/v1/auth/callback

---

## 🔧 How to Start

### Option 1: Using startup script
```bash
./start-server.sh
```

### Option 2: Using roadready script
```bash
./roadready start
```

### Option 3: Direct uvicorn command
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8888
```

---

## ✅ Verify It's Working

```bash
# Test health endpoint
curl http://localhost:8888/api/v1/health

# Should return:
# {"status":"healthy"}
```

**Or open in browser:**
http://localhost:8888/docs

---

## 🔍 Check Port Status

```bash
# Check if port 8888 is in use
lsof -i :8888

# Kill processes on port 8888 if needed
lsof -ti :8888 | xargs kill -9
```

---

## 📊 Port Comparison

| Item | Old Port | New Port |
|------|----------|----------|
| **API Server** | 8000 | 8888 |
| **Swagger UI** | :8000/docs | :8888/docs |
| **Health Check** | :8000/api/v1/health | :8888/api/v1/health |
| **OAuth Redirect** | :8000/api/v1/auth/callback | :8888/api/v1/auth/callback |

---

## 🔄 Why Port 8888?

Port 8888 is commonly used for:
- ✅ Alternative web development port
- ✅ Less likely to conflict with other services
- ✅ Easy to remember (8888)
- ✅ Avoids conflicts with common services on 8000

---

## ⚠️ Important Notes

### OAuth Configuration
If you're using OAuth (Google/Facebook), update your OAuth redirect URIs:

**Google Cloud Console:**
- Old: `http://localhost:8000/api/v1/auth/callback/google`
- New: `http://localhost:8888/api/v1/auth/callback/google`

**Facebook Developers:**
- Old: `http://localhost:8000/api/v1/auth/callback/facebook`
- New: `http://localhost:8888/api/v1/auth/callback/facebook`

### Frontend Configuration
If you have a frontend connecting to this API, update the API URL:
- Old: `http://localhost:8000`
- New: `http://localhost:8888`

---

## 🧪 Test the Change

### 1. Start the server
```bash
./start-server.sh
```

### 2. Test endpoints
```bash
# Health check
curl http://localhost:8888/api/v1/health

# Swagger UI
open http://localhost:8888/docs
```

### 3. Verify in logs
You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8888
```

---

## 🔧 Troubleshooting

### Port 8888 already in use?
```bash
# Find what's using it
lsof -i :8888

# Kill the process
lsof -ti :8888 | xargs kill -9

# Try starting again
./start-server.sh
```

### Can't connect to port 8888?
```bash
# Check if server is running
lsof -i :8888

# Check firewall settings
# Make sure port 8888 is not blocked
```

### Want to use a different port?
Edit `.env` and add:
```bash
API_PORT=9999  # or any port you prefer
```

Then start with:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 9999
```

---

## ✅ Summary

- ✅ Port changed from 8000 to 8888
- ✅ All configuration files updated
- ✅ All documentation updated
- ✅ Startup scripts updated
- ✅ Ready to use!

---

**Start the server:**
```bash
./start-server.sh
```

**Access at:**
http://localhost:8888/docs

---

*Updated: November 2024*
*New Port: 8888*
*Status: Ready*
