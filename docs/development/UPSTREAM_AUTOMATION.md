# Upstream Autopilot

Rock Theme checks the official `pterodactyl/panel` releases every day. When a
new stable tag appears, the `Upstream Autopilot` GitHub Actions workflow:

1. reads the supported base from `.rock/upstream-version`;
2. resolves and pins the peeled commits for the old and new official
   Pterodactyl tags before fetching either tree;
3. performs a true three-tree merge using the old official tree as the base,
   the current Rock Theme tree as the customized side, and the new official
   tree as the upstream side;
4. updates the displayed panel, package, compatibility, and Rock Theme
   versions;
5. tests the candidate with TypeScript, ESLint, Jest, two matching production
   Webpack builds, PHP 8.2 and 8.3, MySQL 8 and 9, MariaDB 10 and 11, and a
   multi-architecture container build;
6. fast-forwards `main`, creates the next patch release, attaches a compiled
   `panel.tar.gz` and checksum, dispatches both the versioned and `edge`
   container publishes, waits for both runs, and verifies their GHCR aliases.

Nothing is promoted when the merge, build, formatting, unit, integration, or
candidate-container checks fail. If a later release or registry operation fails
after `main` advances, the exact validated commit remains on the reserved
`automation/upstream-candidate` branch. The next run re-validates that commit,
repairs only the missing tag, release asset, or source-marked GHCR channel, and
then removes the reserved branch with an exact-SHA compare-and-delete. Newer
upstream releases wait until that publication is complete. A pending candidate
is rejected instead of republished if `main` has moved to a different Rock Theme
version or a newer semantic Rock Theme release already exists. Healthy
scheduled runs do not rebuild or republish anything. One GitHub issue tracks
failures until the desired release state is verified.

## Repository permissions

Keep the repository's default workflow permission at **Read repository
contents and packages**. The workflow uses the built-in `GITHUB_TOKEN` and
declares narrowly scoped write access only on the job that promotes a verified
update, publishes containers, or resolves a failure report. Candidate creation,
testing, and packaging remain read-only. No personal access token or external
service is required.

## Manual run

Open **Actions → Upstream Autopilot → Run workflow**. Leave the tag blank to
use the latest official stable release, or enter a specific stable tag such as
`v1.15.1` for a controlled retry. Tags older than the currently supported base
are rejected, so a manual run cannot accidentally downgrade the panel.

## Safety model

Candidate creation, validation, and archive packaging receive read-only
repository permissions. They exchange an SHA-verified Git bundle and inert
release artifacts; candidate files are never checked out or executed in the
write-capable promotion job. Promotion must be exactly one commit above the
validated `main`, and atomically advances `main` while preserving the candidate
on a reserved recovery branch. Rock Theme version discovery uses GitHub release
records rather than the repository's shared Pterodactyl tag namespace. Existing
release tags are immutable and remain the release source when later commits
advance `main`; only `edge` follows the newer main commit. Official upstream tag
commits must still match the SHAs recorded during detection. Dispatched container
runs carry the expected release or edge commit SHA and a unique correlation
identifier, are awaited synchronously, and publish commit-specific source
markers used by later health checks.

Autopilot exclusively owns releases for tags it pushes with the built-in
`GITHUB_TOKEN`. Every draft it creates carries both the `github-actions[bot]`
author and a source-commit ownership marker in its body. Autopilot requires both
before replacing assets or publishing an existing draft; a human-authored or
unmarked draft stays untouched in `human-review` mode. The separate tag-based
Release workflow explicitly ignores `github-actions[bot]`, so it cannot race
Autopilot by creating a second draft; human-pushed version tags continue to use
the reviewed draft-release flow.
