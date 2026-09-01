# Roadmap

Rock Theme follows the latest verified Pterodactyl release while treating
stability, accessibility, and responsive behavior as release requirements.
The live planning board is available in the repository's
[Rock Theme Roadmap](https://github.com/users/devrock07/projects/3) on GitHub.

## Current priorities

### Compatibility

-   Track stable Pterodactyl releases through the verified upstream autopilot.
-   Keep the PHP and database CI matrix aligned with supported deployment targets.
-   Publish reproducible archives, checksums, and multi-architecture containers.

### Reliability

-   Expand regression coverage for async panel state, uploads, backups, settings,
    notifications, and server transitions.
-   Keep installer update and rollback paths recoverable under interrupted or
    failed operations.
-   Improve diagnostics without exposing credentials or production data.

### Interface quality

-   Continue viewport testing across phone, tablet, desktop, and ultrawide layouts.
-   Improve keyboard navigation, contrast, focus visibility, and reduced-motion
    behavior.
-   Keep Crimson Red and Midnight Blue visually complete and behaviorally equal.

### Documentation and community

-   Maintain the Wiki as the operational handbook for operators and contributors.
-   Add focused examples for branding, status configuration, and console media.
-   Label issues consistently and keep release notes useful for upgrades.

## How work is selected

Security and data-loss risks come first, followed by broken core workflows,
Pterodactyl compatibility, accessibility, mobile regressions, and focused
enhancements. A roadmap item is not a promise of a specific delivery date.

Proposals should start with a
[feature request](https://github.com/devrock07/Rock-Theme/issues/new?template=2-feature-request.yml)
that explains the user problem, affected views, and expected behavior.
