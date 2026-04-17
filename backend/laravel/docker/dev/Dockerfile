FROM php:8.5-cli-alpine

RUN apk add --no-cache \
        postgresql-libs \
        postgresql-dev \
        libpng-dev \
        libwebp-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        git \
        unzip \
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

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

EXPOSE 8088
