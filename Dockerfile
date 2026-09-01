# Stage 0:
# Build the assets that are needed for the frontend. This build stage is then discarded
# since we won't need NodeJS anymore in the future. This Docker image ships a final production
# level distribution of Pterodactyl.
FROM --platform=$BUILDPLATFORM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS frontend
WORKDIR /app
COPY . ./
RUN yarn install --frozen-lockfile \
    && yarn run build:production

# Stage 1:
# Build the actual container with all of the needed PHP dependencies that will run the application.
FROM --platform=$TARGETOS/$TARGETARCH php:8.5-fpm-alpine@sha256:0da714a817e3d9a4553eae95cfc4a4785cf45a048d3fc9ef6d580579026ffb2b
WORKDIR /app
COPY . ./
COPY --from=frontend /app/public/assets ./public/assets
RUN apk add --no-cache --update ca-certificates dcron curl git supervisor tar unzip nginx libpng-dev libxml2-dev libzip-dev certbot certbot-nginx mysql-client \
    && docker-php-ext-configure zip \
    && docker-php-ext-install bcmath gd pdo_mysql zip \
    && curl -fsSL https://getcomposer.org/installer -o /tmp/composer-setup.php \
    && curl -fsSL https://composer.github.io/installer.sig -o /tmp/composer-setup.sig \
    && php -r 'if (!hash_equals(trim(file_get_contents("/tmp/composer-setup.sig")), hash_file("sha384", "/tmp/composer-setup.php"))) { fwrite(STDERR, "Invalid Composer installer signature.\n"); exit(1); }' \
    && php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && rm -f /tmp/composer-setup.php /tmp/composer-setup.sig \
    && cp .env.example .env \
    && mkdir -p bootstrap/cache/ storage/logs storage/framework/sessions storage/framework/views storage/framework/cache \
    && chmod -R u=rwX,g=rX,o=rX bootstrap storage \
    && composer install --no-dev --optimize-autoloader \
    && rm -rf .env bootstrap/cache/*.php \
    && mkdir -p /app/storage/logs/ \
    && chown -R nginx:nginx .

RUN rm /usr/local/etc/php-fpm.conf \
    && echo "* * * * * /usr/local/bin/php /app/artisan schedule:run >> /dev/null 2>&1" >> /var/spool/cron/crontabs/root \
    && echo "0 23 * * * certbot renew --nginx --quiet" >> /var/spool/cron/crontabs/root \
    && sed -i s/ssl_session_cache/#ssl_session_cache/g /etc/nginx/nginx.conf \
    && mkdir -p /var/run/php /var/run/nginx

COPY .github/docker/default.conf /etc/nginx/http.d/default.conf
COPY .github/docker/www.conf /usr/local/etc/php-fpm.conf
COPY .github/docker/supervisord.conf /etc/supervisord.conf

EXPOSE 80 443
ENTRYPOINT [ "/bin/ash", ".github/docker/entrypoint.sh" ]
CMD [ "supervisord", "-n", "-c", "/etc/supervisord.conf" ]
