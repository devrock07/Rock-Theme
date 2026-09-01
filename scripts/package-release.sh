#!/usr/bin/env bash

set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

output="${1:-panel.tar.gz}"
work_dir="$(mktemp -d "${TMPDIR:-/tmp}/rock-theme-package.XXXXXX")"
first_staging="$work_dir/first"
second_staging="$work_dir/second"
repeat_archive="$work_dir/panel-repeat.tar.gz"
output_directory="$(dirname -- "$output")"
output_name="$(basename -- "$output")"
output_temp=''

cleanup_package() {
    rm -rf -- "$work_dir"
    [ -z "$output_temp" ] || rm -f -- "$output_temp"
}

assert_clean_source() {
    if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
        printf 'Release packages must be created from a clean working tree.\n' >&2
        return 1
    fi
}

trap cleanup_package EXIT

git rev-parse --verify HEAD >/dev/null 2>&1 || {
    printf 'Rock Theme must be committed before creating a release package.\n' >&2
    exit 1
}
assert_clean_source

source_commit="$(git rev-parse HEAD)"
source_date_epoch="$(git show -s --format=%ct HEAD)"
theme_version="$(node -p "require('./package.json').version")"
pterodactyl_version="$(tr -d '[:space:]' < .rock/upstream-version)"

if [ -L "$output_directory" ] || [ -L "$output" ]; then
    printf 'Refusing to write a release package through a symbolic link: %s\n' "$output" >&2
    exit 1
fi
mkdir -p -- "$output_directory"
output_directory="$(cd "$output_directory" && pwd -P)"
output="$output_directory/$output_name"
output_temp="$(mktemp "$output_directory/.${output_name}.tmp.XXXXXX")"

prepare_staging() {
    local staging="$1"
    local unsafe_link=''
    mkdir -p "$staging"
    git archive --format=tar HEAD | tar -xf - -C "$staging"
    unsafe_link="$(find "$staging" -type l -print -quit)"
    if [ -n "$unsafe_link" ]; then
        printf 'Release source contains an unsupported symbolic link: %s\n' "${unsafe_link#"$staging/"}" >&2
        return 1
    fi
    rm -rf "$staging/.github" "$staging/tests" "$staging/storage"
    rm -f -- "$staging/.env"
    mkdir -p "$staging/public/assets"
    node "$staging/scripts/copy-compiled-assets.js" public/assets "$staging/public/assets"
    THEME_VERSION="$theme_version" \
    PTERODACTYL_VERSION="$pterodactyl_version" \
    SOURCE_COMMIT="$source_commit" \
        node -e '
            const fs = require("fs");
            fs.writeFileSync(process.argv[1], JSON.stringify({
                schema: 1,
                theme_version: process.env.THEME_VERSION,
                pterodactyl_version: process.env.PTERODACTYL_VERSION,
                source_commit: process.env.SOURCE_COMMIT,
            }) + "\n");
        ' "$staging/.rock/release.json"

    find "$staging" -type d -exec chmod 0755 {} +
    find "$staging" -type f -exec chmod 0644 {} +
    while IFS= read -r -d '' entry; do
        mode="${entry%% *}"
        path="${entry#*$'\t'}"
        if [ "$mode" = '100755' ] && [ -f "$staging/$path" ]; then
            chmod 0755 "$staging/$path"
        fi
    done < <(git ls-files -z --stage)
}

create_archive() {
    local staging="$1"
    local archive="$2"
    LC_ALL=C tar \
        --sort=name \
        --mtime="@$source_date_epoch" \
        --owner=0 \
        --group=0 \
        --numeric-owner \
        --mode='u+rwX,go+rX,go-w' \
        -C "$staging" \
        -cf - . | gzip -n > "$archive"
}

prepare_staging "$first_staging"
create_archive "$first_staging" "$output_temp"
prepare_staging "$second_staging"
create_archive "$second_staging" "$repeat_archive"
if ! cmp --silent -- "$output_temp" "$repeat_archive"; then
    printf 'Release packaging was not byte reproducible across two staging passes.\n' >&2
    exit 1
fi
mv -f -- "$output_temp" "$output"
output_temp=''
