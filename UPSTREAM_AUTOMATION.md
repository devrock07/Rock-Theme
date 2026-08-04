# Upstream Autopilot

Rock Theme checks the official `pterodactyl/panel` releases every day. When a
new stable tag appears, the `Upstream Autopilot` GitHub Actions workflow:

1. reads the supported base from `.rock/upstream-version`;
2. fetches the old and new official Pterodactyl tag trees;
3. performs a true three-tree merge using the old official tree as the base,
   the current Rock Theme tree as the customized side, and the new official
   tree as the upstream side;
4. updates the displayed panel, package, compatibility, and Rock Theme
   versions;
5. tests the candidate with TypeScript, ESLint, Jest, a production Webpack
   build, PHP 8.2 and 8.3, MySQL 8 and 9, and MariaDB 10 and 11;
6. fast-forwards `main`, creates the next patch release, attaches a compiled
   `panel.tar.gz` and checksum, and dispatches the container build.

Nothing is published when the merge, build, formatting, unit, or integration
tests fail. The workflow leaves `main` and the latest release untouched and
opens one GitHub issue linking to the failed run. This prevents an upstream
change from silently producing a broken panel.

## Repository setting

GitHub Actions must have **Read and write permissions** under **Settings →
Actions → General → Workflow permissions**. The workflow uses the repository's
built-in `GITHUB_TOKEN`; no personal access token or external service is
required.

## Manual run

Open **Actions → Upstream Autopilot → Run workflow**. Leave the tag blank to
use the latest official stable release, or enter a specific stable tag such as
`v1.15.0` for a controlled retry.

## Safety model

The validation jobs receive read-only repository permissions. Write access is
limited to preparing the isolated automation branch, promoting a candidate
that passed every check, creating its release, and opening a failure issue.
The workflow never force-pushes `main`; promotion must be a clean fast-forward.
