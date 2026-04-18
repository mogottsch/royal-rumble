#!/bin/sh
set -eu

php artisan migrate --force
php artisan db:seed --class=ProductiveSeeder --force

exec php artisan serve --host=0.0.0.0 --port=80
