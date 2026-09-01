<div align="center">

# Rock Theme

A polished, operator-configurable interface distribution for Pterodactyl Panel.

[![Latest release](https://img.shields.io/github/v/release/devrock07/Rock-Theme?display_name=tag&sort=semver&style=flat-square&color=c94f59)](https://github.com/devrock07/Rock-Theme/releases/latest)
[![Frontend](https://github.com/devrock07/Rock-Theme/actions/workflows/build.yaml/badge.svg?branch=main)](https://github.com/devrock07/Rock-Theme/actions/workflows/build.yaml)
[![Backend](https://github.com/devrock07/Rock-Theme/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/devrock07/Rock-Theme/actions/workflows/ci.yaml)
[![Pterodactyl 1.15.1](https://img.shields.io/badge/Pterodactyl-1.15.1-10529f?style=flat-square)](https://github.com/pterodactyl/panel/releases/tag/v1.15.1)
[![GPLv3](https://img.shields.io/github/license/devrock07/Rock-Theme?style=flat-square&color=c94f59)](./LICENSE)

<img src="./website/public/screenshots/dashboard-crimson.webp" alt="The real Rock Theme dashboard running in Crimson Red" width="100%">

**Rock Theme `v2.1.0` · Pterodactyl Panel `v1.15.1`**

[Website](https://devrock07.github.io/Rock-Theme/) · [Documentation](./docs/README.md) · [Install](./docs/INSTALLATION.md) · [Configure](./docs/CONFIGURATION.md) · [Releases](https://github.com/devrock07/Rock-Theme/releases)

</div>

## Built for real panels

Rock Theme modernizes the client, server, login, status, and administration interfaces while preserving the familiar Pterodactyl workflow. It is a complete panel distribution—not a CSS patch or runtime plugin.

Rock Theme `v2.1.0` is based on and supports [Pterodactyl Panel `v1.15.1`](https://github.com/pterodactyl/panel/releases/tag/v1.15.1).

| Capability | Included |
| --- | --- |
| Visual systems | Crimson Red and Midnight Blue across client and admin surfaces |
| Theme Studio | Identity, logo, favicons, dashboard and login media, console appearance, glass, radius, and motion |
| Faster control | Search, command palette, favorites, server groups, quick actions, and mobile navigation |
| Operational insight | Live resource graphs, retained telemetry, persistent notifications, announcements, and public status |
| Responsive behavior | Desktop and mobile layouts, coarse-pointer fallbacks, and reduced-motion support |
| Safer delivery | Verified releases, rollback snapshots, recovery guards, and upstream compatibility automation |

## Quick install

> [!CAUTION]
> Use a tested backup. The installer snapshots panel files, but you must back up the database and `.env` separately.

Run these commands on an existing Pterodactyl `1.15.1` installation:

```bash
curl -fsSL https://raw.githubusercontent.com/devrock07/Rock-Theme/main/install.sh \
  -o /tmp/rock-theme-install.sh
sudo bash /tmp/rock-theme-install.sh install
```

The manager verifies release checksums and archive structure before modifying the panel. See the [installation guide](./docs/INSTALLATION.md) for updates, restore, custom paths, and manual deployment.

## Compatibility

| Component | Supported |
| --- | --- |
| Rock Theme | `2.1.0` |
| Pterodactyl Panel | `1.15.1` |
| PHP | `8.2` and `8.3` |
| Source builds | Node.js `22+` and Yarn Classic `1.x` |
| Containers | `linux/amd64` and `linux/arm64` |

Upgrade themed installations through a compatible Rock Theme release. Do not run the official Pterodactyl updater directly over theme files.

## Documentation

- [Installation](./docs/INSTALLATION.md)
- [Configuration](./docs/CONFIGURATION.md)
- [Operator recipes](./docs/RECIPES.md)
- [Upgrading and recovery](./docs/UPGRADING.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Building from source](./BUILDING.md)
- [Roadmap](./ROADMAP.md)

The documentation website source lives in [`website/`](./website) and uses only screenshots captured from the running local panel.

## Support and security

Use [GitHub Issues](https://github.com/devrock07/Rock-Theme/issues) for reproducible bugs and [GitHub Discussions](https://github.com/devrock07/Rock-Theme/discussions) for usage questions. Never disclose vulnerabilities publicly; follow the [security policy](./SECURITY.md) and use [private vulnerability reporting](https://github.com/devrock07/Rock-Theme/security/advisories/new).

## License and attribution

Rock Theme is a derivative Pterodactyl panel distribution containing NookTheme-derived work and adapted third-party interface components. It is not affiliated with Pterodactyl, Nookure, or React Bits.

- Rock Theme and applicable NookTheme-derived modifications are distributed under [GNU GPLv3](./LICENSE), subject to third-party terms.
- Pterodactyl code retains its [MIT license](./PTERODACTYL_LICENSE.md).
- Component licenses and attribution are documented in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

Copyright © 2022–2026 DevRock. Upstream notices remain with their respective owners.
