# Suff Royale API

Laravel JSON API for lobbies, entrances, eliminations, drink distributions, mystery chests, wrestler search/images, and realtime lobby snapshots.

## Local runtime

Use the repository Compose stack from the repository root:

```bash
docker compose -f docker-compose.dev.yaml up -d --build --wait
curl --fail http://127.0.0.1:8088/api/health
```

The development container installs dependencies, migrates, productively seeds the isolated local database, and starts the API.

## Checks

```bash
docker compose -f docker-compose.dev.yaml exec -T api composer validate --strict
docker compose -f docker-compose.dev.yaml exec -T api composer audit --locked
docker compose -f docker-compose.dev.yaml exec -T api vendor/bin/pint --test
docker compose -f docker-compose.dev.yaml exec -T api vendor/bin/pest
```

CI runs the complete suite on SQLite and PostgreSQL. PostgreSQL coverage includes simultaneous distribution, entrance, and monotonic drink-progress updates.

## Production

`docker/prod/Dockerfile` builds a multistage FrankenPHP image without Composer or development dependencies in the final stage. It runs as `www-data` on port 8080, embeds one immutable seed/image tree, and exposes `/api/health` for liveness plus `/api/readiness` for database/schema readiness. The container does not migrate or seed at startup; the GitOps PreSync migration job owns those operations.
