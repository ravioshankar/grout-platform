#!/usr/bin/env sh
set -e
cd /app

echo "Running database migrations (alembic upgrade head)..."
alembic upgrade head

echo "Starting uvicorn on 0.0.0.0:8888..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8888
