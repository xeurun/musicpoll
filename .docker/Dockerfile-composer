ARG VERSION
FROM composer:${VERSION}

RUN composer global require "hirak/prestissimo:^0.3" --prefer-dist --no-progress --no-suggest --optimize-autoloader --classmap-authoritative  --no-interaction
