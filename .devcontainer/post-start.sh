#!/bin/bash

echo "=========================================="
echo "AllMyAllergies DevContainer Started"
echo "=========================================="

# Ensure we're in the right directory
cd /workspaces/allmyallergies

# Check if node_modules exists, if not install
if [ ! -d "mobile/node_modules" ]; then
    echo "Installing dependencies..."
    cd mobile && npm install && cd ..
fi

# Display helpful info
echo ""
echo "Project: AllMyAllergies"
echo "Stack: React Native + Expo + TypeScript"
echo "AI: AgentDB agentic-flow (Reflexion, Skills, Causal)"
echo "Methodology: SPARC"
echo ""
echo "Available Commands:"
echo "  ./run.sh              - Start Expo dev server"
echo "  ./test.sh             - Run tests"
echo "  cd mobile && npm start - Start Expo directly"
echo "  claude-flow           - Agent orchestration"
echo ""
echo "Screens:"
echo "  - Home        : Dashboard"
echo "  - Scan        : Barcode/ingredient scanning"
echo "  - Journal     : Reaction tracking"
echo "  - AI Learn    : Learning insights"
echo "  - Profile     : Allergy management"
echo ""
echo "Documentation:"
echo "  docs/ARCHITECTURE.md"
echo "  docs/DEVELOPMENT.md"
echo "  docs/SPARC_METHODOLOGY.md"
echo ""
echo "=========================================="
