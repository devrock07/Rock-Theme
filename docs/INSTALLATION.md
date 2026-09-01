# Installation

Rock Theme `v2.0.3` is a complete Pterodactyl Panel distribution based on
Pterodactyl `v1.15.1`. Install it over a working panel on that same base
version. It is not a plugin that can be added to an arbitrary Pterodactyl
release.

## Before you begin

Confirm all of the following:

-   The existing panel is Pterodactyl `1.15.1` and is working before the change.
-   You have root or `sudo` access to the panel host.
-   `curl`, `tar`, `sha256sum`, PHP, and Composer are installed.
-   The host is using PHP `8.2` or `8.3` with the normal Pterodactyl extensions.
-   The Pterodactyl queue worker and one-minute scheduler are already configured.
-   You have enough free space for at least one complete panel-file snapshot.
-   You have a recent, tested database backup and a separate copy of `.env`.

The installer backs up panel files. It does **not** export the panel database or
validate your external backup system.

## Recommended: installation manager

Download the manager so it can be reviewed before execution:

```bash
curl -fsSL https://raw.githubusercontent.com/devrock07/Rock-Theme/main/install.sh \
  -o /tmp/rock-theme-install.sh
less /tmp/rock-theme-install.sh
sudo bash /tmp/rock-theme-install.sh install
```

Omit `install` to use the interactive menu:

```bash
sudo bash /tmp/rock-theme-install.sh
```

### Manager operations

| Operation | Command                                        | Behavior                                                                                             |
| --------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Install   | `sudo bash /tmp/rock-theme-install.sh install` | Saves the first manager-created original snapshot, then installs the latest verified release         |
| Update    | `sudo bash /tmp/rock-theme-install.sh update`  | Creates a timestamped pre-update file snapshot, then installs the latest verified release            |
| Restore   | `sudo bash /tmp/rock-theme-install.sh restore` | Restores the original pre-theme snapshot while preserving the current `.env` and `storage` directory |

`restore` also preserves database changes. It does not reverse Rock Theme
migrations. Keep the independent database backup created before installation
if a full point-in-time rollback may be required.

### What the manager verifies

Before maintenance mode begins, the manager:

1. validates the requested panel path;
2. checks required commands and detects `www-data`, `nginx`, or `apache` as the
   web-server account;
3. resolves the latest GitHub release;
4. downloads `panel.tar.gz` and `panel.tar.gz.sha256`;
5. verifies the SHA-256 checksum; and
6. rejects archives containing absolute paths or parent-directory traversal.

It then creates the snapshot, enables maintenance mode, extracts the release,
runs Composer and database migrations, clears optimized caches, restarts the
queue, repairs ownership and writable-directory permissions, and brings the
panel online. If the process is interrupted after maintenance mode starts, an
exit guard attempts to run `php artisan up`.

### Custom paths and output

The defaults are:

```text
PANEL_DIR=/var/www/pterodactyl
ROCK_BACKUP_ROOT=/var/backups/rock-theme
```

Pass alternatives as environment variables:

```bash
sudo env \
  PANEL_DIR=/srv/pterodactyl \
  ROCK_BACKUP_ROOT=/srv/backups/rock-theme \
  bash /tmp/rock-theme-install.sh install
```

For automation or detailed diagnosis:

```bash
sudo bash /tmp/rock-theme-install.sh update --no-animation
sudo bash /tmp/rock-theme-install.sh update --verbose
sudo env NO_COLOR=1 bash /tmp/rock-theme-install.sh update
```

`--verbose` streams command output. Without it, a failed stage prints the last
80 lines captured for that stage.

## Manual installation

Use this method when the manager cannot detect the correct web-server user or
when the deployment is controlled by an existing release process.

The examples assume:

```text
Panel path: /var/www/pterodactyl
Web user:   www-data
Database:   panel
DB user:    pterodactyl
```

Replace those values for your installation.

### 1. Back up the current installation

Run from a root shell so the backup destinations are writable:

```bash
tar -C /var/www/pterodactyl \
  -czf /root/pterodactyl-files-before-rock-theme.tar.gz .
cp /var/www/pterodactyl/.env /root/pterodactyl-env-before-rock-theme
mariadb-dump -u pterodactyl -p panel \
  > /root/pterodactyl-db-before-rock-theme.sql
```

Use `mysqldump` instead of `mariadb-dump` when appropriate. Store the resulting
files outside the panel directory and test that both archives can be read.

### 2. Download and verify the release

Do not pipe an unverified HTTP response directly into `tar`.

```bash
rock_download_dir="$(mktemp -d)"
cd "$rock_download_dir"

curl -fL -O \
  https://github.com/devrock07/Rock-Theme/releases/latest/download/panel.tar.gz
curl -fL -O \
  https://github.com/devrock07/Rock-Theme/releases/latest/download/panel.tar.gz.sha256

sha256sum --check panel.tar.gz.sha256
tar -tzf panel.tar.gz > archive-list.txt

if grep -Eq '(^/|(^|/)\.\.(/|$))' archive-list.txt; then
  echo 'Unsafe path found in archive.' >&2
  exit 1
fi

grep -Fxq './artisan' archive-list.txt
grep -Fxq './composer.json' archive-list.txt
```

Continue only when the checksum reports `panel.tar.gz: OK`, both required
files are found, and the path check succeeds.

### 3. Deploy the archive

```bash
(
set -euo pipefail
cd /var/www/pterodactyl

php artisan down
trap 'php artisan up' EXIT
tar -xzf "$rock_download_dir/panel.tar.gz" -C /var/www/pterodactyl
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --seed --force
php artisan optimize:clear
php artisan queue:restart

chown -R www-data:www-data /var/www/pterodactyl
find storage bootstrap/cache -type d -exec chmod 755 {} +
find storage bootstrap/cache -type f -exec chmod 644 {} +

php artisan up
trap - EXIT
)
```

The guarded subshell returns the panel online if a deployment command fails.
Fix the reported error before retrying, and verify `php artisan up` succeeded
before ending the maintenance window.

## Post-install verification

From the panel directory:

```bash
php artisan p:info
php artisan migrate:status
php artisan schedule:list
```

Then verify the following in a private browser window and a normal signed-in
session:

-   the login page loads without missing assets;
-   the client dashboard works at desktop and mobile widths;
-   **Admin → Settings** saves and reloads Rock Theme values;
-   a server's console, files, backups, databases, schedules, and startup pages
    still perform their normal actions;
-   the worker is processing jobs;
-   `/status` returns the configured public status page when enabled; and
-   the browser console and `storage/logs/laravel-*.log` contain no new errors.

Finish by opening the [configuration guide](./CONFIGURATION.md). For deployment
problems, use the [troubleshooting guide](./TROUBLESHOOTING.md).
