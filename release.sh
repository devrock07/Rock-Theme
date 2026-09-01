#!/usr/bin/env bash

set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$root"

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "Rock Theme must be committed before creating a release archive." >&2
    exit 1
fi

started_at="$(date +%s)"
staging="$(mktemp -d "${TMPDIR:-/tmp}/rock-theme-release.XXXXXX")"
trap 'rm -rf "$staging"' EXIT

yarn build:production

git archive --format=tar HEAD | tar -xf - -C "$staging"
rm -rf "$staging/public/assets" "$staging/.github" "$staging/tests"
mkdir -p "$staging/public/assets" "$root/release"
cp -a "$root/public/assets/." "$staging/public/assets/"
THEME_VERSION="$(node -p "require('./package.json').version")" \
PTERODACTYL_VERSION="$(tr -d '[:space:]' < "$root/.rock/upstream-version")" \
SOURCE_COMMIT="$(git rev-parse HEAD)" \
node -e '
    const fs = require("fs");
    fs.writeFileSync(process.argv[1], JSON.stringify({
        schema: 1,
        theme_version: process.env.THEME_VERSION,
        pterodactyl_version: process.env.PTERODACTYL_VERSION,
        source_commit: process.env.SOURCE_COMMIT,
    }) + "\n");
' "$staging/.rock/release.json"

tar -C "$staging" -czf "$root/release/panel.tar.gz" .
(
    cd "$root/release"
    sha256sum panel.tar.gz > panel.tar.gz.sha256
)

finished_at="$(date +%s)"
echo "Created release/panel.tar.gz in $((finished_at - started_at)) seconds."
