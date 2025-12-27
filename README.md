# AllMyAllergies

**The World's Best Allergies App** - AI-powered allergen detection that learns from you.

Built with ruv's **SPARC methodology** and **AgentDB agentic-flow**.

## Overview

AllMyAllergies is an intelligent mobile application that protects users from food allergies through:

- **Smart Detection** - AI-powered ingredient analysis that improves over time
- **Personalized Learning** - Learns your specific allergen patterns and cross-reactions
- **Causal Discovery** - Automatically discovers hidden allergen relationships from your reaction history
- **Privacy-First** - All AI learning happens on-device, your health data never leaves your phone

## Architecture

Built following ruv's **SPARC Methodology**:

- **Specification** - Clear requirements for allergy protection
- **Pseudocode** - Algorithm design before implementation
- **Architecture** - Layered, modular design
- **Refinement** - Iterative improvement
- **Completion** - Production-ready code

### Key Design Principles

- **Simple & Maintainable** - Pure TypeScript for fast development
- **Mobile-First** - Optimized for React Native
- **Local-First** - Privacy-focused offline operation
- **Fast Enough** - Modern JS/TS performance is excellent
- **Pragmatic** - No over-engineering

## Core Features

### Intelligent Scanning
- Barcode scanning with instant ingredient analysis
- Manual ingredient input with smart parsing
- Fuzzy matching for misspellings and variations
- **AI-enhanced detection** using learned patterns

### AI Learning System (AgentDB agentic-flow)

**Reflexion Memory** - Learns from every scan:
- Records all detection attempts with outcomes
- Retrieves similar past experiences to inform new scans
- Self-critiques to improve accuracy over time

**Skill Library** - Reusable knowledge:
- Creates detection skills from successful patterns
- Learns allergen aliases (e.g., "groundnut" = "peanut")
- Skills improve with usage and feedback

**Causal Memory Graph** - Discovers relationships:
- Tracks cause-and-effect from reaction history
- Discovers hidden cross-reactions specific to you
- Predicts likely reactions based on patterns

### Personalized Protection
- Detailed allergy & sensitivity profiles
- AI-discovered cross-reactivity warnings
- Severity level tracking (Mild, Moderate, Severe, Anaphylaxis)
- Learns YOUR specific triggers over time

### Real-Time Alerts
- Instant allergen detection with confidence scores
- Haptic feedback for safety warnings
- Causal warnings from personal history
- **Learning improvement indicators**

### Reaction Journal
- Log meals and allergic reactions
- Track symptoms, timing, and severity
- Automatic causal pattern discovery
- Safe consumption logging for better AI training

### Learning Insights Dashboard
- View AI learning statistics
- See discovered patterns and insights
- Track accuracy improvements
- Export learning data for backup

## Tech Stack

### Frontend (Mobile)
- **React Native 0.73** - Cross-platform framework
- **Expo 50** - Development platform
- **TypeScript** - Type safety and better DX
- **Tamagui** - Native-feeling UI components
- **Zustand** - State management
- **Fuse.js** - Fuzzy search

### Core Engine (TypeScript)
- **Fast parsing** - Regex-based ingredient parsing
- **Fuzzy matching** - Levenshtein distance algorithm
- **Cross-reaction detection** - Built-in allergen relationships
- **Confidence scoring** - 0.0-1.0 match confidence

### Data & Storage
- **AsyncStorage** - Local profile storage
- **In-memory DB** - Fast allergen lookup
- **SQLite** - Ready for future expansion

### Native Capabilities
- **Expo Camera** - Barcode scanning
- **Expo Haptics** - Tactile feedback
- **Expo Notifications** - Push alerts

## Project Structure

