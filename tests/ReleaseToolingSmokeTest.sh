#!/usr/bin/env bash

set -Eeuo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
workspace="$(mktemp -d "${TMPDIR:-/tmp}/rock-theme-release-tools.XXXXXX")"
fixture="$workspace/repository"
artifact="$workspace/panel.tar.gz"

cleanup_test() {
    local status=$?
    rm -rf -- "$workspace"
    return "$status"
}
trap cleanup_test EXIT

mkdir -p "$fixture/.rock" "$fixture/public/assets" "$fixture/scripts" "$fixture/storage/private" "$fixture/website"
cp "$root/scripts/copy-compiled-assets.js" "$fixture/scripts/copy-compiled-assets.js"
cp "$root/scripts/package-release.sh" "$fixture/scripts/package-release.sh"
printf '#!/usr/bin/env php\n' >"$fixture/artisan"
printf '{"version":"9.9.9"}\n' >"$fixture/package.json"
printf 'v1.15.1\n' >"$fixture/.rock/upstream-version"
printf '*\n!.gitignore\n' >"$fixture/public/assets/.gitignore"
printf 'APP_KEY=must-not-ship\n' >"$fixture/.env"
printf 'private-runtime-data\n' >"$fixture/storage/private/runtime.txt"
printf 'documentation-only\n' >"$fixture/website/index.html"

(
    cd "$fixture"
    git init -q
    git config user.name 'Rockdactyl Tests'
    git config user.email 'tests@rock-theme.invalid'
    git add .
    git add -f .env storage/private/runtime.txt
    git commit -qm 'release fixture'
)

javascript='console.log("verified");'
printf '%s\n' "$javascript" >"$fixture/public/assets/app.js"
integrity="$(node -e '
    const crypto = require("crypto");
    const fs = require("fs");
    process.stdout.write(`sha384-${crypto.createHash("sha384").update(fs.readFileSync(process.argv[1])).digest("base64")}`);
' "$fixture/public/assets/app.js")"
printf '{"main.js":{"src":"/assets/app.js","integrity":"%s"}}\n' "$integrity" >"$fixture/public/assets/manifest.json"

(cd "$fixture" && bash scripts/package-release.sh "$artifact")
first_sha="$(sha256sum "$artifact")"
first_sha="${first_sha%% *}"
tar -tzf "$artifact" >"$workspace/archive-list"
grep -Eq '^\./artisan$' "$workspace/archive-list"
grep -Eq '^\./public/assets/app\.js$' "$workspace/archive-list"
if grep -Eq '^\./\.env$|^\./storage(/|$)|^\./website(/|$)' "$workspace/archive-list"; then
    printf 'Release package contains a protected or deployment-only path.\n' >&2
    exit 1
fi
provenance="$(tar -xOf "$artifact" ./.rock/release.json)"
node -e '
    const value = JSON.parse(process.argv[1]);
    if (value.theme_version !== "9.9.9" || value.pterodactyl_version !== "v1.15.1" || !/^[0-9a-f]{40}$/.test(value.source_commit)) {
        process.exit(1);
    }
' "$provenance"

(cd "$fixture" && bash scripts/package-release.sh "$artifact")
second_sha="$(sha256sum "$artifact")"
second_sha="${second_sha%% *}"
[ "$first_sha" = "$second_sha" ]

printf '\n' >>"$fixture/package.json"
set +e
(cd "$fixture" && bash scripts/package-release.sh "$artifact") >"$workspace/dirty.log" 2>&1
dirty_status=$?
set -e
[ "$dirty_status" -ne 0 ]
grep -q 'clean working tree' "$workspace/dirty.log"
[ "$first_sha" = "$(sha256sum "$artifact" | cut -d' ' -f1)" ]
(cd "$fixture" && git checkout -q -- package.json)

printf 'sentinel\n' >"$workspace/symlink-target"
ln -s "$workspace/symlink-target" "$workspace/symlink-output"
if [ -L "$workspace/symlink-output" ]; then
    set +e
    (cd "$fixture" && bash scripts/package-release.sh "$workspace/symlink-output") >"$workspace/symlink.log" 2>&1
    symlink_status=$?
    set -e
    [ "$symlink_status" -ne 0 ]
    grep -q 'symbolic link' "$workspace/symlink.log"
    grep -q '^sentinel$' "$workspace/symlink-target"
fi

verifier="$workspace/verifier"
verifier_bin="$workspace/verifier-bin"
mkdir -p "$verifier/.rock" "$verifier/node_modules" "$verifier/public/assets" "$verifier/scripts" "$verifier_bin"
cp "$root/scripts/copy-compiled-assets.js" "$verifier/scripts/copy-compiled-assets.js"
cp "$root/scripts/verify-release-assets.sh" "$verifier/scripts/verify-release-assets.sh"
printf '{"version":"9.9.9"}\n' >"$verifier/package.json"
printf 'v1.15.1\n' >"$verifier/.rock/upstream-version"
printf '/node_modules/\n/public/assets/*\n!/public/assets/.gitignore\n' >"$verifier/.gitignore"
printf '*\n!.gitignore\n' >"$verifier/public/assets/.gitignore"
cat >"$verifier_bin/yarn" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
[ "${1:-}" = 'build:production' ] || exit 0
mkdir -p public/assets
printf '%s\n' "$PWD" >>"$MOCK_BUILD_LOG"
count=1
if [ "${MOCK_YARN_NONDETERMINISTIC:-0}" = '1' ]; then
    [ ! -f "$MOCK_YARN_COUNTER" ] || count="$(<"$MOCK_YARN_COUNTER")"
    count=$((count + 1))
    printf '%s\n' "$count" >"$MOCK_YARN_COUNTER"
