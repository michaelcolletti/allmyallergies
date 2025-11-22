# Development Guide

## Prerequisites

### Required Tools

1. **Rust** (1.75+)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   ```

2. **wasm-pack**
   ```bash
   cargo install wasm-pack
   ```

3. **Node.js** (20+)
   ```bash
   # Using nvm
   nvm install 20
   nvm use 20
   ```

4. **React Native Development Environment**
   - **iOS**: Xcode 14+ (macOS only)
   - **Android**: Android Studio + SDK 33+

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/michaelcolletti/allmyallergies.git
cd allmyallergies
```

### 2. Build Rust/WASM Core

```bash
cd core
wasm-pack build --target bundler --out-dir ../mobile/src/wasm
cd ..
```

### 3. Install Mobile Dependencies

```bash
cd mobile
npm install
```

### 4. Run Development Server

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

For Rust changes:
```bash
cd core
wasm-pack build --target bundler --out-dir ../mobile/src/wasm
# Restart metro bundler
```

### Code Structure

```
allmyallergies/
├── core/                 # Rust/WASM engine
│   ├── src/
│   │   ├── lib.rs       # Main WASM interface
│   │   ├── allergen_db.rs
│   │   ├── parser.rs
│   │   ├── matcher.rs
│   │   └── vector_store.rs
│   └── Cargo.toml
├── mobile/              # React Native app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── screens/     # Screen components
│   │   ├── services/    # Business logic
│   │   ├── store/       # State management
│   │   └── wasm/        # Generated WASM files
│   ├── App.tsx
│   └── package.json
└── docs/                # Documentation
```

## Testing

### Rust Tests

```bash
cd core
cargo test
```

### TypeScript Tests

```bash
cd mobile
npm test
```

### E2E Tests

```bash
cd mobile
npm run test:e2e
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

### Rust Debugging

Use `console_error_panic_hook` for WASM panics:

```rust
use console_error_panic_hook;

#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}
```

View errors in browser console or React Native debugger.

### Performance Profiling

**Rust/WASM**:
```bash
cd core
cargo build --release
wasm-pack build --target bundler --profiling
```

**React Native**:
```bash
npm run android -- --variant=release
# Enable Perf Monitor in app (shake device)
```

## Code Style

### Rust

Follow Rust standard style:
```bash
cd core
cargo fmt
cargo clippy
```

### TypeScript

Using ESLint + Prettier:
```bash
cd mobile
npm run lint
npm run format
```

## Building for Production

### iOS

1. Configure signing in Xcode
2. Build:
   ```bash
   cd mobile
   expo build:ios --release-channel production
   ```

### Android

1. Generate signing key
2. Build:
   ```bash
   cd mobile
   expo build:android --release-channel production
   ```

### WASM Optimization

For production builds, use size optimization:

```bash
cd core
wasm-pack build --target bundler --release
wasm-opt -Oz -o output.wasm input.wasm
```

## Performance Benchmarks

Expected performance metrics:

| Operation | JavaScript | Rust/WASM | Improvement |
|-----------|-----------|-----------|-------------|
| Parse 100 ingredients | 45ms | 0.13ms | 352x faster |
| Vector search (10K items) | 150ms | 1ms | 150x faster |
| Allergen matching | 12ms | 0.5ms | 24x faster |

## Troubleshooting

### WASM Build Fails

```bash
# Ensure wasm32 target is installed
rustup target add wasm32-unknown-unknown

# Clean and rebuild
cd core
cargo clean
wasm-pack build --target bundler
```

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

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Run tests: `cargo test && npm test`
4. Commit: `git commit -m "feat: add my feature"`
5. Push: `git push origin feature/my-feature`
6. Create pull request

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Tamagui Docs](https://tamagui.dev/)
- [agentic-flow](https://github.com/ruvnet/agentic-flow)
