# Contributing to AllMyAllergies

Thank you for your interest in contributing to AllMyAllergies! This project aims to protect people from food allergies through innovative technology.

## Code of Conduct

Be respectful, inclusive, and constructive. This is a health-focused project that could save lives.

## How to Contribute

### Reporting Bugs

**Important**: Bugs in allergy detection could be life-threatening. Please report them immediately.

1. Check existing issues first
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (device, OS version)

### Suggesting Features

We welcome feature suggestions! Please:

1. Check existing feature requests
2. Create an issue describing:
   - The problem you're solving
   - Your proposed solution
   - Any alternatives considered
   - How it benefits users

### Contributing Code

#### First Time Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/allmyallergies.git
   cd allmyallergies
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/michaelcolletti/allmyallergies.git
   ```

4. Install dependencies (see [DEVELOPMENT.md](docs/DEVELOPMENT.md))

#### Development Process

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**:
   - Follow code style guidelines
   - Write tests for new features
   - Update documentation

3. **Test thoroughly**:
   ```bash
   # Rust tests
   cd core && cargo test

   # TypeScript tests
   cd mobile && npm test

   # Manual testing on device
   npm run ios  # or android
   ```

4. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add barcode scanning for European products"
   # or
   git commit -m "fix: resolve allergen matching false positives"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## Code Style

### Rust

- Follow standard Rust style (`cargo fmt`)
- Run clippy: `cargo clippy`
- Write descriptive comments for public APIs
- Add tests for new functions

### TypeScript/React

- Use TypeScript strict mode
- Follow ESLint rules
- Use functional components with hooks
- Name components with PascalCase
- Name files with same name as component

### Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test updates
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `chore:` Build/tooling changes

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console warnings or errors
- [ ] Tested on real device (if UI changes)

### PR Description

Include:

1. **What**: Brief description of changes
2. **Why**: Problem being solved
3. **How**: Technical approach
4. **Testing**: How you tested it
5. **Screenshots**: If UI changes

### Review Process

1. Automated tests must pass
2. At least one maintainer approval required
3. All review comments addressed
4. Branch up to date with main

## Testing Guidelines

### Critical: Allergen Detection

Allergen detection bugs could be **life-threatening**. Test thoroughly:

1. Test with real ingredient lists
2. Test edge cases (misspellings, variations)
3. Test cross-reactions
4. Test all severity levels
5. Verify UI alerts are clear

### Test Coverage

Aim for:
- Rust core: 90%+ coverage
- TypeScript: 80%+ coverage
- Critical paths: 100% coverage

## Documentation

Update documentation for:

- New features
- API changes
- Architecture changes
- Configuration changes

## Community

- Be patient and kind
- Help others learn
- Share knowledge
- Celebrate contributions

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (coming soon)

## Questions?

- Open an issue for questions
- Join discussions
- Review existing PRs to learn

## License

By contributing, you agree your contributions will be licensed under the MIT License.

---

Thank you for helping make AllMyAllergies better and safer for everyone! 🛡️
