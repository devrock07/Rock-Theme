#!/usr/bin/env bash

set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$root"

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "Rock Theme must be committed before creating a release archive." >&2
    exit 1
fi

if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
    echo "Rock Theme releases must be created from a clean working tree." >&2
    exit 1
fi

started_at="$(date +%s)"
work_dir="$(mktemp -d "${TMPDIR:-/tmp}/rock-theme-release.XXXXXX")"
artifact="$work_dir/panel.tar.gz"
checksum="$work_dir/panel.tar.gz.sha256"
artifact_temp=''
checksum_temp=''
previous_release="$work_dir/previous-release"
had_previous_release=false
publication_started=false
publication_complete=false

restore_previous_release() {
    rm -f -- "$root/release/panel.tar.gz" "$root/release/panel.tar.gz.sha256"
    if [ "$had_previous_release" = true ]; then
        cp "$previous_release/panel.tar.gz" "$root/release/panel.tar.gz"
        cp "$previous_release/panel.tar.gz.sha256" "$root/release/panel.tar.gz.sha256"
        (cd "$root/release" && sha256sum --check --status panel.tar.gz.sha256)
    fi
}

cleanup_release() {
    local status=$?
    set +e
    if [ "$status" -ne 0 ] && [ "$publication_started" = true ] && [ "$publication_complete" = false ]; then
        if ! restore_previous_release; then
            rm -f -- "$root/release/panel.tar.gz" "$root/release/panel.tar.gz.sha256"
            printf 'Failed to restore the previous release pair; incomplete outputs were removed.\n' >&2
        fi
    fi
    rm -rf -- "$work_dir"
    [ -z "$artifact_temp" ] || rm -f -- "$artifact_temp"
    [ -z "$checksum_temp" ] || rm -f -- "$checksum_temp"
    return "$status"
}

assert_clean_source() {
    if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
        printf 'Rock Theme releases must be created from a clean working tree.\n' >&2
        return 1
    fi
}

run_yarn() {
    if command -v yarn >/dev/null 2>&1; then
        yarn "$@"
    elif command -v corepack >/dev/null 2>&1; then
        corepack yarn "$@"
    else
        printf 'Yarn or Corepack is required to create a release.\n' >&2
        return 1
    fi
}

trap cleanup_release EXIT
theme_version="$(node -p "require('./package.json').version")"
pterodactyl_version="$(tr -d '[:space:]' < "$root/.rock/upstream-version")"
source_commit="$(git rev-parse HEAD)"
run_yarn metadata:check
bash scripts/verify-release-assets.sh
assert_clean_source
bash scripts/package-release.sh "$artifact"

read -r archive_sha _ < <(sha256sum "$artifact")
archive_bytes="$(wc -c <"$artifact" | tr -d '[:space:]')"
printf '%s  panel.tar.gz\n' "$archive_sha" >"$checksum"

if [ -L "$root/release" ]; then
    printf 'Refusing to write release artifacts through a symbolic link: %s\n' "$root/release" >&2
    exit 1
fi
mkdir -p "$root/release"
if [ -L "$root/release/panel.tar.gz" ] || [ -L "$root/release/panel.tar.gz.sha256" ]; then
    printf 'Refusing to replace release artifacts through symbolic links.\n' >&2
    exit 1
fi
if [ -e "$root/release/panel.tar.gz" ] || [ -e "$root/release/panel.tar.gz.sha256" ]; then
    if [ ! -f "$root/release/panel.tar.gz" ] || [ ! -f "$root/release/panel.tar.gz.sha256" ]; then
        printf 'Existing release output is incomplete or not a regular file.\n' >&2
        exit 1
    fi
    if ! (cd "$root/release" && sha256sum --check --status panel.tar.gz.sha256); then
        printf 'Existing release output failed checksum verification; refusing to replace it.\n' >&2
        exit 1
    fi
    mkdir -p "$previous_release"
    cp "$root/release/panel.tar.gz" "$previous_release/panel.tar.gz"
    cp "$root/release/panel.tar.gz.sha256" "$previous_release/panel.tar.gz.sha256"
    had_previous_release=true
fi
artifact_temp="$(mktemp "$root/release/.panel.tar.gz.tmp.XXXXXX")"
checksum_temp="$(mktemp "$root/release/.panel.tar.gz.sha256.tmp.XXXXXX")"
cp "$artifact" "$artifact_temp"
cp "$checksum" "$checksum_temp"
publication_started=true
mv -f -- "$artifact_temp" "$root/release/panel.tar.gz"
artifact_temp=''
mv -f -- "$checksum_temp" "$root/release/panel.tar.gz.sha256"
checksum_temp=''
if ! (cd "$root/release" && sha256sum --check --status panel.tar.gz.sha256); then
    printf 'Published release output failed final checksum verification.\n' >&2
    exit 1
fi
final_archive_sha="$(sha256sum "$root/release/panel.tar.gz")"
final_archive_sha="${final_archive_sha%% *}"
if [ "$final_archive_sha" != "$archive_sha" ]; then
    printf 'Published release output differs from the verified package.\n' >&2
    exit 1
fi
tar -tzf "$root/release/panel.tar.gz" >/dev/null
publication_complete=true

finished_at="$(date +%s)"
printf 'Rock Theme release created in %s seconds.\n' "$((finished_at - started_at))"
printf '  Theme:    %s\n' "$theme_version"
printf '  Base:     %s\n' "$pterodactyl_version"
printf '  Source:   %s\n' "$source_commit"
printf '  SHA-256:  %s\n' "$archive_sha"
printf '  Size:     %s bytes\n' "$archive_bytes"
printf '  Artifact: %s\n' "$root/release/panel.tar.gz"
