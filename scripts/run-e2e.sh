#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT="${E2E_COMPOSE_PROJECT:-royal-rumble-e2e}"
export RR_DB_PORT="${RR_DB_PORT:-15432}"
export RR_API_PORT="${RR_API_PORT:-18088}"
export RR_WS_PORT="${RR_WS_PORT:-16001}"
export RR_FRONTEND_PORT="${RR_FRONTEND_PORT:-15173}"
export RR_HMR_PORT="${RR_HMR_PORT:-14784}"
export E2E_BASE_URL="http://127.0.0.1:${RR_FRONTEND_PORT}"
export E2E_API_URL="http://127.0.0.1:${RR_API_PORT}"
COMPOSE=(docker compose -p "$PROJECT" -f "$ROOT/docker-compose.dev.yaml")

cleanup() {
  if [[ "${E2E_KEEP_STACK:-0}" != "1" ]]; then
    "${COMPOSE[@]}" down -v --remove-orphans
  fi
}
trap cleanup EXIT

"${COMPOSE[@]}" down -v --remove-orphans >/dev/null 2>&1 || true
"${COMPOSE[@]}" up -d --build --wait --wait-timeout 240
curl --fail --silent --show-error "${E2E_API_URL}/api/health" >/dev/null
curl --fail --silent --show-error "${E2E_BASE_URL}/" >/dev/null
(
  cd "$ROOT/frontend"
  yarn e2e
)
