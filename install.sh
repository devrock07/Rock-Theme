#!/usr/bin/env bash

set -Eeuo pipefail

PANEL_DIR="${PANEL_DIR:-/var/www/pterodactyl}"
BACKUP_ROOT="${ROCK_BACKUP_ROOT:-/var/backups/rock-theme}"
REPOSITORY='devrock07/Rock-Theme'
RELEASE_API="https://api.github.com/repos/${REPOSITORY}/releases/latest"

TEMP_DIR=''
PANEL_WAS_DOWN=false
ACTIVE_PID=''
BANNER_SHOWN=false
STEP_INDEX=0
STEP_TOTAL=1
ANIMATE=false
ACTION=''

RED=''
CRIMSON=''
CRIMSON_BRIGHT=''
GREEN=''
AMBER=''
GRAY=''
WHITE=''
NC=''
ICON_ACTIVE='>'
ICON_OK='OK'
ICON_FAIL='X'
ICON_INFO='i'
SPINNER_FRAMES=('|' '/' '-' '\\')

configure_terminal() {
    local charmap=''

    if [ -t 1 ] && [ "${TERM:-dumb}" != 'dumb' ]; then
        if [ -z "${NO_COLOR+x}" ]; then
            RED=$'\033[0;31m'
            CRIMSON=$'\033[38;2;201;79;89m'
            CRIMSON_BRIGHT=$'\033[38;2;240;138;144m'
            GREEN=$'\033[38;2;114;214;165m'
            AMBER=$'\033[38;2;233;185;110m'
            GRAY=$'\033[0;90m'
            WHITE=$'\033[1;37m'
            NC=$'\033[0m'
        fi

        if [ "${ROCK_NO_ANIMATION:-0}" != '1' ] && [ "${CI:-false}" != 'true' ]; then
            ANIMATE=true
        fi
    fi

    charmap="$(locale charmap 2>/dev/null || true)"
    if [[ "$charmap" =~ ^UTF-?8$ ]]; then
        ICON_ACTIVE='◆'
        ICON_OK='◆'
        ICON_FAIL='✕'
        ICON_INFO='◇'
        SPINNER_FRAMES=('◢' '◣' '◤' '◥')
    fi
}

show_cursor() {
    [ -t 1 ] && printf '\033[?25h' || true
}

hide_cursor() {
    [ -t 1 ] && printf '\033[?25l' || true
}

clear_line() {
    [ -t 1 ] && printf '\r\033[2K' || true
}

ensure_temp_dir() {
    if [ -z "$TEMP_DIR" ]; then
        TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/rock-theme.XXXXXX")"
    fi
}

fail() {
    clear_line
    show_cursor
    printf '%b%s ERROR%b  %s\n' "$RED" "$ICON_FAIL" "$NC" "$*" >&2
    exit 1
}

cleanup() {
    local status=$?
    set +e

    if [ -n "$ACTIVE_PID" ] && kill -0 "$ACTIVE_PID" >/dev/null 2>&1; then
        kill -TERM "$ACTIVE_PID" >/dev/null 2>&1 || true
        wait "$ACTIVE_PID" >/dev/null 2>&1 || true
    fi
    ACTIVE_PID=''
    clear_line
    show_cursor

    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        case "$TEMP_DIR" in
            "${TMPDIR:-/tmp}"/rock-theme.*) rm -rf -- "$TEMP_DIR" ;;
        esac
    fi

    if [ "$PANEL_WAS_DOWN" = true ] && [ -f "$PANEL_DIR/artisan" ]; then
        (cd "$PANEL_DIR" && php artisan up >/dev/null 2>&1) || true
        printf '%b%s RECOVERY%b  Panel returned online after an interrupted operation.\n' "$AMBER" "$ICON_INFO" "$NC" >&2
    fi

    return "$status"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

boot_sequence() {
    [ "$ANIMATE" = true ] || return 0

    local message
    for message in 'LINKING PANEL CORE' 'LOADING CRIMSON SYSTEM' 'ROCK-CHAN ONLINE'; do
        printf '\r\033[2K  %b%s%b  %s' "$CRIMSON" "$ICON_ACTIVE" "$NC" "$message"
        sleep 0.14
    done
    clear_line
}

