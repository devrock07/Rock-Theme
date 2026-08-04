#!/usr/bin/env bash

# ==============================================================================
# Rock Theme - Universal Panel Manager & Installer Script
# ==============================================================================

set -euo pipefail

# ANSI Crimson / Red Theme Palette (No Emojis)
RED='\033[0;31m'
DARK_RED='\033[1;31m'
CRIMSON='\033[38;2;201;79;89m'
GRAY='\033[0;90m'
WHITE='\033[1;37m'
NC='\033[0m'

PANEL_DIR="${PANEL_DIR:-/var/www/pterodactyl}"
REPO_URL="https://github.com/devrock07/Rock-Theme"
LATEST_RELEASE_URL="https://github.com/devrock07/Rock-Theme/releases/latest/download/panel.tar.gz"
GITHUB_API_URL="https://api.github.com/repos/devrock07/Rock-Theme/releases/latest"

banner() {
    echo -e "${CRIMSON}"
    echo "================================================================================"
    echo "                      ROCK THEME - PANEL MANAGER                                "
    echo "================================================================================"
    echo -e "${NC}"
}

check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        echo -e "${RED}[ERROR] This script must be run as root (or with sudo).${NC}" >&2
        exit 1
    fi
}

check_directory() {
    if [ ! -d "$PANEL_DIR" ]; then
        echo -e "${RED}[ERROR] Panel directory not found at $PANEL_DIR${NC}" >&2
        exit 1
    fi
    cd "$PANEL_DIR"
}

get_web_user() {
    if id "www-data" &>/dev/null; then
        echo "www-data"
    elif id "nginx" &>/dev/null; then
        echo "nginx"
    elif id "apache" &>/dev/null; then
        echo "apache"
    else
        echo "www-data"
    fi
}

install_theme() {
    banner
    echo -e "${CRIMSON}[+] Starting Rock Theme Installation...${NC}"
    check_directory

    WEB_USER="$(get_web_user)"

    echo -e "${GRAY}[1/7] Putting panel into maintenance mode...${NC}"
    php artisan down || true

    echo -e "${GRAY}[2/7] Backing up environment configuration...${NC}"
    if [ -f ".env" ]; then
        cp .env .env.rock-backup."$(date +%s)"
    fi

    echo -e "${GRAY}[3/7] Downloading latest Rock Theme release tarball...${NC}"
    curl -sSL "$LATEST_RELEASE_URL" | tar -xz

    echo -e "${GRAY}[4/7] Installing PHP dependencies and running migrations...${NC}"
    composer install --no-dev --optimize-autoloader --no-interaction
    php artisan migrate --seed --force

    echo -e "${GRAY}[5/7] Clearing application view and configuration caches...${NC}"
    php artisan view:clear
    php artisan config:clear
    php artisan route:clear
    php artisan queue:restart || true

    echo -e "${GRAY}[6/7] Setting file permissions...${NC}"
    chown -R "$WEB_USER:$WEB_USER" "$PANEL_DIR"
    chmod -R 755 storage bootstrap/cache

    echo -e "${GRAY}[7/7] Bringing panel back online...${NC}"
    php artisan up

    echo -e "${CRIMSON}[SUCCESS] Rock Theme installed successfully!${NC}"
}

update_theme() {
    banner
    echo -e "${CRIMSON}[+] Checking for Rock Theme updates...${NC}"
    check_directory

    WEB_USER="$(get_web_user)"
    
    LATEST_TAG="$(curl -sSL "$GITHUB_API_URL" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "latest")"
    echo -e "${WHITE}Latest available release:${NC} ${LATEST_TAG}"

    echo -e "${GRAY}[1/6] Putting panel into maintenance mode...${NC}"
    php artisan down || true

    echo -e "${GRAY}[2/6] Downloading release update...${NC}"
    curl -sSL "$LATEST_RELEASE_URL" | tar -xz

    echo -e "${GRAY}[3/6] Running database migrations...${NC}"
    composer install --no-dev --optimize-autoloader --no-interaction
    php artisan migrate --force

    echo -e "${GRAY}[4/6] Flushing system caches...${NC}"
    php artisan view:clear
    php artisan config:clear
    php artisan route:clear
    php artisan queue:restart || true

    echo -e "${GRAY}[5/6] Restoring permissions for $WEB_USER...${NC}"
    chown -R "$WEB_USER:$WEB_USER" "$PANEL_DIR"
    chmod -R 755 storage bootstrap/cache

    echo -e "${GRAY}[6/6] Bringing panel back online...${NC}"
    php artisan up

    echo -e "${CRIMSON}[SUCCESS] Rock Theme updated to $LATEST_TAG successfully!${NC}"
}

remove_theme() {
    banner
    echo -e "${RED}[!] Restoring panel to default upstream Pterodactyl build...${NC}"
    check_directory

    WEB_USER="$(get_web_user)"

    echo -e "${GRAY}[1/5] Putting panel into maintenance mode...${NC}"
    php artisan down || true

    echo -e "${GRAY}[2/5] Fetching default Pterodactyl Panel core archive...${NC}"
    PTERO_TAG="$(php -r 'echo json_decode(file_get_contents("composer.json"))->version ?? "1.11.0";' 2>/dev/null || echo "1.15.0")"
    
    curl -L "https://github.com/pterodactyl/panel/releases/download/v${PTERO_TAG}/panel.tar.gz" | tar -xz || {
        echo -e "${RED}[WARN] Could not fetch exact tag v${PTERO_TAG}, falling back to release tag download.${NC}"
        curl -L "https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz" | tar -xz
    }

    echo -e "${GRAY}[3/5] Re-optimizing dependencies...${NC}"
    composer install --no-dev --optimize-autoloader --no-interaction
    php artisan view:clear
    php artisan config:clear
    php artisan route:clear
    php artisan queue:restart || true

    echo -e "${GRAY}[4/5] Resetting permissions...${NC}"
    chown -R "$WEB_USER:$WEB_USER" "$PANEL_DIR"
    chmod -R 755 storage bootstrap/cache

    echo -e "${GRAY}[5/5] Bringing panel back online...${NC}"
    php artisan up

    echo -e "${CRIMSON}[SUCCESS] Rock Theme removed and stock panel restored.${NC}"
}

show_menu() {
    check_root
    banner
    echo -e "${WHITE}Select an action to perform:${NC}"
    echo ""
    echo -e "  ${CRIMSON}[1]${NC} Install Rock Theme (Latest Release)"
    echo -e "  ${CRIMSON}[2]${NC} Update Rock Theme (Check & Upgrade)"
    echo -e "  ${CRIMSON}[3]${NC} Remove Rock Theme (Revert to Default Panel)"
    echo -e "  ${CRIMSON}[4]${NC} Exit"
    echo ""
    read -rp "Enter choice [1-4]: " choice

    case "$choice" in
        1) install_theme ;;
        2) update_theme ;;
        3) remove_theme ;;
        4) echo -e "${GRAY}Exiting.${NC}"; exit 0 ;;
        *) echo -e "${RED}[ERROR] Invalid option.${NC}"; exit 1 ;;
    esac
}

# Handle command-line arguments if passed non-interactively
if [ "${1:-}" = "--install" ] || [ "${1:-}" = "install" ]; then
    check_root
    install_theme
elif [ "${1:-}" = "--update" ] || [ "${1:-}" = "update" ]; then
    check_root
    update_theme
elif [ "${1:-}" = "--remove" ] || [ "${1:-}" = "remove" ]; then
    check_root
    remove_theme
else
    show_menu
fi
