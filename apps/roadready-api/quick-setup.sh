#!/bin/bash

# RoadReady API - Quick Setup Script

echo "🚀 RoadReady API - Quick Setup"
echo "================================"
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    
    # Check if Docker is running
    if docker info &> /dev/null; then
        echo "✅ Docker is running"
        echo ""
        echo "Starting PostgreSQL with Docker..."
        docker compose up -d
        
        if [ $? -eq 0 ]; then
            echo "✅ PostgreSQL started successfully"
            echo ""
            echo "Database Details:"
            echo "  Host: localhost"
            echo "  Port: 5433"
            echo "  Database: roadready"
            echo "  User: roadready"
            echo "  Password: roadready"
            echo ""
        else
            echo "❌ Failed to start PostgreSQL"
            echo "Falling back to SQLite..."
            USE_SQLITE=true
        fi
    else
        echo "⚠️  Docker is not running"
        echo "Please start Docker Desktop and try again"
        echo ""
        echo "Or use SQLite instead (no Docker required)"
        read -p "Use SQLite? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            USE_SQLITE=true
        else
            exit 1
        fi
    fi
else
    echo "⚠️  Docker is not installed"
    echo ""
    echo "Options:"
    echo "1. Install Docker Desktop: https://www.docker.com/products/docker-desktop"
    echo "2. Use SQLite (no installation required)"
    echo ""
    read -p "Use SQLite? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        USE_SQLITE=true
    else
        echo "Please install Docker and run this script again"
        exit 1
    fi
fi

# Configure SQLite if needed
if [ "$USE_SQLITE" = true ]; then
    echo ""
    echo "Configuring SQLite..."
    
    # Update .env to use SQLite
    if [ -f .env ]; then
        # Backup original .env
        cp .env .env.backup
        
        # Update DATABASE_URL
        sed -i.bak 's|DATABASE_URL=postgresql.*|DATABASE_URL=sqlite:///./roadready.db|g' .env
        rm .env.bak
        
        echo "✅ Configured to use SQLite"
        echo ""
        echo "Database Details:"
        echo "  Type: SQLite"
        echo "  File: ./roadready.db"
        echo "  (Will be created automatically)"
    fi
fi

# Initialize database
echo ""
echo "Initializing database..."
python scripts/create_migrations.py

if [ $? -eq 0 ]; then
    echo "✅ Database initialized"
else
    echo "⚠️  Database initialization had issues (may be okay)"
fi

# Verify setup
echo ""
echo "Verifying setup..."
python verify_setup.py

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start the server: ./start-server.sh"
echo "2. Open browser: http://localhost:8888/docs"
echo ""
