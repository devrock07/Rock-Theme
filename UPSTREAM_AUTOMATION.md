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
   build, PHP 8.2 and 8.3, MySQL 8 and 9, MariaDB 10 and 11, and a
   multi-architecture container build;
6. fast-forwards `main`, creates the next patch release, attaches a compiled
   `panel.tar.gz` and checksum, dispatches both the versioned and `edge`
   container publishes, waits for both runs, and verifies their GHCR aliases.

Nothing is promoted when the merge, build, formatting, unit, integration, or
candidate-container checks fail. If a later release or registry operation fails
after `main` advances, the next run detects the missing tag, release assets, or
source-marked GHCR aliases, re-validates the exact `main` commit, and repairs
only the incomplete channels. Healthy scheduled runs do not rebuild or
republish anything. One GitHub issue tracks failures until the desired release
state is verified.

## Repository permissions

Keep the repository's default workflow permission at **Read repository
contents and packages**. The workflow uses the built-in `GITHUB_TOKEN` and
declares narrowly scoped write access only on the jobs that prepare the
candidate branch, promote a verified update, publish containers, or report a
failure. No personal access token or external service is required.

## Manual run

Open **Actions → Upstream Autopilot → Run workflow**. Leave the tag blank to
use the latest official stable release, or enter a specific stable tag such as
`v1.15.1` for a controlled retry. Tags older than the currently supported base
are rejected, so a manual run cannot accidentally downgrade the panel.

## Safety model

The validation jobs receive read-only repository permissions. Write access is
limited to preparing the isolated automation branch, promoting a candidate
that passed every check, creating its release, and opening a failure issue.
The workflow never force-pushes `main` or an existing release tag; promotion
must be a clean fast-forward and an existing tag must resolve to the exact
validated commit. Dispatched container runs carry the expected commit SHA and a
unique correlation identifier, are awaited synchronously, and publish
commit-specific source markers used by later health checks.

Autopilot exclusively owns releases for tags it pushes with the built-in
`GITHUB_TOKEN`. The separate tag-based Release workflow explicitly ignores
`github-actions[bot]`, so it cannot race Autopilot by creating a second draft;
human-pushed version tags continue to use the reviewed draft-release flow.
