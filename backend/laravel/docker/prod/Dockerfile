FROM composer:2 AS composer

FROM php:8.5-cli-alpine AS base

RUN apk add --no-cache \
        postgresql-libs \
        postgresql-dev \
        libpng-dev \
        libwebp-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-webp \
    && docker-php-ext-install \
        pdo_pgsql \
        pgsql \
        bcmath \
        gd \
        zip \
        intl \
        mbstring \
    && apk del $PHPIZE_DEPS postgresql-dev \
    && rm -rf /var/cache/apk/*

COPY --from=composer /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend/laravel/composer.json backend/laravel/composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction

COPY backend/laravel/ ./
COPY backend/laravel/docker/prod/entrypoint.sh /usr/local/bin/royal-api-entrypoint

COPY crawler/data/saved_superstars.json storage/app/saved_superstars.json
COPY crawler/data/images/ storage/app/public/wrestlers/

RUN composer dump-autoload --optimize --no-dev \
    && php artisan storage:link \
    && chmod +x /usr/local/bin/royal-api-entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

EXPOSE 80

CMD ["royal-api-entrypoint"]
