#!/usr/bin/env bash

set -Eeuo pipefail

RED='\033[0;31m'
CRIMSON='\033[38;2;201;79;89m'
GRAY='\033[0;90m'
WHITE='\033[1;37m'
NC='\033[0m'

PANEL_DIR="${PANEL_DIR:-/var/www/pterodactyl}"
BACKUP_ROOT="${ROCK_BACKUP_ROOT:-/var/backups/rock-theme}"
RELEASE_BASE='https://github.com/devrock07/Rock-Theme/releases/latest/download'
RELEASE_API='https://api.github.com/repos/devrock07/Rock-Theme/releases/latest'
TEMP_DIR=''
PANEL_WAS_DOWN=false

banner() {
    echo -e "${CRIMSON}"
    echo '================================================================================'
    echo '                      ROCK THEME - PANEL MANAGER'
    echo '================================================================================'
    echo -e "${NC}"
}

fail() {
    echo -e "${RED}[ERROR] $*${NC}" >&2
    exit 1
}

cleanup() {
    local status=$?
    set +e

    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        case "$TEMP_DIR" in
            "${TMPDIR:-/tmp}"/rock-theme.*) rm -rf -- "$TEMP_DIR" ;;
        esac
    fi

    if [ "$PANEL_WAS_DOWN" = true ] && [ -f "$PANEL_DIR/artisan" ]; then
        (cd "$PANEL_DIR" && php artisan up >/dev/null 2>&1) || true
        echo -e "${GRAY}[RECOVERY] The panel was brought back online after an interrupted operation.${NC}" >&2
    fi

    return "$status"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

require_command() {
    command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

preflight() {
    [ "$(id -u)" -eq 0 ] || fail 'Run this manager as root or with sudo.'

    case "$PANEL_DIR" in
        ''|'/'|'/var'|'/var/www') fail "Unsafe PANEL_DIR: $PANEL_DIR" ;;
    esac

    [ -d "$PANEL_DIR" ] || fail "Panel directory not found: $PANEL_DIR"
    [ -f "$PANEL_DIR/artisan" ] || fail "No Pterodactyl installation found in: $PANEL_DIR"

    require_command curl
    require_command tar
    require_command sha256sum
    require_command php
    require_command composer
    mkdir -p "$BACKUP_ROOT"
}

web_user() {
    for candidate in www-data nginx apache; do
        if id "$candidate" >/dev/null 2>&1; then
            echo "$candidate"
            return
        fi
    done

    fail 'Unable to detect the web-server user (www-data, nginx, or apache).'
}

latest_tag() {
    curl --fail --location --silent --show-error "$RELEASE_API" |
        php -r '$data = json_decode(stream_get_contents(STDIN), true); if (!isset($data["tag_name"])) { exit(1); } echo $data["tag_name"];'
}

prepare_release() {
    TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/rock-theme.XXXXXX")"
    echo -e "${GRAY}Downloading the release archive and checksum...${NC}"
    curl --fail --location --silent --show-error "$RELEASE_BASE/panel.tar.gz" --output "$TEMP_DIR/panel.tar.gz"
    curl --fail --location --silent --show-error "$RELEASE_BASE/panel.tar.gz.sha256" --output "$TEMP_DIR/panel.tar.gz.sha256"

    (
        cd "$TEMP_DIR"
        sha256sum --check --status panel.tar.gz.sha256
    ) || fail 'Release checksum verification failed. No panel files were changed.'

    tar -tzf "$TEMP_DIR/panel.tar.gz" >/dev/null || fail 'The downloaded release is not a valid gzip archive.'
    echo -e "${CRIMSON}[VERIFIED] Release checksum and archive structure are valid.${NC}"
}

backup_panel() {
    local label="$1"
    local target="$BACKUP_ROOT/${label}-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
    echo -e "${GRAY}Creating safety backup: $target${NC}"
    tar -C "$PANEL_DIR" -czf "$target" .
    echo "$target"
}

backup_original_panel() {
    local target="$BACKUP_ROOT/original-panel.tar.gz"

    if [ -f "$target" ] || [ -d "$PANEL_DIR/.rock" ]; then
        backup_panel 'before-install' >/dev/null
        return
    fi

    echo -e "${GRAY}Saving the original panel for the restore option: $target${NC}"
    tar -C "$PANEL_DIR" -czf "$target" .
}