banner() {
    [ "$BANNER_SHOWN" = false ] || return 0
    BANNER_SHOWN=true

    printf '\n%b' "$CRIMSON"
    printf '       ____  ____  ________ __   ________  __________  ______\n'
    printf '      / __ \\/ __ \\/ ____/ //_/  /_  __/ / / / ____/  |/  / ____/\n'
    printf '     / /_/ / / / / /   / ,<      / / / /_/ / __/ / /|_/ / __/   \n'
    printf '    / _, _/ /_/ / /___/ /| |    / / / __  / /___/ /  / / /___   \n'
    printf '   /_/ |_|\\____/\\____/_/ |_|   /_/ /_/ /_/_____/_/  /_/_____/   \n'
    printf '%b\n' "$NC"
    printf '%b          .-""""-.%b\n' "$CRIMSON_BRIGHT" "$NC"
    printf '%b         / /|  |\\ \\%b      %bROCK-CHAN // PANEL UNIT%b\n' "$CRIMSON_BRIGHT" "$NC" "$WHITE" "$NC"
    printf '%b        |  (o)(o)  |%b      %bverified deploy system%b\n' "$CRIMSON_BRIGHT" "$NC" "$GRAY" "$NC"
    printf '%b        |     ^    |%b\n' "$CRIMSON_BRIGHT" "$NC"
    printf '%b        |   \\___/  |%b      %bgithub.com/%s%b\n' "$CRIMSON_BRIGHT" "$NC" "$GRAY" "$REPOSITORY" "$NC"
    printf '%b         \\   ---  /%b\n' "$CRIMSON_BRIGHT" "$NC"
    printf '%b          `-.__.-`%b\n\n' "$CRIMSON_BRIGHT" "$NC"
    boot_sequence
}

run_step() {
    local label="$1"
    shift

    ensure_temp_dir
    STEP_INDEX=$((STEP_INDEX + 1))

    local log_file="$TEMP_DIR/step-${STEP_INDEX}.log"
    local started=$SECONDS
    local elapsed=0
    local status=0
    local tick=0
    local frame=''

    if [ "$ANIMATE" = true ] && [ "${ROCK_VERBOSE:-0}" != '1' ]; then
        "$@" >"$log_file" 2>&1 &
        ACTIVE_PID=$!
        hide_cursor

        while kill -0 "$ACTIVE_PID" >/dev/null 2>&1; do
            elapsed=$((SECONDS - started))
            frame="${SPINNER_FRAMES[$((tick % ${#SPINNER_FRAMES[@]}))]}"
            printf '\r\033[2K  %b%s%b %b[%02d/%02d]%b %-42s %b%02ds%b' \
                "$CRIMSON" "$frame" "$NC" "$GRAY" "$STEP_INDEX" "$STEP_TOTAL" "$NC" "$label" "$GRAY" "$elapsed" "$NC"
            tick=$((tick + 1))
            sleep 0.12
        done

        wait "$ACTIVE_PID" || status=$?
        ACTIVE_PID=''
        clear_line
        show_cursor
    else
        printf '  %b%s%b %b[%02d/%02d]%b %s\n' "$CRIMSON" "$ICON_ACTIVE" "$NC" "$GRAY" "$STEP_INDEX" "$STEP_TOTAL" "$NC" "$label"
        "$@" || status=$?
    fi

    elapsed=$((SECONDS - started))
    if [ "$status" -ne 0 ]; then
        printf '  %b%s FAIL%b %s %b(%ss)%b\n' "$RED" "$ICON_FAIL" "$NC" "$label" "$GRAY" "$elapsed" "$NC" >&2
        if [ -s "$log_file" ]; then
            printf '\n%b--- last installer output ---%b\n' "$GRAY" "$NC" >&2
            tail -n 80 "$log_file" >&2
            printf '%b-----------------------------%b\n\n' "$GRAY" "$NC" >&2
        fi
        fail "$label failed with exit code $status."
    fi

    if [ "${ROCK_VERBOSE:-0}" = '1' ] || [ "$ANIMATE" != true ]; then
        printf '  %b%s DONE%b %s %b(%ss)%b\n' "$GREEN" "$ICON_OK" "$NC" "$label" "$GRAY" "$elapsed" "$NC"
    else
        printf '  %b%s%b %b[%02d/%02d]%b %-42s %b%02ds%b\n' \
            "$GREEN" "$ICON_OK" "$NC" "$GRAY" "$STEP_INDEX" "$STEP_TOTAL" "$NC" "$label" "$GRAY" "$elapsed" "$NC"
    fi
}

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        printf 'Required command not found: %s\n' "$1" >&2
        return 1
    fi
}

preflight_checks() {
    [ "$(id -u)" -eq 0 ] || {
        printf 'Run this manager as root or with sudo.\n' >&2
        return 1
    }

    case "$PANEL_DIR" in
        ''|'/'|'/var'|'/var/www')
            printf 'Unsafe PANEL_DIR: %s\n' "$PANEL_DIR" >&2
            return 1
            ;;
    esac

    [ -d "$PANEL_DIR" ] || {
        printf 'Panel directory not found: %s\n' "$PANEL_DIR" >&2
        return 1
    }
    [ -f "$PANEL_DIR/artisan" ] || {
        printf 'No Pterodactyl installation found in: %s\n' "$PANEL_DIR" >&2
        return 1
    }

    require_command curl
    require_command tar
    require_command sha256sum
    require_command grep
    require_command php
    require_command composer
    mkdir -p "$BACKUP_ROOT"
}