```
allmyallergies/
├── mobile/                       # React Native app
│   ├── src/
│   │   ├── core/                # TypeScript core engine
│   │   │   ├── types.ts         # Base type definitions
│   │   │   ├── agenticTypes.ts  # AgentDB/agentic-flow types
│   │   │   ├── allergenDatabase.ts
│   │   │   ├── ingredientParser.ts
│   │   │   ├── allergenMatcher.ts
│   │   │   ├── allergiesEngine.ts      # Base detection engine
│   │   │   └── smartAllergiesEngine.ts # AI-enhanced engine
│   │   ├── screens/             # App screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── ScanScreen.tsx           # With feedback system
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── AlertsScreen.tsx
│   │   │   ├── ReactionJournalScreen.tsx  # NEW: Track reactions
│   │   │   └── LearningInsightsScreen.tsx # NEW: AI learning stats
│   │   ├── services/            # Business logic
│   │   │   ├── allergiesService.ts
│   │   │   └── agentMemory.ts   # AgentDB implementation
│   │   └── store/               # State management
│   │       └── allergyStore.ts
│   ├── App.tsx
│   └── package.json
└── docs/                        # Documentation
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT.md
    └── SPARC_METHODOLOGY.md     # Includes agentic-flow integration
```

## Getting Started

### Prerequisites
- Node.js 20+
- React Native development environment
- iOS (macOS + Xcode) or Android (Android Studio)

### Installation

```bash
# Clone repository
git clone https://github.com/michaelcolletti/allmyallergies.git
cd allmyallergies

# Install dependencies
cd mobile
npm install

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android

# Run on Web (for testing)
npm run web
```

## Performance

TypeScript performance is **fast enough** for mobile:

| Operation | Time | User Perception |
|-----------|------|-----------------|
| Parse 100 ingredients | ~2ms | Instant |
| Fuzzy match 1000 items | ~10ms | Instant |
| Database lookup | < 1ms | Instant |
| Profile load | ~5ms | Instant |

**The key insight**: Users can't perceive differences under ~100ms, so our TypeScript implementation feels instant!

## Safety & Privacy

- **Local-first**: All data stored on device by default
- **No tracking**: Your allergies stay private
- **HIPAA-ready**: Healthcare-grade data protection
- **Offline-capable**: Full functionality without internet

## Development Philosophy

### Why TypeScript (Not Rust/WASM)?

We chose TypeScript for:

1. **Faster Development** - Iterate quickly, ship faster
2. **Easier Maintenance** - More developers know TS than Rust
3. **Better Mobile Support** - React Native loves TypeScript
4. **Smaller Bundle** - No 1.4MB WASM binary
5. **Simpler Debugging** - Chrome DevTools work perfectly
6. **Good Enough Performance** - 2ms vs 0.1ms doesn't matter to users

### Following SPARC

This project demonstrates **practical** application of SPARC methodology:

1. ✅ **Specification** - Clear allergy protection requirements
2. ✅ **Pseudocode** - Algorithms designed first (see docs/SPARC_METHODOLOGY.md)
3. ✅ **Architecture** - Clean, layered TypeScript design
4. ✅ **Refinement** - Simplified from Rust/WASM to TypeScript
5. ✅ **Completion** - Production-ready, maintainable code

## Roadmap

### Completed
- [x] Core architecture design (SPARC)
- [x] TypeScript core engine
- [x] React Native UI
- [x] Allergen database with cross-reactions
- [x] Fuzzy matching (Levenshtein distance)
- [x] Barcode scanning
- [x] **AgentDB agentic-flow integration**
- [x] **Reflexion Memory** - Learn from scans
- [x] **Skill Library** - Reusable patterns
- [x] **Causal Memory Graph** - Cross-reaction discovery
- [x] **Reaction Journal** - Track reactions
- [x] **Learning Insights** - AI stats dashboard
- [x] **User Feedback System** - Correct AI mistakes

### Coming Soon
- [ ] SQLite integration for larger databases
- [ ] Image recognition (ML Kit)
- [ ] LLM-powered Q&A
- [ ] Restaurant database
- [ ] Social features (share safe products)
- [ ] Apple Health / Google Fit integration
- [ ] Wearable support
- [ ] Cloud sync with E2E encryption

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built with ruv's frameworks and methodology:
- [SPARC methodology](https://gist.github.com/ruvnet/e8bb444c6149e6e060a785d1a693a194)
- [agentic-flow](https://github.com/ruvnet/agentic-flow) - Inspiration for architecture
- [claude-flow](https://github.com/ruvnet/claude-flow) - Agent orchestration concepts

## Support

For questions or support, please open an issue.

---

**Made with ❤️ for allergy sufferers everywhere**

*Simple. Fast. Safe.*