put_panel_down() {
    (cd "$PANEL_DIR" && php artisan down) || true
    PANEL_WAS_DOWN=true
}

bring_panel_up() {
    (cd "$PANEL_DIR" && php artisan up)
    PANEL_WAS_DOWN=false
}

apply_release() {
    local owner
    owner="$(web_user)"

    tar -xzf "$TEMP_DIR/panel.tar.gz" -C "$PANEL_DIR"
    (
        cd "$PANEL_DIR"
        composer install --no-dev --optimize-autoloader --no-interaction
        php artisan migrate --seed --force
        php artisan optimize:clear
        php artisan queue:restart || true
    )

    chown -R "$owner:$owner" "$PANEL_DIR"
    find "$PANEL_DIR/storage" "$PANEL_DIR/bootstrap/cache" -type d -exec chmod 755 {} +
    find "$PANEL_DIR/storage" "$PANEL_DIR/bootstrap/cache" -type f -exec chmod 644 {} +
}

install_theme() {
    banner
    preflight
    local release
    release="$(latest_tag)" || fail 'Unable to resolve the latest Rock Theme release.'
    echo -e "${WHITE}Installing Rock Theme ${release}.${NC}"

    prepare_release
    backup_original_panel
    put_panel_down
    apply_release
    bring_panel_up

    echo -e "${CRIMSON}[SUCCESS] Rock Theme ${release} is installed.${NC}"
}

update_theme() {
    banner
    preflight
    local release
    release="$(latest_tag)" || fail 'Unable to resolve the latest Rock Theme release.'
    echo -e "${WHITE}Updating to Rock Theme ${release}.${NC}"

    prepare_release
    backup_panel 'before-update' >/dev/null
    put_panel_down
    apply_release
    bring_panel_up

    echo -e "${CRIMSON}[SUCCESS] Rock Theme ${release} is installed.${NC}"
}

restore_original() {
    banner
    preflight
    local original="$BACKUP_ROOT/original-panel.tar.gz"
    local owner
    owner="$(web_user)"

    [ -f "$original" ] || fail "No manager-created pre-theme backup exists at $original. Restore your own backup instead."
    tar -tzf "$original" >/dev/null || fail 'The pre-theme backup is not a valid gzip archive.'
    backup_panel 'before-restore' >/dev/null
    put_panel_down

    echo -e "${GRAY}Restoring the original panel files while preserving the current .env and storage directory...${NC}"
    find "$PANEL_DIR" -mindepth 1 -maxdepth 1 ! -name '.env' ! -name 'storage' -exec rm -rf -- {} +
    tar -xzf "$original" --exclude='./.env' --exclude='./storage' -C "$PANEL_DIR"

    (
        cd "$PANEL_DIR"
        composer install --no-dev --optimize-autoloader --no-interaction
        php artisan optimize:clear
        php artisan queue:restart || true
    )
    chown -R "$owner:$owner" "$PANEL_DIR"
    bring_panel_up

    echo -e "${CRIMSON}[SUCCESS] The pre-theme panel files were restored. Database migrations were intentionally left intact.${NC}"
}

show_menu() {
    banner
    preflight
    echo -e "${WHITE}Select an action:${NC}"
    echo -e "  ${CRIMSON}[1]${NC} Install latest Rock Theme"
    echo -e "  ${CRIMSON}[2]${NC} Update to the latest Rock Theme"
    echo -e "  ${CRIMSON}[3]${NC} Restore manager-created pre-theme backup"
    echo -e "  ${CRIMSON}[4]${NC} Exit"
    read -r -p 'Enter choice [1-4]: ' choice

    case "$choice" in
        1) install_theme ;;
        2) update_theme ;;
        3) restore_original ;;
        4) exit 0 ;;
        *) fail 'Invalid option.' ;;
    esac
}

case "${1:-}" in
    install|--install) install_theme ;;
    update|--update) update_theme ;;
    restore|--restore|remove|--remove) restore_original ;;
    '') show_menu ;;
    *) fail 'Usage: install.sh [install|update|restore]' ;;
esac
