#!/bin/bash
set -e

export WWWUSER=${UID:-1000}
export WWWGROUP=${GID:-1000}

./compose.sh prod build && ./compose.sh prod up -d

./compose.sh prod exec api composer install

./compose.sh prod exec api php artisan cache:clear
./compose.sh prod exec api php artisan config:cache
./compose.sh prod exec api php artisan route:cache
./compose.sh prod exec api php artisan view:cache

./compose.sh prod exec api php artisan db:seed --class=ProductionSeeder


