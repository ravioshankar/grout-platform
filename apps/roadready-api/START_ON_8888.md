# 🚀 Start RoadReady API on Port 8888

## ⚡ Quick Start

```bash
cd apps/roadready-api

# Start the server
./start-server.sh
```

**Access at:** http://localhost:8888/docs

---

## 📍 New Port: 8888

All services now run on port **8888**:

- **Swagger UI:** http://localhost:8888/docs
- **ReDoc:** http://localhost:8888/redoc
- **Health:** http://localhost:8888/api/v1/health
- **Root:** http://localhost:8888/

---

## 🔧 Start Commands

### Option 1: Startup Script (Recommended)
```bash
./start-server.sh
```

### Option 2: Roadready Script
```bash
./roadready start
```

### Option 3: Direct Command
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8888
```

---

## ✅ Verify

```bash
# Test health endpoint
curl http://localhost:8888/api/v1/health

# Open Swagger UI
open http://localhost:8888/docs
```

---

## 🔍 Troubleshooting

### Port 8888 in use?
```bash
# Kill processes on port 8888
lsof -ti :8888 | xargs kill -9

# Start again
./start-server.sh
```

---

## 📚 More Info

- **PORT_CHANGE.md** - Details about the port change
- **TROUBLESHOOTING.md** - Common issues
- **SETUP_COMPLETE.md** - Complete setup guide

---

**Ready!** Start with `./start-server.sh` 🎉
