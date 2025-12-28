# DevContainer for AllMyAllergies

This devcontainer configuration supports development with:
- **SPARC Methodology** - Structured development approach
- **claude-flow** - Agent orchestration for AI-assisted development
- **AgentDB agentic-flow** - Intelligent learning system

## Quick Start with DevPod

### 1. Install DevPod

```bash
# macOS
brew install devpod

# Linux
curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-linux-amd64"
chmod +x devpod
sudo mv devpod /usr/local/bin/

# Windows
winget install loft-sh.devpod
```

### 2. Start the DevContainer

```bash
# From the project root
devpod up .

# Or specify a provider
devpod up . --provider docker

# With IDE integration
devpod up . --ide vscode
devpod up . --ide openvscode
devpod up . --ide cursor
```

### 3. Connect to DevContainer

```bash
# SSH into the container
devpod ssh allmyallergies

# Or open in VS Code
devpod up . --ide vscode
```

## What's Included

### Tools
- Node.js 20
- TypeScript 5.3
- Expo CLI
- EAS CLI
- Python 3.11 (for SPARC CLI)
- claude-flow
- Git & GitHub CLI
- Docker-in-Docker

### VS Code Extensions
- ESLint & Prettier
- React Native Tools
- Expo Tools
- GitLens
- Jest Runner
- TypeScript Error Translator

### Ports
| Port | Service |
|------|---------|
| 8081 | Metro Bundler |
| 19000 | Expo |
| 19001 | Expo DevTools |
| 19002 | Expo Web |
| 3000 | Dev Server |
| 5000 | claude-flow |

## Using claude-flow

claude-flow is pre-installed and configured for this project.

### Initialize
```bash
claude-flow init
```

### Run Agent Orchestration
```bash
claude-flow run
```

### Available Commands
```bash
# Review code with SPARC methodology
claude-flow /sparc-review

# Analyze ingredients for allergens
claude-flow /analyze

# Check learning system status
claude-flow /learn
```

### Configuration

The claude-flow config is at `.claude/config.json`:

```json
{
  "project": "allmyallergies",
  "methodology": "SPARC",
  "memory": {
    "type": "agentdb",
    "persistence": "local"
  }
}
```

## Development Workflow

### Start Development Server
```bash
./run.sh
# or
cd mobile && npm start
```

### Run Tests
```bash
./test.sh
# or
cd mobile && npm run type-check && npm test
```

### Run on Device

**iOS (Expo Go)**:
1. Start dev server: `./run.sh`
2. Scan QR code with iPhone camera
3. Opens in Expo Go app

**Android**:
1. Start dev server: `./run.sh`
2. Press 'a' in terminal
3. Opens in Android emulator or device

## File Structure

```
.devcontainer/
├── devcontainer.json    # Main configuration
├── Dockerfile           # Custom image (optional)
├── docker-compose.yml   # Multi-service setup
├── post-create.sh       # Runs after container creation
├── post-start.sh        # Runs on each start
└── README.md            # This file

.claude/
├── config.json          # claude-flow configuration
├── commands/            # Custom slash commands
│   ├── analyze.md
│   ├── sparc-review.md
│   └── learn.md
└── memory/              # AgentDB persistent storage
```

## Troubleshooting

### Container won't start
```bash
# Rebuild without cache
devpod up . --recreate
```

### Node modules issues
```bash
# Clear and reinstall
rm -rf mobile/node_modules
cd mobile && npm install
```

### Metro bundler issues
```bash
# Clear cache
cd mobile && npm start -- --reset-cache
```

### Port conflicts
```bash
# Check what's using ports
lsof -i :8081
lsof -i :19000
```

## Environment Variables

Set these in your environment or `.env` file:

```bash
# Expo
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# claude-flow (optional)
ANTHROPIC_API_KEY=your-key-here
```

## Resources

- [DevPod Documentation](https://devpod.sh/docs)
- [claude-flow](https://github.com/ruvnet/claude-flow)
- [SPARC Methodology](https://github.com/ruvnet/sparc)
- [AgentDB agentic-flow](https://github.com/ruvnet/agentic-flow)
- [Expo Documentation](https://docs.expo.dev/)
