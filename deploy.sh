#!/bin/bash
set -e

export WWWUSER=${UID:-1000}
export WWWGROUP=${GID:-1000}

cp .env ./peasant/laravel/.env
cp .env ./rumble/.env

docker compose build && docker compose up -d

docker compose exec api composer install

docker compose exec api php artisan cache:clear
docker compose exec api php artisan config:cache
docker compose exec api php artisan route:cache
docker compose exec api php artisan view:cache

docker compose exec api php artisan migrate


