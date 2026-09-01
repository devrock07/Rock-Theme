# Changelog

Rock Theme follows [Semantic Versioning](https://semver.org/). This file tracks
Rock Theme releases; upstream panel history remains in the
[Pterodactyl changelog](https://github.com/pterodactyl/panel/releases).

## Rock Theme v2.1.0 — 2026-09-01

### Added

- Deployment-driven Playwright QA for phone, tablet, desktop, and ultrawide
  viewports, including HTTP/runtime, overflow, control-size, and screenshot
  evidence checks.
- Async regression coverage for notification persistence, file uploads, backup
  actions, settings storage, server navigation races, retries, and error paths.
- Production operator recipes for branding, themes, status privacy,
  announcements, console media, mobile use, reverse proxying, and telemetry.
- Installer scenarios for custom paths, corrupt artifacts, interrupted updates,
  failed snapshots, extraction, dependencies, migrations, and original-panel
  restoration.

### Changed

- Strengthened keyboard navigation, focus containment and restoration, visible
  focus rings, icon labels, reduced motion, and compact touch targets throughout
  client and server views.
- Kept Crimson Red and Midnight Blue on the same shared surface, dialog,
  dropdown, login, and chart token system.
- Made installer snapshots and release outputs atomic, with guarded file
  recovery before database migrations begin.
- Staged release files before deployment, removed stale application files,
  preserved live `.env` and storage data, checksummed recovery snapshots, and
  kept failed database migrations in maintenance mode for operator review.
- Bound installer provenance to the immutable release tag and rejected archive
  traversal, duplicate members, links, special files, and protected live paths.
- Made local, tagged, and autopilot assets and archives reproducible through
  independent builds, manifest-only asset selection, stable path ordering,
  normalized metadata, and timestamp-free gzip output, with source/SHA
  diagnostics in release summaries.
- Added protected-environment controls to real-panel responsive QA so test
  credentials cannot be redirected through workflow inputs.

### Fixed

- Prevented persisted dashboard state from leaking across account or server
  storage keys and added malformed, quota, removal, and cross-tab recovery.
- Prevented stale server-load failures from replacing a newer navigation and
  exposed a working retry state after load errors.
- Restored accessible, theme-aware file and backup menus across mobile dialogs
  and portal-based dropdowns.

## Rock Theme v2.0.3 — 2026-09-01

### Added

- Professional operator and contributor documentation covering installation,
  configuration, upgrades, recovery, architecture, support, governance, and
  project direction.
- Structured bug, feature, and installation-support forms plus a pull request
  template, CODEOWNERS, release-note categories, and community standards.
- A public, structured GitHub Project roadmap and a publication-ready Wiki.
- CodeQL, pull-request dependency review, and grouped Dependabot maintenance.
- Regression coverage for automatic compatibility/version metadata updates.

### Changed

- Hardened frontend, backend, release, container, security, and upstream
  automation with immutable action revisions, least-privilege permissions,
  concurrency control, timeouts, and verified release gates.
- Made automatic releases recover safely from partial tag, asset, or container
  publication without moving immutable tags or rebuilding healthy channels.
- Made container publication follow verified commits, validated
  multi-architecture candidates before promotion, and documented a Rock Theme
  Compose deployment.
- Expanded upstream metadata synchronization so future Pterodactyl and
  theme-only releases update every published compatibility surface atomically.
- Normalized the project license layout and retained the upstream Pterodactyl
  license separately.

### Fixed

- Corrected installed-app icon metadata so the documented 192px and 512px
  Android assets are both used.
- Corrected public-status privacy guidance and removed stale or contradictory
  installation, container, and workflow instructions.
