#!/bin/bash
set -e

export WWWUSER=${UID}
export WWWGROUP=${GID}

./peasant/laravel/vendor/laravel/sail/bin/sail build && docker-compose up -d

docker-compose exec api php artisan cache:clear
docker-compose exec api php artisan config:cache
docker-compose exec api php artisan route:cache
docker-compose exec api php artisan view:cache

docker-compose exec api php artisan migrate


