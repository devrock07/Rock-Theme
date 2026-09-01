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

## Responsive browser QA

The deployment-driven Playwright matrix covers phone, tablet, desktop, and
ultrawide viewports. Against a local public panel:

```bash
ROCK_VISUAL_BASE_URL=http://127.0.0.1:8000 yarn test:responsive
```

Protected routes also require a least-privilege test account. See
[`tests/visual/README.md`](./tests/visual/README.md) for local variables and the
protected GitHub environment setup. The matrix checks HTTP and browser errors,
horizontal overflow, clipped primary controls, and captures review screenshots;
it is not a replacement for functional tests or a manual release review.

## Production assets

```bash
yarn build:production
```

Webpack writes minified, hashed assets and `manifest.json` to
`public/assets/`. These files are generated and ignored in the source
repository. The release workflow builds them and adds them to
`panel.tar.gz`. Local, tagged, and autopilot releases all use the same packaging
script.

To create the same archive locally after committing the intended source:

```bash
./release.sh
```

The archive and checksum are written to `release/panel.tar.gz` and
`release/panel.tar.gz.sha256`. Packaging uses the source commit time, sorted
paths, normalized ownership and entry modes, and a timestamp-free gzip stream.
The release gate performs two clean production-asset builds and fails if their
manifest-declared outputs differ. Packaging then prepares two independent
staging trees and fails if their archive byte streams differ. The local release
command prints the theme version, Pterodactyl base, source commit, byte size,
and SHA-256 digest.

Verify a locally built archive before moving it to another host:

```bash
cd release
sha256sum --check panel.tar.gz.sha256
tar -xOf panel.tar.gz ./.rock/release.json
```
