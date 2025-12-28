#!/bin/bash
set -e

echo "=========================================="
echo "AllMyAllergies DevContainer Setup"
echo "SPARC + AgentDB agentic-flow + claude-flow"
echo "=========================================="

# Install global npm packages
echo "Installing global npm packages..."
npm install -g \
    expo-cli \
    eas-cli \
    @expo/ngrok \
    typescript \
    ts-node \
    nodemon \
    concurrently

# Install claude-flow (ruv's agent orchestration)
echo "Installing claude-flow..."
npm install -g claude-flow

# Install SPARC CLI (if available)
echo "Installing SPARC CLI..."
pip install --user sparc 2>/dev/null || echo "SPARC pip package not found, skipping..."

# Install project dependencies
echo "Installing mobile app dependencies..."
cd /workspaces/allmyallergies/mobile
npm install

# Create .claude directory for claude-flow config if it doesn't exist
mkdir -p ~/.claude
mkdir -p /workspaces/allmyallergies/.claude

# Initialize claude-flow config
echo "Initializing claude-flow configuration..."
cat > /workspaces/allmyallergies/.claude/config.json << 'EOF'
{
  "project": "allmyallergies",
  "methodology": "SPARC",
  "agents": {
    "architect": {
      "role": "System Architect",
      "capabilities": ["architecture", "design", "review"]
    },
    "developer": {
      "role": "Developer",
      "capabilities": ["code", "test", "debug"]
    },
    "reviewer": {
      "role": "Code Reviewer",
      "capabilities": ["review", "security", "quality"]
    }
  },
  "memory": {
    "type": "agentdb",
    "persistence": "local",
    "path": ".claude/memory"
  },
  "sparc": {
    "specification": "docs/SPARC_METHODOLOGY.md",
    "phases": ["specification", "pseudocode", "architecture", "refinement", "completion"]
  }
}
EOF

# Create memory directory for AgentDB
mkdir -p /workspaces/allmyallergies/.claude/memory

# Create claude-flow commands directory
mkdir -p /workspaces/allmyallergies/.claude/commands

# Create useful claude-flow slash commands
cat > /workspaces/allmyallergies/.claude/commands/analyze.md << 'EOF'
Analyze the ingredient list provided and check for allergens using the SmartAllergiesEngine.
Use the agentic-flow memory systems to learn from this analysis.
EOF

cat > /workspaces/allmyallergies/.claude/commands/sparc-review.md << 'EOF'
Review the current implementation against SPARC methodology phases:
1. Specification - Are requirements clear?
2. Pseudocode - Is the algorithm design sound?
3. Architecture - Is the system design modular?
4. Refinement - Can we improve performance?
5. Completion - Is it production-ready?
EOF

cat > /workspaces/allmyallergies/.claude/commands/learn.md << 'EOF'
Review the AgentDB memory systems and report on:
- Reflexion episodes stored
- Skills learned
- Causal patterns discovered
- Insights generated
EOF

echo "Creating convenience scripts..."

# Create run script
cat > /workspaces/allmyallergies/run.sh << 'EOF'
#!/bin/bash
cd /workspaces/allmyallergies/mobile
npm start
EOF
chmod +x /workspaces/allmyallergies/run.sh

# Create test script
cat > /workspaces/allmyallergies/test.sh << 'EOF'
#!/bin/bash
cd /workspaces/allmyallergies/mobile
npm run type-check && npm test
EOF
chmod +x /workspaces/allmyallergies/test.sh

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Quick Start:"
echo "  ./run.sh          - Start Expo development server"
echo "  ./test.sh         - Run type check and tests"
echo "  claude-flow       - Run claude-flow agent orchestration"
echo ""
echo "SPARC Methodology: docs/SPARC_METHODOLOGY.md"
echo "Architecture: docs/ARCHITECTURE.md"
echo ""
