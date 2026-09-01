# Rock Theme

<p align="center">
  <img src="./docs/rock-theme-social-preview.jpg" alt="Rock Theme interface preview" width="100%">
</p>

<p align="center">
  A responsive, operator-configurable interface distribution for Pterodactyl Panel.
</p>

<p align="center">
  <a href="https://github.com/devrock07/Rock-Theme/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/devrock07/Rock-Theme?display_name=tag&sort=semver&style=flat-square&color=c94f59"></a>
  <a href="https://github.com/devrock07/Rock-Theme/actions/workflows/build.yaml"><img alt="Frontend checks" src="https://github.com/devrock07/Rock-Theme/actions/workflows/build.yaml/badge.svg?branch=main"></a>
  <a href="https://github.com/devrock07/Rock-Theme/actions/workflows/ci.yaml"><img alt="Backend checks" src="https://github.com/devrock07/Rock-Theme/actions/workflows/ci.yaml/badge.svg?branch=main"></a>
  <a href="https://github.com/devrock07/Rock-Theme/actions/workflows/docker.yaml"><img alt="Container build" src="https://github.com/devrock07/Rock-Theme/actions/workflows/docker.yaml/badge.svg?branch=main"></a>
  <a href="https://github.com/pterodactyl/panel/releases/tag/v1.15.1"><img alt="Pterodactyl 1.15.1" src="https://img.shields.io/badge/Pterodactyl-1.15.1-10529f?style=flat-square"></a>
</p>

Rock Theme rebuilds the client, login, server, and administration experience
without replacing the familiar Pterodactyl workflow. It includes two complete
color systems, responsive navigation, configurable branding, operational
telemetry, account-synced dashboard preferences, and release tooling designed
for real panel installations.