fi
printf 'compiled-%s\n' "$count" >public/assets/app.js
integrity="$(node -e '
    const crypto = require("crypto");
    const fs = require("fs");
    process.stdout.write(`sha384-${crypto.createHash("sha384").update(fs.readFileSync(process.argv[1])).digest("base64")}`);
' public/assets/app.js)"
printf '{"main.js":{"src":"/assets/app.js","integrity":"%s"}}\n' "$integrity" >public/assets/manifest.json
EOF
chmod +x "$verifier_bin/yarn"
(
    cd "$verifier"
    git init -q
    git config user.name 'Rockdactyl Tests'
    git config user.email 'tests@rock-theme.invalid'
    git add .
    git commit -qm 'verifier fixture'
)

export MOCK_BUILD_LOG="$workspace/build-directories"
export MOCK_YARN_COUNTER="$workspace/build-counter"
verifier_path="$verifier_bin:$PATH"
(cd "$verifier" && PATH="$verifier_path" bash scripts/verify-release-assets.sh) >"$workspace/verifier.log" 2>&1
grep -q 'two isolated clean builds' "$workspace/verifier.log"
[ "$(sort -u "$MOCK_BUILD_LOG" | wc -l | tr -d '[:space:]')" = '2' ]
grep -q '^compiled-1$' "$verifier/public/assets/app.js"

rm -f -- "$MOCK_BUILD_LOG" "$MOCK_YARN_COUNTER"
set +e
(cd "$verifier" && PATH="$verifier_path" MOCK_YARN_NONDETERMINISTIC=1 bash scripts/verify-release-assets.sh) >"$workspace/verifier-nondeterministic.log" 2>&1
verifier_status=$?
set -e
[ "$verifier_status" -ne 0 ]
grep -q 'not reproducible across two isolated clean builds' "$workspace/verifier-nondeterministic.log"

publisher="$workspace/publisher"
publisher_bin="$workspace/publisher-bin"
real_mv="$(command -v mv)"
mkdir -p "$publisher/.rock" "$publisher/scripts" "$publisher_bin"
cp "$root/release.sh" "$publisher/release.sh"
printf '{"version":"9.9.9"}\n' >"$publisher/package.json"
printf 'v1.15.1\n' >"$publisher/.rock/upstream-version"
printf '/release/\n' >"$publisher/.gitignore"
cat >"$publisher/scripts/verify-release-assets.sh" <<'EOF'
#!/usr/bin/env bash
exit 0
EOF
cat >"$publisher/scripts/package-release.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
temporary="$(mktemp -d "${TMPDIR:-/tmp}/rock-theme-publisher.XXXXXX")"
trap 'rm -rf -- "$temporary"' EXIT
printf '#!/usr/bin/env php\n' >"$temporary/artisan"
printf '%s\n' "${PUBLISH_CONTENT:-release}" >"$temporary/content"
tar -C "$temporary" -czf "$1" .
EOF
cat >"$publisher_bin/yarn" <<'EOF'
#!/usr/bin/env bash
exit 0
EOF
cat >"$publisher_bin/mv" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
destination="${*: -1}"
if [ "${MOCK_SECOND_MOVE_FAIL:-0}" = '1' ] && [[ "$destination" == */release/panel.tar.gz.sha256 ]] && [ ! -e "$MOCK_MV_MARKER" ]; then
    : >"$MOCK_MV_MARKER"
    printf 'simulated checksum publication failure\n' >&2
    exit 88
fi
exec "$REAL_MV" "$@"
EOF
chmod +x "$publisher/scripts/verify-release-assets.sh" "$publisher/scripts/package-release.sh" "$publisher_bin/yarn" "$publisher_bin/mv"
(
    cd "$publisher"
    git init -q
    git config user.name 'Rockdactyl Tests'
    git config user.email 'tests@rock-theme.invalid'
    git add .
    git commit -qm 'publisher fixture'
)

publisher_path="$publisher_bin:$PATH"
export REAL_MV="$real_mv"
(cd "$publisher" && PATH="$publisher_path" PUBLISH_CONTENT=previous bash ./release.sh) >"$workspace/publish-first.log" 2>&1
previous_sha="$(sha256sum "$publisher/release/panel.tar.gz")"
previous_sha="${previous_sha%% *}"
(cd "$publisher/release" && sha256sum --check --status panel.tar.gz.sha256)

export MOCK_MV_MARKER="$workspace/mv-failed"
set +e
(cd "$publisher" && PATH="$publisher_path" PUBLISH_CONTENT=replacement MOCK_SECOND_MOVE_FAIL=1 bash ./release.sh) >"$workspace/publish-failure.log" 2>&1
publish_status=$?
set -e
[ "$publish_status" -ne 0 ]
grep -q 'simulated checksum publication failure' "$workspace/publish-failure.log"
[ -e "$MOCK_MV_MARKER" ]
[ "$previous_sha" = "$(sha256sum "$publisher/release/panel.tar.gz" | cut -d' ' -f1)" ]
(cd "$publisher/release" && sha256sum --check --status panel.tar.gz.sha256)
[ -z "$(find "$publisher/release" -maxdepth 1 -name '*.tmp.*' -print -quit)" ]

printf 'Release tooling smoke tests passed.\n'