web_user() {
    local candidate
    for candidate in www-data nginx apache; do
        if id "$candidate" >/dev/null 2>&1; then
            printf '%s' "$candidate"
            return 0
        fi
    done

    return 1
}

resolve_latest_release() {
    curl --fail --location --silent --show-error "$RELEASE_API" |
        php -r '$data = json_decode(stream_get_contents(STDIN), true); if (!isset($data["tag_name"])) { exit(1); } echo $data["tag_name"];' \
            >"$TEMP_DIR/latest-tag"
    [ -s "$TEMP_DIR/latest-tag" ]
    grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$' "$TEMP_DIR/latest-tag"
}

download_release() {
    local release="$1"
    local release_base="https://github.com/${REPOSITORY}/releases/download/${release}"

    curl --fail --location --silent --show-error "$release_base/panel.tar.gz" --output "$TEMP_DIR/panel.tar.gz"
    curl --fail --location --silent --show-error "$release_base/panel.tar.gz.sha256" --output "$TEMP_DIR/panel.tar.gz.sha256"
}

verify_release_checksum() {
    (
        cd "$TEMP_DIR"
        sha256sum --check --status panel.tar.gz.sha256
    )
}

validate_release_archive() {
    tar -tzf "$TEMP_DIR/panel.tar.gz" >"$TEMP_DIR/archive-list"
    if grep -Eq '(^|/)\.\.(/|$)|^/' "$TEMP_DIR/archive-list"; then
        printf 'The release archive contains an unsafe path.\n' >&2
        return 1
    fi
    grep -Eq '^\./artisan$|^artisan$' "$TEMP_DIR/archive-list"
}

backup_panel_to() {
    local target="$1"
    tar -C "$PANEL_DIR" -czf "$target" .
}

backup_original_panel() {
    local original="$BACKUP_ROOT/original-panel.tar.gz"
    local target=''

    if [ -f "$original" ] || [ -d "$PANEL_DIR/.rock" ]; then
        target="$BACKUP_ROOT/before-install-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
    else
        target="$original"
    fi

    backup_panel_to "$target"
}

artisan_command() {
    (
        cd "$PANEL_DIR"
        php artisan "$@"
    )
}

composer_install() {
    (
        cd "$PANEL_DIR"
        composer install --no-dev --optimize-autoloader --no-interaction
    )
}

extract_release() {
    tar -xzf "$TEMP_DIR/panel.tar.gz" -C "$PANEL_DIR"
}

restart_queue() {
    artisan_command queue:restart || true
}

set_panel_permissions() {
    local owner="$1"
    chown -R "$owner:$owner" "$PANEL_DIR"
    find "$PANEL_DIR/storage" "$PANEL_DIR/bootstrap/cache" -type d -exec chmod 755 {} +
    find "$PANEL_DIR/storage" "$PANEL_DIR/bootstrap/cache" -type f -exec chmod 644 {} +
}

enter_maintenance() {
    PANEL_WAS_DOWN=true
    run_step 'Entering maintenance mode' artisan_command down
}

leave_maintenance() {
    run_step 'Bringing the panel online' artisan_command up
    PANEL_WAS_DOWN=false
}

print_operation() {
    local action="$1"
    local release="$2"

    printf '\n%b  %s%b\n' "$WHITE" "$action" "$NC"
    printf '  %bTARGET%b   %s\n' "$GRAY" "$NC" "$PANEL_DIR"
    if [ -n "$release" ]; then
        printf '  %bRELEASE%b  %s\n' "$GRAY" "$NC" "$release"
    fi
    printf '  %bBACKUPS%b  %s\n\n' "$GRAY" "$NC" "$BACKUP_ROOT"
}

print_success() {
    local message="$1"

    printf '\n%b' "$CRIMSON"
    printf '  +--------------------------------------------------------------+\n'
    printf '  |  %b%s DEPLOYMENT COMPLETE%b                                   |\n' "$GREEN" "$ICON_OK" "$CRIMSON"
    printf '  |  %b%-58s%b  |\n' "$WHITE" "$message" "$CRIMSON"
    printf '  +--------------------------------------------------------------+\n'
    printf '%b\n' "$NC"
}

