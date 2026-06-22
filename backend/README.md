# Backend

Node.js + TypeScript + Express REST API backed by MySQL 8.

## Prerequisites

- Node.js 20+ (or Docker — recommended)
- MySQL 8 running and accessible (included in Docker Compose)

## Run with Docker (recommended)

From the **project root**:

```bash
docker compose up --build
```

The backend starts at **http://localhost:5000** after MySQL is healthy (health-check retries up to 75 s on first boot).

## Run locally (without Docker)

Requires a running MySQL 8 instance. Set the env vars below, then:

```bash
cd backend
npm install
npm run dev
```

## Environment variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `DB_HOST` | `localhost` | Yes | MySQL hostname |
| `DB_USER` | — | Yes | MySQL username |
| `DB_PASSWORD` | — | Yes | MySQL password |
| `DB_NAME` | `finq` | Yes | MySQL database name |
| `PORT` | `5000` | No | HTTP listen port |

Set in a `.env` file at `backend/.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=finq
PORT=5000
```

## Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start with `tsx watch` (hot-reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/index.js` |
| `npm test` | Run Jest + supertest integration tests |

## Tests

Integration tests hit a real MySQL database (not mocks). Run inside Docker:

```bash
docker exec finq-backend-1 sh -c "cd /app && npm test"
```

## API routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/users` | List all saved users |
| `POST` | `/api/users` | Save a user (409 if duplicate) |
| `PATCH` | `/api/users/:id` | Update first/last name |
| `DELETE` | `/api/users/:id` | Delete a user |

## Key dependencies

- **Express 4** — HTTP framework
- **mysql2** — MySQL client with promise API and prepared statements
- **tsx** — TypeScript execution and watch mode
- **Jest** + **supertest** — integration tests
