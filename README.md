# Random Profiles — Full Stack App

React + Node/TypeScript app that fetches random user profiles and lets you persist a subset of them.

**Live demo:** http://46.137.178.174:5173 | **DB admin:** http://46.137.178.174:8080 (user: `root`, password: `root`)

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Ant Design 5, Zustand, React Router 6 |
| Backend | Node 20, TypeScript, Express, mysql2 |
| Database | MySQL 8 |
| DB Admin | phpMyAdmin |
| Runtime | Docker + docker-compose |

## Prerequisites

- Docker Desktop (Engine ≥ 24, Compose ≥ 2.20)

No Node, npm, or database install required — everything runs in containers.

## Run

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| phpMyAdmin | http://localhost:8080 |

MySQL takes ~30 seconds to initialise on first boot; the backend waits for its healthcheck before starting.

## Environment variables

All defaults are set in `docker-compose.yml`. For local development without Docker, copy the relevant block:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=finq
```

## Project structure

```
finq/
├── backend/          Node + TypeScript API
│   └── src/
│       ├── index.ts        entry point
│       ├── db.ts           MySQL pool + schema init
│       ├── types.ts        shared AppUser type
│       └── routes/users.ts CRUD endpoints
├── frontend/         React + Vite app
│   └── src/
│       ├── api/            fetch wrappers
│       ├── hooks/          useDebounce
│       ├── screens/        Home, RandomList, SavedProfiles, ProfileDetail
│       ├── components/     UserRow, SkeletonList, FilterBar, GenderIcon
│       └── store/          Zustand store
├── DECISIONS.md
├── AI_USAGE.md
└── docker-compose.yml
```

## API

| Method | Path | Description |
|---|---|---|
| GET | /api/users | List all saved profiles |
| POST | /api/users | Save a profile |
| PATCH | /api/users/:id | Update first/last name |
| DELETE | /api/users/:id | Delete a profile |
| GET | /api/health | Health check |
