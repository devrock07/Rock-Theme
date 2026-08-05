#!/usr/bin/env bash

set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
workspace="$(mktemp -d "${TMPDIR:-/tmp}/rock-theme-installer-test.XXXXXX")"
trap 'rm -rf -- "$workspace"' EXIT

panel="$workspace/panel"
backups="$workspace/backups"
fixture="$workspace/fixture"
release="$workspace/release"
mock_bin="$workspace/bin"
success_output="$workspace/success.log"
failure_output="$workspace/failure.log"
plain_output="$workspace/plain.log"

mkdir -p "$panel/storage/framework" "$panel/bootstrap/cache" "$fixture" "$release/storage/framework" "$release/bootstrap/cache" "$mock_bin"
printf 'APP_KEY=test\n' >"$panel/.env"
printf '#!/usr/bin/env php\n' >"$panel/artisan"
printf '#!/usr/bin/env php\n' >"$release/artisan"
printf 'updated\n' >"$release/rock-theme-installed"

tar -C "$release" -czf "$fixture/panel.tar.gz" .
(
    cd "$fixture"
    sha256sum panel.tar.gz >panel.tar.gz.sha256
)

cat >"$mock_bin/id" <<'EOF'
#!/usr/bin/env bash
if [ "${1:-}" = '-u' ]; then
    printf '0\n'
fi
exit 0
EOF

cat >"$mock_bin/curl" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
output=''
url=''
while [ "$#" -gt 0 ]; do
    case "$1" in
        --output)
            output="$2"
            shift 2
            ;;
        --*) shift ;;
        *)
            url="$1"
            shift
            ;;
    esac
done

case "$url" in
    */releases/latest)
        printf '{"tag_name":"v9.9.9"}\n'
        ;;
    */panel.tar.gz.sha256)
        cp "$INSTALLER_FIXTURE_DIR/panel.tar.gz.sha256" "$output"
        ;;
    */panel.tar.gz)
        cp "$INSTALLER_FIXTURE_DIR/panel.tar.gz" "$output"
        ;;
    *)
        printf 'Unexpected curl URL: %s\n' "$url" >&2
        exit 2
        ;;
esac
EOF

cat >"$mock_bin/php" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [ "${1:-}" = '-r' ]; then
    cat >/dev/null
    printf 'v9.9.9'
    exit 0
fi

case "${2:-}" in
    down) touch "$PANEL_DIR/storage/framework/down" ;;
    up) rm -f "$PANEL_DIR/storage/framework/down" ;;
esac
EOF

cat >"$mock_bin/composer" <<'EOF'
#!/usr/bin/env bash
if [ "${MOCK_COMPOSER_FAIL:-0}" = '1' ]; then
    printf 'simulated composer failure\n' >&2
    exit 23
fi
sleep 0.25
printf 'mock dependencies installed\n'
EOF

cat >"$mock_bin/chown" <<'EOF'
#!/usr/bin/env bash
exit 0
EOF

chmod +x "$mock_bin/id" "$mock_bin/curl" "$mock_bin/php" "$mock_bin/composer" "$mock_bin/chown"

export INSTALLER_FIXTURE_DIR="$fixture"
export PANEL_DIR="$panel"
export ROCK_BACKUP_ROOT="$backups"
export PATH="$mock_bin:$PATH"

run_installer() {
    local output="$1"
    shift

    if command -v script >/dev/null 2>&1; then
        local command=''
        printf -v command '%q ' bash "$root/install.sh" update "$@"
        script -q -e -c "$command" /dev/null >"$output" 2>&1
    else
        bash "$root/install.sh" update --no-animation "$@" >"$output" 2>&1
    fi
}

bash -n "$root/install.sh" "$root/release.sh"
bash "$root/install.sh" --help | grep -q 'Rock Theme installer'
run_installer "$success_output"

grep -q 'ROCK-CHAN // PANEL UNIT' "$success_output"
grep -q 'DEPLOYMENT COMPLETE' "$success_output"
grep -q '\[14/14\]' "$success_output"
[ -f "$panel/rock-theme-installed" ]
[ ! -f "$panel/storage/framework/down" ]
find "$backups" -maxdepth 1 -name 'before-update-*.tar.gz' -print -quit | grep -q .

bash "$root/install.sh" update --no-animation >"$plain_output" 2>&1
grep -q '\[14/14\]' "$plain_output"
grep -q 'DONE' "$plain_output"

set +e
MOCK_COMPOSER_FAIL=1 run_installer "$failure_output"
failure_status=$?
set -e

[ "$failure_status" -ne 0 ]
grep -q 'simulated composer failure' "$failure_output"
grep -q 'last installer output' "$failure_output"
grep -q 'RECOVERY' "$failure_output"
[ ! -f "$panel/storage/framework/down" ]

printf 'Installer smoke test passed.\n'
