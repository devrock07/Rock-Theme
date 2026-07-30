# Contributing to Rock Theme

Bug fixes, accessibility improvements, responsive refinements, and focused
theme enhancements are welcome.

Use
[GitHub Issues](https://github.com/devrock07/Rock-Theme/issues)
before starting a large visual or architectural change. Core Pterodactyl and
Wings changes should be proposed to their upstream projects.

## Development

Follow [BUILDING.md](./BUILDING.md) and create changes from a focused branch.
Do not commit `.env`, credentials, local databases, runtime files, dependency
directories, or generated frontend bundles.

Before opening a pull request:

```bash
yarn tsc
yarn lint
yarn test
yarn build:production
```

Run the relevant PHP checks when backend code changes.

## Pull requests

Include:

-   A concise explanation of the change
-   The affected client, server, login, or admin views
-   Desktop and mobile screenshots for visual changes
-   Verification performed
-   Any new dependency or third-party source and its license
-   Disclosure of material AI assistance used to produce the change

Keep unrelated formatting or dependency updates out of the same pull request.
Preserve upstream copyright and license notices.

## Security

Do not report vulnerabilities in a public issue. Follow
[SECURITY.md](./SECURITY.md).
