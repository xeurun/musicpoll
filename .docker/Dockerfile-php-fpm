ARG VERSION
FROM php:${VERSION}

RUN apk update \
    && apk upgrade \
    && apk add --no-cache bash git gcc make g++ icu-dev zlib-dev libpng-dev jpeg-dev openldap-dev autoconf

# Install extensions
RUN docker-php-ext-install intl ldap zip pcntl mysqli pdo pdo_mysql bcmath ldap intl gd opcache
# 2.6.1 have bag
RUN pecl install xdebug-2.6.0 && docker-php-ext-enable xdebug
RUN pecl install apcu

COPY /etc/php/conf.d/custom.ini /usr/local/etc/php/conf.d/
COPY /etc/php/php-fpm.d/custom.conf /usr/local/etc/php/php-fpm.d/

RUN ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime && echo ${TZ} > /etc/timezone

RUN { \
    echo 'xdebug.remote_host="${XDEBUG_REMOTE_HOST}"'; \
    echo 'xdebug.remote_enable=1'; \
    echo 'xdebug.remote_autostart=0'; \
    echo 'xdebug.remote_port=9009'; \
    echo 'xdebug.profiler_enable=0'; \
    echo 'xdebug.idekey=PHPSTORM'; \
} > /usr/local/etc/php/conf.d/xdebug-recommended.ini

# docker performance
RUN mkdir -p /var/cache && mkdir -p /var/log && mkdir -p /var/sessions && chown -R www-data /var

WORKDIR "/app"
