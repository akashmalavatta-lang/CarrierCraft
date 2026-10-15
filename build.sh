#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== Career Craft: Installing Python Backend Dependencies ==="
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "=== Ensuring backend directories exist ==="
mkdir -p backend/instance backend/uploads

# If Node and npm are available in the build environment, build the React frontend
if command -v npm &> /dev/null; then
    echo "=== Building React Frontend ==="
    cd frontend
    npm install
    npm run build
    cd ..
    echo "=== Frontend built into frontend/dist ==="
fi

echo "=== Career Craft Build Finished Successfully ==="
