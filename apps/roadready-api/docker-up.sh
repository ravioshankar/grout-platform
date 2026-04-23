#!/usr/bin/env bash
# Build and start API + Postgres. Works with Compose V2 (`docker compose`) or v1 (`docker-compose`).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    echo "Neither 'docker compose' nor 'docker-compose' is available." >&2
    echo "Install Docker Desktop (includes Compose): https://www.docker.com/products/docker-desktop/" >&2
    echo "Or standalone v1: brew install docker-compose" >&2
    exit 1
  fi
}

compose up --build -d "$@"
