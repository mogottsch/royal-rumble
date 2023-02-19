#!/bin/bash
set -e

USAGE="Usage: compose.sh [dev|prod]"

ALLOWS_ENVS=(dev prod)
ENV=$1

COMMAND=${@:2}

if [[ ! " ${ALLOWS_ENVS[@]} " =~ " ${ENV} " ]]; then
    echo "Invalid env: ${ENV}"
    echo ${USAGE}
    exit 1
fi

cp .$ENV.env .env
cp .env ./rumble/.env
cp .env ./peasant/laravel/.env

cp ./nginx/nginx.$ENV.conf ./nginx/nginx.conf

docker compose -f docker-compose.yaml -f docker-compose.$ENV.yaml ${COMMAND} 

# rm .env
# rm ./rumble/.env
# rm ./peasant/laravel/.env
