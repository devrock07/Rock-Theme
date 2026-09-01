#!/usr/bin/env bash

set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

work_dir="$(mktemp -d "${TMPDIR:-/tmp}/rock-theme-assets.XXXXXX")"
first_source="$work_dir/source-a"
second_source="$work_dir/source-b"
first_assets="$work_dir/assets-a"
second_assets="$work_dir/assets-b"

cleanup_assets() {
    local status=$?
    set +e
    node -e '
        const fs = require("fs");
        for (const source of process.argv.slice(1, 3)) {
            const modules = require("path").join(source, "node_modules");
            if (!fs.existsSync(modules)) continue;
            const stat = fs.lstatSync(modules);
            if (!stat.isSymbolicLink()) {
                console.error(`Refusing to clean an unexpected node_modules directory: ${modules}`);
                process.exitCode = 1;
                continue;
            }
            fs.unlinkSync(modules);
        }
        if (!process.exitCode) fs.rmSync(process.argv[3], { recursive: true, force: true });
    ' "$first_source" "$second_source" "$work_dir" || true
    return "$status"
}

assert_clean_source() {
    if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
        printf 'Reproducible release assets require a clean working tree.\n' >&2
        return 1
    fi
}

run_yarn_in() {
    local directory="$1"
    shift
    if command -v yarn >/dev/null 2>&1; then
        (cd "$directory" && yarn "$@")
    elif command -v corepack >/dev/null 2>&1; then
        (cd "$directory" && corepack yarn "$@")
    else
        printf 'Yarn or Corepack is required to build release assets.\n' >&2
        return 1
    fi
}

link_dependencies() {
    local source="$1"
    node -e '
        const fs = require("fs");
        const path = require("path");
        const target = path.resolve(process.argv[1]);
        const destination = path.resolve(process.argv[2], "node_modules");
        fs.symlinkSync(target, destination, process.platform === "win32" ? "junction" : "dir");
    ' "$root/node_modules" "$source"
}

prepare_source() {
    local source="$1"
    mkdir -p "$source"
    git archive --format=tar HEAD | tar -xf - -C "$source"
    link_dependencies "$source"
}

trap cleanup_assets EXIT

git rev-parse --verify HEAD >/dev/null 2>&1 || {
    printf 'Rockdactyl must be committed before checking reproducible assets.\n' >&2
    exit 1
}
assert_clean_source
[ -d "$root/node_modules" ] || {
    printf 'Install frozen dependencies before checking reproducible assets.\n' >&2
    exit 1
}

source_date_epoch="$(git show -s --format=%ct HEAD)"
theme_version="$(node -p "require('./package.json').version")"
export CI=true
export LANG=C
export LC_ALL=C
export SOURCE_DATE_EPOCH="$source_date_epoch"
export TZ=UTC
export WEBPACK_BUILD_HASH="$theme_version"

prepare_source "$first_source"
prepare_source "$second_source"

run_yarn_in "$first_source" build:production
node "$first_source/scripts/copy-compiled-assets.js" "$first_source/public/assets" "$first_assets"
run_yarn_in "$second_source" build:production
node "$second_source/scripts/copy-compiled-assets.js" "$second_source/public/assets" "$second_assets"

if ! diff --no-dereference --recursive "$first_assets" "$second_assets"; then
    printf 'Production assets were not reproducible across two isolated clean builds.\n' >&2
    exit 1
fi

# Publish one of the verified sets for the release packager and workflow artifact upload.
node scripts/copy-compiled-assets.js "$second_assets" public/assets
assert_clean_source

printf 'Production assets matched across two isolated clean builds.\n'
