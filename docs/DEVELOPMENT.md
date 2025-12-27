# Development Guide

## Prerequisites

### Required Tools

1. **Node.js** (20+)
   ```bash
   # Using nvm
   nvm install 20
   nvm use 20
   ```

2. **React Native Development Environment**
   - **iOS**: Xcode 14+ (macOS only)
   - **Android**: Android Studio + SDK 33+

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/michaelcolletti/allmyallergies.git
cd allmyallergies
```

### 2. Install Dependencies

```bash
cd mobile
npm install
```

### 3. Run Development Server

**iOS (macOS only)**:
```bash
npm run ios
```

**Android**:
```bash
npm run android
```

**Web** (for testing):
```bash
npm run web
```

## Development Workflow

### Hot Reloading

The React Native metro bundler supports hot module replacement (HMR):

1. Make changes to TypeScript/React files
2. Save file
3. Changes appear instantly in app

### Code Structure

```
allmyallergies/
├── mobile/                          # React Native app
│   ├── src/
│   │   ├── core/                   # TypeScript core engine
│   │   │   ├── types.ts            # Base type definitions
│   │   │   ├── agenticTypes.ts     # AgentDB agentic-flow types
│   │   │   ├── allergenDatabase.ts # Allergen lookup database
│   │   │   ├── ingredientParser.ts # Text parsing
│   │   │   ├── allergenMatcher.ts  # Fuzzy matching
│   │   │   ├── allergiesEngine.ts  # Base detection engine
│   │   │   └── smartAllergiesEngine.ts # AI-enhanced engine
│   │   ├── screens/                # Screen components
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── ScanScreen.tsx      # With feedback system
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── AlertsScreen.tsx
│   │   │   ├── ReactionJournalScreen.tsx
│   │   │   └── LearningInsightsScreen.tsx
│   │   ├── services/               # Business logic
│   │   │   ├── allergiesService.ts
│   │   │   └── agentMemory.ts      # AgentDB implementation
│   │   └── store/                  # State management
│   │       └── allergyStore.ts
│   ├── App.tsx
│   └── package.json
└── docs/                           # Documentation
```

## Testing

### TypeScript Tests

```bash
cd mobile
npm test
```

### Type Checking

```bash
cd mobile
npm run type-check
```

### Linting

```bash
cd mobile
npm run lint
```

## Debugging

### React Native Debugger

1. Install React Native Debugger:
   ```bash
   brew install --cask react-native-debugger
   ```

2. Start app in debug mode:
   ```bash
   npm start
   # Press 'd' in terminal
   # Select "Debug JS Remotely"
   ```

### Flipper (Alternative)

1. Install [Flipper](https://fbflipper.com/)
2. Start app
3. Flipper auto-connects to running app

### Console Logging

AgentDB components log to console:
```typescript
// Initialization logs
✅ SmartAllergiesEngine initialized with agentic-flow
✅ AgentMemory initialized (agentic-flow)

// Feedback logs
✅ Feedback recorded - improving future detections
```

## AgentDB agentic-flow Development

### Memory Systems

The app implements three memory systems from ruv's agentic-flow:

**1. Reflexion Memory** (`agentMemory.ts`)
```typescript
// Store scan experience
await agentMemory.recordScanExperience(
  { ingredients, userAllergies },
  { detections, confidence, isSafe },
  success
);

// Retrieve similar experiences
const similar = await agentMemory.getRelevantExperiences(ingredients, allergies);
```

**2. Skill Library** (`agentMemory.ts`)
```typescript
// Create learned skill
await agentMemory.skills.create({
  name: "detect_groundnut",
  pattern: { trigger: "groundnut", action: "peanut", confidence: 1.0 },
  quality: 1.0
});

// Search skills
const skills = await agentMemory.getApplicableSkills(ingredients);
```

**3. Causal Memory** (`agentMemory.ts`)
```typescript
// Track reaction
await agentMemory.trackReaction({
  consumedItems: [{ name: "peanut butter", ingredients: ["peanuts"] }],
  reaction: { occurred: true, severity: "moderate", symptoms: ["hives"] }
});

// Get causal warnings
const warnings = await agentMemory.getCausalWarnings(ingredients);
```

### Adding New Skills

Skills are created automatically from:
1. User feedback on missed allergens
2. Successful pattern detection
3. Causal graph discovery

To manually add a skill:
```typescript
import { getAgentMemory } from './services/agentMemory';

const memory = getAgentMemory();
await memory.skills.create({
  name: 'custom_detection',
  description: 'Custom allergen detection pattern',
  category: 'allergen_detection',
  pattern: {
    trigger: 'ingredient_name',
    action: 'allergen_name',
    confidence: 0.95
  },
  quality: 0.9,
  learnedFrom: []
});
```

### Storage

All data is stored locally using AsyncStorage:
- `@allmyallergies:reflexion` - Scan episodes
- `@allmyallergies:skills` - Learned patterns
- `@allmyallergies:causal_edges` - Causal relationships
- `@allmyallergies:causal_nodes` - Causal graph nodes
- `@allmyallergies:reactions` - Reaction history
- `@allmyallergies:insights` - AI discoveries

### Exporting Data

```typescript
const data = await agentMemory.export();
console.log(JSON.stringify(data, null, 2));
```

## Code Style

### TypeScript

Using ESLint + Prettier:
```bash
cd mobile
npm run lint
npm run lint -- --fix
```

### Naming Conventions

- **Files**: `camelCase.ts` or `PascalCase.tsx` for components
- **Types/Interfaces**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

## Building for Production

### iOS

1. Configure signing in Xcode
2. Build:
   ```bash
   cd mobile
   eas build --platform ios
   ```

### Android

1. Configure keystore
2. Build:
   ```bash
   cd mobile
   eas build --platform android
   ```

## Performance

TypeScript performance is excellent for mobile:

| Operation | Time | User Perception |
|-----------|------|-----------------|
| Parse 100 ingredients | ~2ms | Instant |
| Fuzzy match 1000 items | ~10ms | Instant |
| Database lookup | < 1ms | Instant |
| Profile load | ~5ms | Instant |
| Learning retrieval | ~15ms | Instant |

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
cd mobile
npm start -- --reset-cache

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### iOS Build Fails

```bash
# Clean iOS build
cd mobile/ios
pod deintegrate
pod install
```

### Android Build Fails

```bash
# Clean Android build
cd mobile/android
./gradlew clean
```

### AsyncStorage Issues

```bash
# Clear app data (simulator)
# iOS: Delete app and reinstall
# Android: Settings > Apps > AllMyAllergies > Clear Data
```

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Run tests: `npm test && npm run type-check`
4. Commit: `git commit -m "feat: add my feature"`
5. Push: `git push origin feature/my-feature`
6. Create pull request

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Tamagui Docs](https://tamagui.dev/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [agentic-flow](https://github.com/ruvnet/agentic-flow)
- [SPARC Methodology](https://github.com/ruvnet/sparc)
