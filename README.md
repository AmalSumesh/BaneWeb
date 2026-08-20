# Biotech Arbitrage Engine

Biomedical research intelligence platform for investigating potential drug-repurposing opportunities.

This repository is a **pnpm monorepo** containing web, mobile, shared packages, and a FastAPI backend.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.12+
- (Mobile) Expo Go or a simulator/emulator

## Setup

```bash
# Install frontend dependencies
pnpm install

# Copy environment files
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
cp backend/.env.example backend/.env

# Backend virtual environment
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

## Development

### Web

```bash
pnpm dev:web
```

Runs at `http://localhost:5173`

### Mobile

```bash
pnpm dev:mobile
```

### Backend

```bash
cd backend
# activate venv first
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: `http://localhost:8000/docs`

### Type checking

```bash
pnpm typecheck
```

### Build shared packages

```bash
pnpm --filter @biotech-arbitrage/types build
pnpm --filter @biotech-arbitrage/config build
pnpm --filter @biotech-arbitrage/api-client build
pnpm --filter @biotech-arbitrage/ui build
```

## Architecture

```
UI (web/mobile)
  → @biotech-arbitrage/api-client
  → FastAPI (/api/v1/)
  → mock service (development)
  → RAG/ML services (future)
```

The frontend never depends on ML/RAG implementation details. Mock data lives in `backend/app/services/` — not in React components.

## Workspace packages

| Package | Purpose |
|---------|---------|
| `@biotech-arbitrage/types` | Shared domain types |
| `@biotech-arbitrage/api-client` | Typed HTTP client |
| `@biotech-arbitrage/ui` | Shared UI foundation |
| `@biotech-arbitrage/config` | Shared configuration |

## API contract

See [docs/api-contract.md](./docs/api-contract.md).

## Product constitution

See [AGENTS.md](./AGENTS.md) for engineering and design principles.
