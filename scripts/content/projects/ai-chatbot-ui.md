# React Project Boilerplate

A production-ready React + TypeScript boilerplate implementing Clean Architecture principles with automated validation and quality checks.

## Features

- 🏗️ **Clean Architecture** - Modular structure with clear separation of concerns
- 🔒 **Security Validations** - Automated scans for hardcoded secrets and credentials
- 🔗 **Dependency Management** - Circular dependency detection and layer violation checks
- 📐 **Architecture Enforcement** - Automated validation of folder structure and conventions
- 🎣 **Pre-commit Hooks** - Automatic code quality checks via Husky
- ⚡ **Vite** - Lightning-fast development server and build tool
- 🎨 **ESLint + Prettier** - Consistent code style and formatting
- 📦 **Zustand** - Simple and scalable state management

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── modules/          # Feature modules (self-contained)
│   ├── domain/       # Business entities and rules
│   ├── application/  # Use cases and ports
│   ├── infrastructure/ # API clients and external services
│   ├── presentation/ # UI components and pages
│   └── store/        # State management
├── shared/           # Shared components and utilities
└── core/             # Core configurations and routing
```

## Validation Scripts

```bash
npm run validate:all           # Run all validations
npm run validate:architecture  # Check folder structure
npm run validate:dependencies  # Detect circular deps and layer violations
npm run validate:endpoints     # Verify environment variables
npm run validate:safety        # Scan for hardcoded secrets
```

## Code Quality

```bash
npm run lint       # Run ESLint
npm run format     # Format with Prettier
npm run typecheck  # TypeScript type checking
```

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete architecture documentation
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md) - Coding conventions and guidelines

## Environment Setup

Copy the appropriate environment example file:

```bash
cp .env.example.dev .env     # For development
cp .env.example.stg .env     # For staging
cp .env.example.prd .env     # For production
```

## License

MIT
