# Contributing to Rockdactyl

Rockdactyl welcomes focused bug fixes, accessibility work, responsive-layout
improvements, documentation, tests, and carefully scoped interface features.
Every contribution should preserve normal Pterodactyl behavior and remain
usable on both desktop and mobile.

Please read the [Code of Conduct](./CODE_OF_CONDUCT.md) before participating.
Questions and installation help belong in the channels described in
[SUPPORT.md](./SUPPORT.md).

## Before you start

Search [existing issues](https://github.com/devrock07/Rockdactyl/issues) and
open a feature request before beginning a large visual, architectural, or
dependency change. Changes to Pterodactyl core behavior or Wings should usually
be proposed to the relevant upstream project instead.

Use a focused branch created from current `main`:

```bash
git switch main
git pull --ff-only
git switch -c feature/short-description
```

Do not commit credentials, `.env` files, local databases, runtime caches,
dependency directories, generated frontend bundles, or production data.

## Development setup

Follow the [building guide](../docs/development/BUILDING.md) for the complete
environment and build instructions. The short path is:

```bash
yarn install --frozen-lockfile
composer install
cp .env.example .env
php artisan key:generate
```

Use a disposable local database and never point tests at a production panel.

## Quality checks

Run all frontend checks for interface changes:

```bash
yarn tsc
yarn lint
yarn test --runInBand
yarn build:production
```

Run the PHP checks for backend, routes, migrations, settings, or Blade changes:

```bash
vendor/bin/php-cs-fixer fix --dry-run --diff
vendor/bin/phpunit --bootstrap vendor/autoload.php tests/Unit
vendor/bin/phpunit tests/Integration
```

The integration suite expects the database configuration in `.env.ci`.

## Interface standards

-   Keep controls keyboard accessible and preserve visible focus states.
-   Respect reduced-motion preferences and coarse-pointer/mobile fallbacks.
-   Verify common phone, tablet, laptop, and wide-desktop layouts.
-   Keep overlays, menus, dialogs, and notifications within the viewport.
-   Use the shared Crimson Red and Midnight Blue theme tokens instead of adding
    one-off colors.
-   Avoid decorative effects that reduce readability or block interaction.
-   Add or update tests for state persistence, asynchronous behavior, and
    regressions whenever practical.

## Commits and pull requests

Prefer clear, imperative commit subjects such as `fix: keep file actions inside the viewport`. A pull request should contain one coherent change and include:

-   A concise problem statement and explanation of the solution
-   The affected client, server, login, status, installer, or admin views
-   Desktop and mobile screenshots for visual changes
-   Exact verification commands and results
-   Migration, configuration, deployment, or rollback notes when relevant
-   Any new dependency or third-party source together with its license
-   Disclosure of material AI assistance used to produce the change

Keep unrelated formatting and dependency updates out of the same pull request.
Preserve upstream copyright and license notices. A maintainer may ask for a
smaller change or additional tests before merging.

## Security

Never report a suspected vulnerability in a public issue. Follow the private
reporting process in the [security policy](../SECURITY.md).
