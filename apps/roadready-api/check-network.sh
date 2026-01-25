#!/bin/bash

echo "🔍 Network Configuration Check"
echo "================================"
echo ""

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "📍 Your machine's IP: $LOCAL_IP"
echo ""

# Check if server is running
if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Server is running on port 8888"
    echo ""
    echo "🌐 API accessible at:"
    echo "   - http://localhost:8888 (from this machine)"
    echo "   - http://$LOCAL_IP:8888 (from Android emulator/device)"
    echo ""
    
    # Test connectivity
    echo "🧪 Testing connectivity..."
    if curl -s http://$LOCAL_IP:8888/api/v1/health > /dev/null; then
        echo "✅ API is accessible from $LOCAL_IP"
    else
        echo "❌ Cannot reach API at $LOCAL_IP"
        echo "   Check your firewall settings"
    fi
else
    echo "❌ Server is NOT running on port 8888"
    echo "   Run: ./start-server.sh"
fi

echo ""
echo "📱 Update your React Native app to use:"
echo "   http://$LOCAL_IP:8888"
