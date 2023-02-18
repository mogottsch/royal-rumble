#!/bin/bash
set -e

export WWWUSER=${UID:-1000}
export WWWGROUP=${GID:-1000}

./compose.sh build && ./compose.sh up -d

./compose.sh exec api composer install

./compose.sh exec api php artisan cache:clear
./compose.sh exec api php artisan config:cache
./compose.sh exec api php artisan route:cache
./compose.sh exec api php artisan view:cache

./compose.sh exec api php artisan migrate