Rock Theme `v2.0.3` is based on and supports
[Pterodactyl Panel `v1.15.1`](https://github.com/pterodactyl/panel/releases/tag/v1.15.1).
It is a full panel distribution, not a standalone CSS file or runtime plugin.

[Features](#features) · [Install](#quick-install) ·
[Configure](./docs/CONFIGURATION.md) · [Update](./docs/UPGRADING.md) ·
[Troubleshoot](./docs/TROUBLESHOOTING.md) · [Develop](./BUILDING.md) ·
[Contribute](./CONTRIBUTING.md) · [Support](./SUPPORT.md)

## Features

| Area                 | Included                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Visual system        | Crimson Red and Midnight Blue presets, configurable glass and corner radius, reduced-motion support, responsive effects, and consistent client/admin styling |
| Branding             | Panel name, footer identity, mark or logo, dashboard copy and artwork, login media, console appearance, favicon assets, and live Theme Studio preview        |
| Dashboard            | Search and command palette, favorites, custom server groups, quick server drawer, permission-aware power controls, and mobile bottom navigation              |
| Operations           | Live, one-hour, and 24-hour resource graphs; seven-day telemetry retention; persistent resource notifications; and guarded loading, retry, and error states  |
| Public communication | Optional `/status` page backed by Wings health checks and a dismissible global announcement banner with notice, warning, or critical presentation            |
| Delivery             | Checksum-verified installer, rollback snapshots, compiled release archives, multi-architecture container builds, and gated upstream-update automation        |

The interface uses adapted Soft Aurora, Magic Bento, Fluid Glass, Profile Card,
spotlight, and motion treatments. Effects degrade for coarse pointers and honor
the operating system's reduced-motion preference.

## Compatibility

| Component         | Supported                                        |
| ----------------- | ------------------------------------------------ |
| Rock Theme        | `2.0.3`                                          |
| Pterodactyl Panel | `1.15.1`                                         |
| PHP               | `8.2` or `8.3`                                   |
| Node.js           | `22` or newer when building from source          |
| Yarn              | Classic `1.x` when building from source          |
| Architectures     | `linux/amd64` and `linux/arm64` container images |

Do not install this release over a different Pterodactyl base version. Upgrade
the base panel through a compatible Rock Theme release instead of running the
official Pterodactyl updater directly over a themed installation.

## Quick install

> [!CAUTION]
> Install on a tested backup. The manager creates a panel-file snapshot, but it
> does not export your database. Back up the database and `.env` separately
> before changing a production panel.

On a server with an existing Pterodactyl `1.15.1` installation:

```bash
curl -fsSL https://raw.githubusercontent.com/devrock07/Rock-Theme/main/install.sh \
  -o /tmp/rock-theme-install.sh
sudo bash /tmp/rock-theme-install.sh install
```

The manager verifies the latest release checksum and archive structure before
placing the panel in maintenance mode. It then creates a rollback snapshot,
installs PHP dependencies, runs migrations, clears caches, restarts queue
workers, repairs permissions, and returns the panel online. Interrupted
operations include a recovery guard that attempts to bring the panel back up.

Use the interactive menu by omitting the action, or run an operation directly:

```bash
sudo bash /tmp/rock-theme-install.sh update
sudo bash /tmp/rock-theme-install.sh restore
sudo bash /tmp/rock-theme-install.sh --help
```

Read the [installation guide](./docs/INSTALLATION.md) before using a custom
panel path, performing a manual install, or restoring a backup.

## Configure the panel

After installation, open **Admin → Settings**. Theme settings are stored in the
panel database and apply across the client, login, server, status, and admin
views.

Common first steps:

1. Set the panel name, owner, logo, and footer URL.
2. Choose **Crimson Red** or **Midnight Blue** in Theme Studio.
3. Add dashboard and login artwork you are licensed to use.
4. Set console media visibility low enough to preserve terminal readability.
5. Review the public status-page and announcement settings before enabling them.
6. Confirm the normal Pterodactyl scheduler is running every minute.

See the [configuration reference](./docs/CONFIGURATION.md) for supported values,
media paths, persistence behavior, status-page controls, and telemetry details.

## Documentation

| Guide                                           | Purpose                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| [Documentation index](./docs/README.md)         | Operator and developer documentation map                                        |
| [Installation](./docs/INSTALLATION.md)          | Prerequisites, manager usage, manual deployment, and verification               |
| [Configuration](./docs/CONFIGURATION.md)        | Branding, Theme Studio, media, status page, announcements, and stored user data |
| [Upgrading and recovery](./docs/UPGRADING.md)   | Safe updates, compatibility policy, backups, rollback, and upstream automation  |
| [Troubleshooting](./docs/TROUBLESHOOTING.md)    | Diagnostic commands and fixes for common deployment and runtime problems        |
| [Architecture](./docs/ARCHITECTURE.md)          | Application layers, Rock Theme data, release pipeline, and design boundaries    |
| [Building](./BUILDING.md)                       | Local dependencies, frontend checks, backend tests, and release packaging       |
| [Branding](./BRANDING.md)                       | Short-form branding and asset reference                                         |
| [Upstream automation](./UPSTREAM_AUTOMATION.md) | Detailed three-tree update process and safety model                             |
| [Roadmap](./ROADMAP.md)                         | Current priorities and project direction                                        |
| [Governance](./GOVERNANCE.md)                   | Maintenance model, decision principles, and release policy                      |

## Development

Install source dependencies, then run the same frontend checks used in CI:

```bash
yarn install --frozen-lockfile
yarn tsc
yarn lint
yarn test --runInBand
yarn build:production
```

Backend changes are checked on PHP 8.2 and 8.3 against MySQL 8/9 and MariaDB
10/11. Follow [BUILDING.md](./BUILDING.md) for local backend setup and
[CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## Releases and updates

A version tag runs the frontend, backend, and multi-architecture container
release gates, then creates a draft containing `panel.tar.gz` and
`panel.tar.gz.sha256`. Publishing that reviewed draft makes the artifacts public
and starts the stable container publish. The installer downloads both files and
refuses to extract an archive with a failed checksum or unsafe path.

Rock Theme also checks official Pterodactyl releases daily. A new base is
published only after the customized tree merges cleanly and the frontend and
backend database matrix and multi-architecture container build succeed.
Promotion then creates the verified release archive and dispatches its
versioned/`latest` and `edge` container builds. See
[UPSTREAM_AUTOMATION.md](./UPSTREAM_AUTOMATION.md) for the complete process.

-   [Latest release](https://github.com/devrock07/Rock-Theme/releases/latest)
-   [Release history](https://github.com/devrock07/Rock-Theme/releases)
-   [Container package](https://github.com/devrock07/Rock-Theme/pkgs/container/rock-theme)
-   [Project roadmap](https://github.com/users/devrock07/projects/3)

## Support and security

Use the [support guide](./SUPPORT.md) to choose the right channel. Reproducible
Rock Theme bugs belong in [GitHub Issues](https://github.com/devrock07/Rock-Theme/issues)
with the Rock Theme and Pterodactyl versions, browser, viewport size, affected
route, sanitized logs, and screenshots for visual defects.
General usage questions belong in
[GitHub Discussions](https://github.com/devrock07/Rock-Theme/discussions/categories/q-a).

Do not open a public issue for a vulnerability. Follow
[SECURITY.md](./SECURITY.md) and use
[private vulnerability reporting](https://github.com/devrock07/Rock-Theme/security/advisories/new).
Core Pterodactyl or Wings issues belong in their respective upstream projects.

## Credits and licensing

Rock Theme is a derivative Pterodactyl panel distribution and contains work
derived from NookTheme plus adapted third-party interface components. It is not
affiliated with Pterodactyl, Nookure, or React Bits.

-   NookTheme-derived and Rock Theme modifications are distributed under the
    [GNU GPLv3](./LICENSE), subject to applicable third-party terms.
-   Pterodactyl code retains its [MIT License](./PTERODACTYL_LICENSE.md).
-   Component attribution and additional terms are recorded in
    [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

Copyright © 2022–2026 DevRock. Upstream notices remain with their respective
owners.
