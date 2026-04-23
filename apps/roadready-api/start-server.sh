#!/usr/bin/env bash
# RoadReady API — one-shot local server (uv, deps, schema, uvicorn)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${ROADREADY_PORT:-8888}"

# rustls defaults can miss macOS Keychain / corporate roots → "UnknownIssuer" on downloads.
# Prefer the OS trust store unless the user opted out.
export UV_SYSTEM_CERTS="${UV_SYSTEM_CERTS:-true}"

if ! command -v uv &>/dev/null; then
  echo "uv is required. Install: https://docs.astral.sh/uv/"
  exit 1
fi

python_ok() {
  [[ -x "$1" ]] && "$1" -c 'import sys; sys.exit(0 if (3,10) <= sys.version_info[:2] < (3,13) else 1)' 2>/dev/null
}

# Populate PY_SPEC: absolute path to a 3.10–3.12 binary, or a version string for uv python install.
resolve_python() {
  if [[ -n "${ROADREADY_PYTHON:-}" ]]; then
    if ! python_ok "${ROADREADY_PYTHON}"; then
      echo "ROADREADY_PYTHON must point to Python 3.10–3.12 (project requires-python: <3.13)."
      exit 1
    fi
    printf '%s\n' "${ROADREADY_PYTHON}"
    return
  fi

  local candidates=()
  if [[ -n "${ROADREADY_PYTHON_VERSION:-}" ]]; then
    local mm="${ROADREADY_PYTHON_VERSION#3.}"
    candidates=("python3.${mm}")
  else
    candidates=(python3.12 python3.11 python3.10)
  fi

  local cmd p
  for cmd in "${candidates[@]}"; do
    p="$(command -v "$cmd" 2>/dev/null || true)"
    if [[ -n "$p" ]] && python_ok "$p"; then
      echo "Using local interpreter: $p" >&2
      printf '%s\n' "$p"
      return
    fi
  done

  local want="${ROADREADY_PYTHON_VERSION:-3.12}"
  echo "No local Python 3.10–3.12 on PATH; installing ${want} with uv (set ROADREADY_PYTHON or install e.g. brew install python@3.12 to skip)." >&2
  uv python install "$want" >&2
  printf '%s\n' "$want"
}

PY_SPEC="$(resolve_python)"
export UV_PYTHON="$PY_SPEC"

# Drop broken, incomplete, or Python 3.13+ venvs
if [[ -d .venv ]]; then
  if [[ ! -x .venv/bin/python ]] || ! .venv/bin/python -c 'import sys' 2>/dev/null; then
    echo "Removing broken or incomplete .venv..."
    rm -rf .venv
  elif ! .venv/bin/python -c 'import sys; sys.exit(0 if sys.version_info < (3, 13) else 1)' 2>/dev/null; then
    echo "Removing .venv (was Python 3.13+); recreating with ${PY_SPEC}..."
    rm -rf .venv
  fi
fi

if [[ ! -d .venv ]]; then
  echo "Creating .venv with ${PY_SPEC} (uv)..."
  uv venv
fi

uv sync

if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env
    if grep -q '^DATABASE_URL=postgresql' .env 2>/dev/null; then
      sed -i.bak 's|^DATABASE_URL=postgresql.*|DATABASE_URL=sqlite:///./roadready.db|' .env
      rm -f .env.bak
    fi
    echo "Created .env from .env.example (default DATABASE_URL: SQLite for local use)."
  else
    printf '%s\n' "DATABASE_URL=sqlite:///./roadready.db" > .env
    echo "Created minimal .env with SQLite (no .env.example found)."
  fi
fi

echo "Syncing database schema (SQLModel)..."
uv run python roadready db:push

echo ""
echo "Starting RoadReady API on http://localhost:${PORT}"
echo "  Swagger: http://localhost:${PORT}/docs"
echo "  Health:  http://localhost:${PORT}/api/v1/health"
echo ""

if lsof -Pi ":${PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Port ${PORT} is already in use:"
  lsof -i ":${PORT}" || true
  echo ""
  if [[ -t 0 ]]; then
    read -r -p "Kill listeners on ${PORT} and continue? (y/n) " -n 1 -r
    echo ""
    if [[ ${REPLY:-n} =~ ^[Yy]$ ]]; then
      lsof -ti ":${PORT}" | xargs kill -9 2>/dev/null || true
      echo "Port ${PORT} cleared."
    else
      echo "Exiting. Free the port or set ROADREADY_PORT."
      exit 1
    fi
  else
    echo "Non-interactive shell: set ROADREADY_PORT or free port ${PORT}."
    exit 1
  fi
fi

echo "Press Ctrl+C to stop."
echo "─────────────────────────────────────────────────────────"
exec uv run uvicorn app.main:app --reload --host 0.0.0.0 --port "${PORT}"
