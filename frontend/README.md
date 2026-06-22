# Frontend

React 18 + TypeScript + Vite single-page application.

## Prerequisites

- Node.js 20+ (or Docker — recommended)
- The backend service running on port 5000

## Run with Docker (recommended)

From the **project root**:

```bash
docker compose up --build
```

The frontend dev server starts at **http://localhost:5173** with hot-reload enabled.

## Run locally (without Docker)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | Backend base URL |

Set in a `.env` file at `frontend/.env`:

```
VITE_API_URL=http://localhost:5000
```

## Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start Vite dev server (port 5173, HMR) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest unit + component tests |

## Tests

Tests live in `src/__tests__/`. Run inside Docker to match the CI environment:

```bash
docker exec finq-frontend-1 sh -c "cd /app && npx vitest run --reporter=verbose"
```

## Key dependencies

- **React 18** + **React Router 6** — routing
- **Ant Design 5** — UI components
- **Zustand** — global state management
- **Vite** — dev server and bundler
- **Vitest** + **@testing-library/react** — unit and component tests
