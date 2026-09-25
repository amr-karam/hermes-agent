# Hermes Agent

A personal AI agent that runs across CLI, messaging gateways, TUI, and Electron desktop app. Extended through plugins and skills.

## Architecture

```
hermes-agent/
├── apps/
│   ├── desktop/          # Electron desktop app
│   └── frontend/         # Next.js 3D experience (Three.js, React Three Fiber)
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   ├── eslint-config/    # Shared ESLint configs (base, TS, React, Next.js)
│   └── prettier-config/  # Shared Prettier config
├── agent/                # Core agent logic (turn loop, providers, memory)
├── tools/                # Tool implementations & registry
├── gateway/              # Messaging gateway (Telegram, Discord, Slack, etc.)
├── plugins/              # Built-in plugins
├── skills/               # Built-in skills
├── ui-tui/               # Ink-based terminal UI
├── tui_gateway/          # Python JSON-RPC backend for TUI/Desktop
├── cron/                 # Scheduler & job system
└── web/                  # Dashboard SPA
```

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Python >= 3.11 (for core agent)

### Installation

```bash
# Install all dependencies
npm run install:all

# Install husky hooks
npm run prepare
```

### Development

```bash
# Start frontend dev server (Next.js + 3D experience)
npm run dev:frontend

# Start desktop app dev mode (Electron + Vite)
npm run dev:desktop

# Run all dev servers (via Turborepo)
npm run dev
```

### Building

```bash
# Build all packages
npm run build

# Build specific apps
npm run build:frontend
npm run build:desktop
```

### Linting & Type Checking

```bash
# Lint all workspaces
npm run lint

# Type check all workspaces
npm run typecheck

# Format code
npx prettier --write .

# Check formatting
npx prettier --check .
```

### Launching Apps

```bash
# Frontend (3D Experience)
./launch-frontend.sh --dev      # Development
./launch-frontend.sh --build    # Production build
./launch-frontend.sh --start    # Production server

# Desktop
./launch-desktop.bat --dev      # Development (hot reload)
./launch-desktop.bat --dist     # Production build + run
./launch-desktop.bat --install  # Install deps & build
```

## Frontend 3D Experience

Located at `apps/frontend/src/features/experience/`:

- **Experience.tsx** - Main 3D scene with custom shaders, floating orbs, particle fields, geometric shapes
- **useContextLossRecovery.ts** - WebGL context loss/recovery hook with exponential backoff
- **Design tokens** in `apps/frontend/src/app/globals.css` (CSS custom properties for theming)

### Tech Stack

- Next.js 14 (App Router)
- React 18
- Three.js 0.167
- @react-three/fiber 8.16
- @react-three/drei 9.110
- Tailwind CSS 3.4
- TypeScript 5.5 (strict mode, no `any`)

## Monorepo Structure

This project uses npm workspaces with Turborepo for build orchestration.

### Workspace Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all dev servers |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all workspaces |
| `npm run typecheck` | Type check all workspaces |
| `npm run test` | Run tests |
| `npm run clean` | Clean build outputs |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |

### Shared Packages

- **@hermes/shared-types** - Comprehensive type definitions (API responses, WebSocket, Agent config, Tools, Debug, Theme, Performance, etc.)
- **@hermes/eslint-config** - Base, TypeScript, React, and Next.js ESLint configs
- **@hermes/prettier-config** - Shared Prettier config with Tailwind plugin

## Configuration

### Environment Variables

Create `.env.local` in `apps/frontend/` for frontend-specific vars:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### TypeScript

Strict mode enabled across all packages. No `any` types allowed. Path aliases configured (`@/*` -> `./src/*`).

### ESLint

Extends shared configs from `@hermes/eslint-config`. Run `npm run lint` to check.

### Prettier

Shared config from `@hermes/prettier-config` with Tailwind CSS plugin. Run `npm run format` to format.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE](LICENSE)