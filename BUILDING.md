# Building Rock Theme

Rock Theme uses the Pterodactyl React and Laravel application with webpack for
frontend assets.

## Requirements

-   Node.js `22` or newer
-   Yarn Classic `1.x`
-   PHP `8.2` or `8.3`
-   Composer `2`
-   A local Pterodactyl-compatible database when running backend tests

## Install dependencies

```bash
yarn install --frozen-lockfile
composer install
```

Never commit `node_modules/`, `vendor/`, `.env`, runtime caches, or compiled
`public/assets/` output.

## Frontend development

Create the development bundle once:

```bash
yarn build
```

Rebuild when source files change:

```bash
yarn watch
```

The local webpack development server uses the `pterodactyl.test` host and a
local HTTPS certificate:

```bash
yarn serve
```

Configure that hostname and certificate locally before using the server.

## Verification

Run the frontend checks before opening a pull request:

```bash
yarn tsc
yarn lint
yarn test
yarn build:production
```

Backend checks:

```bash
vendor/bin/php-cs-fixer fix --dry-run --diff
vendor/bin/phpunit --bootstrap vendor/autoload.php tests/Unit
vendor/bin/phpunit tests/Integration
```

Integration tests require the database configuration from `.env.ci`.

## Production assets

```bash
yarn build:production
```

Webpack writes minified, hashed assets and `manifest.json` to
`public/assets/`. These files are generated and ignored in the source
repository. The release workflow builds them and adds them to
`panel.tar.gz`.

To create the same archive locally after committing the intended source:

```bash
./release.sh
```

The archive is written to `release/panel.tar.gz`.