install_or_update() {
    local mode="$1"
    local release=''
    local owner=''
    local backup_target=''

    banner
    STEP_INDEX=0
    STEP_TOTAL=14

    run_step 'Running safety preflight' preflight_checks
    owner="$(web_user)" || fail 'Unable to detect the web-server user (www-data, nginx, or apache).'
    run_step 'Resolving the latest release' resolve_latest_release
    release="$(<"$TEMP_DIR/latest-tag")"
    print_operation "${mode^^} ROCK THEME" "$release"
    run_step 'Downloading release and checksum' download_release "$release"
    run_step 'Verifying SHA-256 signature' verify_release_checksum
    run_step 'Inspecting release archive' validate_release_archive

    if [ "$mode" = 'install' ]; then
        run_step 'Saving a rollback snapshot' backup_original_panel
    else
        backup_target="$BACKUP_ROOT/before-update-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
        run_step 'Saving a rollback snapshot' backup_panel_to "$backup_target"
    fi

    enter_maintenance
    run_step 'Extracting Rock Theme files' extract_release
    run_step 'Installing PHP dependencies' composer_install
    run_step 'Applying database migrations' artisan_command migrate --seed --force
    run_step 'Clearing optimized caches' artisan_command optimize:clear
    run_step 'Restarting background workers' restart_queue
    run_step 'Repairing file permissions' set_panel_permissions "$owner"
    leave_maintenance

    print_success "Rock Theme ${release} is installed and online."
}

remove_current_panel_files() {
    find "$PANEL_DIR" -mindepth 1 -maxdepth 1 ! -name '.env' ! -name 'storage' -exec rm -rf -- {} +
}

extract_original_backup() {
    local original="$1"
    tar -xzf "$original" --exclude='./.env' --exclude='./storage' -C "$PANEL_DIR"
}

validate_original_backup() {
    local original="$1"
    tar -tzf "$original" >/dev/null
}

restore_original() {
    local original="$BACKUP_ROOT/original-panel.tar.gz"
    local before_restore="$BACKUP_ROOT/before-restore-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
    local owner=''

    banner
    STEP_INDEX=0
    STEP_TOTAL=11

    run_step 'Running safety preflight' preflight_checks
    owner="$(web_user)" || fail 'Unable to detect the web-server user (www-data, nginx, or apache).'
    [ -f "$original" ] || fail "No manager-created pre-theme backup exists at $original."
    print_operation 'RESTORE ORIGINAL PANEL' ''
    run_step 'Validating the original backup' validate_original_backup "$original"
    run_step 'Backing up the current panel' backup_panel_to "$before_restore"
    enter_maintenance
    run_step 'Preserving environment and storage' remove_current_panel_files
    run_step 'Restoring original panel files' extract_original_backup "$original"
    run_step 'Installing PHP dependencies' composer_install
    run_step 'Clearing optimized caches' artisan_command optimize:clear
    run_step 'Restarting background workers' restart_queue
    run_step 'Repairing file permissions' set_panel_permissions "$owner"
    leave_maintenance

    print_success 'Original panel restored; database changes were preserved.'
}

show_menu() {
    banner
    printf '%b  SELECT OPERATION%b\n' "$WHITE" "$NC"
    printf '  %b[1]%b  Install the latest verified release\n' "$CRIMSON" "$NC"
    printf '  %b[2]%b  Update and create a rollback snapshot\n' "$CRIMSON" "$NC"
    printf '  %b[3]%b  Restore the manager-created original backup\n' "$CRIMSON" "$NC"
    printf '  %b[4]%b  Exit\n\n' "$CRIMSON" "$NC"
    printf '  %b>%b ' "$CRIMSON" "$NC"
    read -r choice

    case "$choice" in
        1) install_or_update install ;;
        2) install_or_update update ;;
        3) restore_original ;;
        4) exit 0 ;;
        *) fail 'Invalid option. Choose 1, 2, 3, or 4.' ;;
    esac
}

usage() {
    cat <<'EOF'
Rock Theme installer

Usage:
  install.sh [install|update|restore] [--no-animation] [--verbose]

Options:
  --no-animation   Disable animated terminal output.
  --verbose        Stream full command output instead of the progress renderer.
  -h, --help       Show this help message.

Environment:
  PANEL_DIR=/var/www/pterodactyl
  ROCK_BACKUP_ROOT=/var/backups/rock-theme
  ROCK_NO_ANIMATION=1
  ROCK_VERBOSE=1
  NO_COLOR=1
EOF
}

parse_arguments() {
    while [ "$#" -gt 0 ]; do
        case "$1" in
            install|--install) ACTION='install' ;;
            update|--update) ACTION='update' ;;
            restore|--restore|remove|--remove) ACTION='restore' ;;
            --no-animation) ROCK_NO_ANIMATION=1 ;;
            --verbose) ROCK_VERBOSE=1 ;;
            -h|--help) ACTION='help' ;;
            *)
                printf 'Unknown argument: %s\n\n' "$1" >&2
                usage >&2
                exit 2
                ;;
        esac
        shift
    done
}

parse_arguments "$@"
configure_terminal

case "$ACTION" in
    install) install_or_update install ;;
    update) install_or_update update ;;
    restore) restore_original ;;
    help) usage ;;
    '') show_menu ;;
esac
