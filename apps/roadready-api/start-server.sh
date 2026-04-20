#!/usr/bin/env bash
# RoadReady API — one-shot local server (venv, deps, schema, uvicorn)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${ROADREADY_PORT:-8888}"

resolve_python() {
  if [[ -n "${ROADREADY_PYTHON:-}" && -x "${ROADREADY_PYTHON}" ]]; then
    printf '%s\n' "${ROADREADY_PYTHON}"
    return
  fi
  local pyenv_root="${PYENV_ROOT:-$HOME/.pyenv}"
  local v ver
  if [[ -d "$pyenv_root/versions" ]]; then
    for v in $(ls -1 "$pyenv_root/versions" 2>/dev/null | sort -V); do
      [[ -z "$v" ]] && continue
      [[ -x "$pyenv_root/versions/$v/bin/python3" ]] || continue
      ver="$("$pyenv_root/versions/$v/bin/python3" -c 'import sys; print(f"{sys.version_info[0]}.{sys.version_info[1]}")' 2>/dev/null || true)"
      case "$ver" in
        3.10|3.11|3.12) printf '%s\n' "$pyenv_root/versions/$v/bin/python3"; return ;;
      esac
    done
  fi
  for cmd in python3.12 python3.11 python3.10 python3; do
    if command -v "$cmd" &>/dev/null; then
      ver="$("$cmd" -c 'import sys; print(f"{sys.version_info[0]}.{sys.version_info[1]}")' 2>/dev/null || true)"
      case "$ver" in
        3.10|3.11|3.12) command -v "$cmd"; return ;;
      esac
    fi
  done
  command -v python3 2>/dev/null || true
}

PYTHON_BIN="$(resolve_python)"
if [[ -z "$PYTHON_BIN" || ! -x "$PYTHON_BIN" ]]; then
  echo "No usable Python found. Install 3.10–3.12 (recommended: 3.12) or set ROADREADY_PYTHON to its binary."
  exit 1
fi

PY_MM="$("$PYTHON_BIN" -c 'import sys; print(f"{sys.version_info[0]}.{sys.version_info[1]}")')"
if [[ "$PY_MM" == "3.13" || "$PY_MM" == "3.14" ]]; then
  echo "Warning: Python ${PY_MM} often cannot install pinned wheels (e.g. pydantic-core)."
  echo "Install Python 3.12 and either add it to PATH or run: ROADREADY_PYTHON=/path/to/python3.12 ./start-server.sh"
fi

# Drop venv if it was created with Python 3.13+ (broken installs with current pins)
if [[ -d .venv && -x .venv/bin/python ]]; then
  if ! .venv/bin/python -c 'import sys; sys.exit(0 if sys.version_info < (3, 13) else 1)'; then
    echo "Removing .venv (was Python 3.13+); recreating with ${PYTHON_BIN}..."
    rm -rf .venv
  fi
fi

if [[ ! -d .venv ]]; then
  echo "Creating .venv with ${PYTHON_BIN}..."
  "$PYTHON_BIN" -m venv .venv
fi

# shellcheck source=/dev/null
source .venv/bin/activate

echo "Installing dependencies (requirements.txt)..."
pip install -q -r requirements.txt

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
python roadready db:push

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
exec uvicorn app.main:app --reload --host 0.0.0.0 --port "${PORT}"
