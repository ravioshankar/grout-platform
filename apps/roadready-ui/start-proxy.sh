#!/bin/bash

echo "🔄 Starting API Proxy Server..."
echo ""
echo "📡 Proxy: http://0.0.0.0:3000"
echo "🎯 Target: http://127.0.0.1:8888"
echo "📱 Android: http://10.0.0.2:3000"
echo ""

npm run proxy
