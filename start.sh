#!/usr/bin/env bash
# ==============================================================================
# SKILL PASSPORT - Launcher Script
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================================"
echo "          SKILL PASSPORT - AI Career Intelligence Platform             "
echo "========================================================================"

# Run test suite to verify integrity
echo "[1/3] Running verification test suite..."
python3 -m unittest discover tests

echo ""
echo "[2/3] Verification passed! Initializing database & services..."

# Launch FastAPI server
echo "[3/3] Launching Skill Passport on http://0.0.0.0:8000 ..."
echo ""
echo "-> Student & Public Portal: http://localhost:8000"
echo "-> Interactive Swagger Docs: http://localhost:8000/docs"
echo "-> Super Admin (Owner Only): http://localhost:8000/#owner-login"
echo "   Default Owner Email:     owner@skillpassport.ai"
echo "   Owner Bootstrap Secret:   SkillPassportOwner2026!Bootstrap"
echo "========================================================================"

exec python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
