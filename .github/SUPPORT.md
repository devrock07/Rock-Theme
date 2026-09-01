# Support

Rock Theme support covers installation, updating, branding, responsive layout,
theme-specific interface behavior, and regressions introduced by this
repository.

## Choose the right channel

| Topic                                                 | Where to ask                                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Reproducible Rock Theme bug                           | [Open a bug report](https://github.com/devrock07/Rock-Theme/issues/new?template=1-bug-report.yml)                   |
| Focused interface proposal                            | [Open a feature request](https://github.com/devrock07/Rock-Theme/issues/new?template=2-feature-request.yml)         |
| Installation or update problem                        | [Open an installation request](https://github.com/devrock07/Rock-Theme/issues/new?template=3-installation-help.yml) |
| General usage question                                | [Ask in Q&A](https://github.com/devrock07/Rock-Theme/discussions/categories/q-a)                                    |
| Suspected vulnerability                               | [Report privately](https://github.com/devrock07/Rock-Theme/security/advisories/new)                                 |
| Pterodactyl, Wings, node, egg, or game-server problem | [Pterodactyl documentation](https://pterodactyl.io)                                                                 |

## Before opening an issue

1. Confirm the problem occurs on the latest Rock Theme release and its supported
   Pterodactyl version.
2. Clear the panel caches and perform a hard browser refresh.
3. Check the [Wiki](https://github.com/devrock07/Rock-Theme/wiki), existing
   issues and discussions, and release notes.
4. Reproduce the problem with browser extensions disabled when practical.
5. Remove passwords, tokens, IP addresses, database contents, and personal data
   from screenshots and logs.

Include the Rock Theme and Pterodactyl versions, installation method, operating
system, PHP version, browser/device, affected route, exact reproduction steps,
expected behavior, relevant redacted logs, and screenshots for visual issues.

## Useful diagnostics

From the panel directory, these commands provide the most useful non-secret
context:

```bash
php artisan --version
php -v
git rev-parse --short HEAD 2>/dev/null || true
tail -n 100 storage/logs/laravel-$(date +%F).log
```

Review logs before sharing them and redact secrets or personal information.

## Support boundaries

This is a community project provided without a service-level agreement. The
maintainer may close requests that cannot be reproduced, target unsupported
versions, concern upstream Pterodactyl behavior, or omit the information needed
to investigate.
