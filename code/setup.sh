#!/usr/bin/env bash
set -e

VENV_DIR=".venv"

echo "▶ Checking for Python..."
if ! command -v python3 >/dev/null 2>&1; then
    echo "✖ python3 not found. Please install Python 3."
    exit 1
fi

echo "▶ Creating virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
else
    echo "ℹ Virtual environment already exists"
fi

echo "▶ Activating virtual environment..."
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

echo "▶ Upgrading pip..."
pip install --upgrade pip

echo "▶ Installing dependencies..."
pip install -r requirements.txt

echo "✔ Setup complete"
echo
echo "To start the app:"
echo "  source .venv/bin/activate"
echo "  python ../app/routes.py"

echo "To deactivate venv:"
echo "  deactivate"

