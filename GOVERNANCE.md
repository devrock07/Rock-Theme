# Governance

Rock Theme is maintained by [DevRock](https://github.com/devrock07). The
maintainer sets release scope, reviews contributions, manages compatibility,
and makes final decisions when consensus is not available.

## Decision principles

Changes are evaluated against these priorities, in order:

1. Protect user data, credentials, and recoverability.
2. Preserve working Pterodactyl server-management behavior.
3. Maintain compatibility with the supported upstream release.
4. Keep desktop and mobile experiences accessible and consistent.
5. Prefer maintainable, tested improvements over visual novelty alone.

Routine fixes can be accepted through normal review. Large interface,
dependency, data-model, licensing, or automation changes should begin with an
issue so the scope and tradeoffs are visible before implementation.

## Releases

Rock Theme uses semantic version tags. Patch releases contain compatible fixes
and verified upstream ports; minor releases may add features or settings; major
releases may change installation, configuration, or compatibility expectations.
Only releases with passing frontend, backend, archive, and container checks are
published as stable.

## Upstream relationship

Rock Theme is a derivative distribution, not an official Pterodactyl project.
Upstream fixes are integrated without removing Rock Theme behavior unless the
upstream change makes that behavior unsafe or incompatible. Core Pterodactyl
proposals should be contributed upstream whenever appropriate.

## Community participation

Anyone may report issues, propose focused improvements, or submit pull
requests. Participation is governed by [CONTRIBUTING.md](./CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Maintainer status is not currently
delegated, but sustained, high-quality participation may lead to broader review
or triage responsibilities in the future.
