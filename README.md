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
- `docker-compose.dev.yaml` — local dev services
- `docker-compose.prod.yaml` — prod-style compose setup

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
