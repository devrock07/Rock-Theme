# Roadmap

Rock Theme follows the latest verified Pterodactyl release while treating
stability, accessibility, and responsive behavior as release requirements.
The live planning board is available in the repository's
[Rock Theme Roadmap](https://github.com/users/devrock07/projects/3) on GitHub.

## v2.1.0 delivery

The v2.1.0 milestone delivers the implementation tracked by the original
public-board backlog:

-   verified daily upstream-release detection and gated promotion;
-   async regression coverage for notifications, uploads, backups, settings,
    server transitions, retries, and error recovery;
-   installer interruption, failure, custom-path, and rollback scenarios;
-   a deployment-driven phone, tablet, desktop, and ultrawide browser matrix;
-   keyboard, focus, touch-target, contrast, and reduced-motion improvements;
-   behavioral parity between Crimson Red and Midnight Blue;
-   production configuration recipes for common operator setups;
-   deterministic release artifacts with source, size, and SHA diagnostics; and
-   continuous dependency auditing and CodeQL analysis alongside repository
    secret scanning.

## Continuous priorities

### Compatibility

-   Track stable Pterodactyl releases through the verified upstream autopilot.
-   Keep the PHP and database CI matrix aligned with supported deployment targets.
-   Publish reproducible archives, checksums, and multi-architecture containers.

### Reliability

-   Extend regression coverage whenever an async panel or installer defect is
    found.
-   Keep installer update and rollback paths recoverable as deployment behavior
    evolves.
-   Improve diagnostics without exposing credentials or production data.

### Interface quality

-   Run the viewport matrix for release candidates and retain focused evidence
    for regressions.
-   Keep keyboard navigation, contrast, focus visibility, and reduced-motion
    behavior in the release gate.
-   Preserve Crimson Red and Midnight Blue parity for every new shared surface.

### Documentation and community

-   Maintain the Wiki as the operational handbook for operators and contributors.
-   Keep branding, status, console-media, and deployment recipes aligned with the
    actual admin settings.
-   Label issues consistently and keep release notes useful for upgrades.

## How work is selected

Security and data-loss risks come first, followed by broken core workflows,
Pterodactyl compatibility, accessibility, mobile regressions, and focused
enhancements. A roadmap item is not a promise of a specific delivery date.

Proposals should start with a
[feature request](https://github.com/devrock07/Rock-Theme/issues/new?template=2-feature-request.yml)
that explains the user problem, affected views, and expected behavior.
