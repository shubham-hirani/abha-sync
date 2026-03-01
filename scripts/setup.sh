#!/bin/bash
# ═══════════════════════════════════════
#  ABHA-Sync MVP - Setup Script
# ═══════════════════════════════════════

set -e

echo "═══════════════════════════════════════"
echo "  ABHA-Sync MVP Setup"
echo "═══════════════════════════════════════"
echo ""

# Check prerequisites
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "❌ $1 is not installed. Please install it first."
    exit 1
  fi
  echo "✅ $1 found"
}

echo "Checking prerequisites..."
check_command docker
check_command node
check_command npm
echo ""

# Create .env if not exists
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

# Create data directory
mkdir -p services/data

# Install dependencies
echo "Installing dependencies..."
cd services/shared && npm install && cd ../..
cd services/ai-extraction && npm install && cd ../..
cd services/medical-normalization && npm install && cd ../..
cd services/fhir-generator && npm install && cd ../..
cd services/abha-mock-service && npm install && cd ../..
cd services/api-gateway && npm install && cd ../..

echo ""
echo "═══════════════════════════════════════"
echo "  Setup complete!"
echo ""
echo "  Run with Docker:  make start"
echo "  Run tests:        make test"
echo "═══════════════════════════════════════"
