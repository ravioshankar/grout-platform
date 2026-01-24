#!/bin/bash

# RoadReady API - Server Startup Script

echo "🚀 Starting RoadReady API Server..."
echo ""

# Check if port 8888 is already in use
if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 8888 is already in use!"
    echo ""
    echo "Processes using port 8888:"
    lsof -i :8888
    echo ""
    read -p "Kill these processes and start fresh? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Killing processes on port 8888..."
        lsof -ti :8888 | xargs kill -9 2>/dev/null
        echo "✅ Port 8888 is now free"
        echo ""
    else
        echo "❌ Exiting. Please free port 8888 manually."
        exit 1
    fi
fi

# Start the server
echo "Starting server on http://localhost:8888"
echo ""
echo "📚 API Documentation:"
echo "   Swagger UI: http://localhost:8888/docs"
echo "   ReDoc:      http://localhost:8888/redoc"
echo "   Health:     http://localhost:8888/api/v1/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Start uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8888
