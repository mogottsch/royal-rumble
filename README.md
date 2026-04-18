<p align="center">
  <img src="frontend/src/assets/logo_small.png" alt="Suff Royale" width="320" />
</p>

# Suff Royale

A chaotic Royal Rumble party game with live wrestler entrances, eliminations, drink distribution, and lobby-based multiplayer flow.

**Live app:** [suffroyale.com](https://suffroyale.com)

## What it does

- create a lobby and add players
- assign entrance numbers
- search wrestlers and record entrances live
- record eliminations and distribute drinks
- sync the game state in real time across devices

## Stack

- **frontend:** React, TypeScript, Vite, MUI
- **backend:** Laravel API
- **realtime:** Soketi / Pusher-compatible websockets
- **data prep:** crawler for wrestler data + images

## Repository layout

- `frontend/` — client app
- `backend/laravel/` — API
- `crawler/` — wrestler data collection
- `docker-compose.dev.yaml` — local dev stack

## Local development

Start the full stack with Docker Compose:

```bash
git lfs install
git lfs pull
docker compose -f docker-compose.dev.yaml up -d --build
```

The wrestler images in `crawler/data/images/` are stored with Git LFS. If `git lfs pull` has not been run, the dev backend will only see pointer files instead of real image data, so wrestler portraits and thumbnails will not load.

Services:

- frontend (Vite): `http://127.0.0.1:5173`
- backend API: `http://127.0.0.1:8088`
- Soketi websocket server: `127.0.0.1:6001`
- Postgres: `127.0.0.1:54329`

The API container installs Composer dependencies, runs migrations, seeds the database, and starts Laravel automatically.

The frontend container runs Vite with HMR exposed on `127.0.0.1:4784`.

To stop the stack:

```bash
docker compose -f docker-compose.dev.yaml down
```

## Frontend checks

```bash
cd frontend
corepack yarn install --frozen-lockfile
corepack yarn typecheck
corepack yarn build
```

## API surface

Core routes include:

- `POST /api/lobbies`
- `PATCH /api/lobbies/{code}/settings`
- `POST /api/lobbies/{code}/entrance-numbers`
- `POST /api/lobbies/{code}/entrance`
- `POST /api/lobbies/{code}/elimination`
- `GET /api/wrestlers/search`
- `POST /api/wrestlers`

## Notes

This repo contains the app code. Deployment and infrastructure are managed separately.
