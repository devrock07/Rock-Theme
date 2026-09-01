# Troubleshooting

Start with the panel host, application logs, and the browser's developer tools.
Avoid posting `.env`, database credentials, API tokens, cookies, authorization
headers, or unredacted user data in an issue.

## Baseline diagnostics

Run these commands from the panel directory:

```bash
php artisan p:info
php artisan migrate:status
php artisan schedule:list
php artisan queue:failed
php artisan about
```

Also capture:

-   the installed Rock Theme and Pterodactyl versions;
-   the operating system, PHP version, and web-server account;
-   the affected URL and approximate time of failure;
-   the browser, viewport size, and whether the problem occurs in a private window;
-   relevant entries from `storage/logs/laravel-*.log`; and
-   failed requests and JavaScript errors from the browser Network and Console tabs.

## Installer cannot download the release

### `gzip: stdin: not in gzip format`

This usually means an HTTP error response was piped into `tar`. Download the
files separately with `curl --fail`, then verify them:

```bash
curl -fL -O https://github.com/devrock07/Rock-Theme/releases/latest/download/panel.tar.gz
curl -fL -O https://github.com/devrock07/Rock-Theme/releases/latest/download/panel.tar.gz.sha256
sha256sum --check panel.tar.gz.sha256
tar -tzf panel.tar.gz >/dev/null
```

If `curl` reports 404, confirm that a non-draft release exists and contains both
assets at the [latest release](https://github.com/devrock07/Rock-Theme/releases/latest).

### Checksum verification fails

Do not extract the archive. Remove both downloaded files and download them
again from the same release. A checksum file from one tag cannot validate an
archive from another.

### The manager cannot detect a web-server user

The manager recognizes `www-data`, `nginx`, and `apache`. A custom service
account requires the manual deployment procedure in
[Installation](./INSTALLATION.md), with ownership set to the account used by
PHP-FPM and the web server.

### Composer fails or is killed

Run the manager with `--verbose` to expose the complete Composer error:

```bash
sudo bash /tmp/rock-theme-install.sh update --verbose
```

Check PHP version and extensions, Composer 2 availability, free disk space,
memory, DNS, and access to Packagist. Do not repeatedly extract new archives
over a partially repaired installation; first determine whether source and
migrations are already aligned.

## The panel remains in maintenance mode

The manager attempts recovery automatically, but maintenance state should be
confirmed after an interrupted shell or host restart:

```bash
cd /var/www/pterodactyl
php artisan optimize:clear
php artisan up
```

If the panel then returns HTTP 500, review the Laravel log before changing more
files.

## Blank page, render error, or stale colors

These symptoms commonly indicate that PHP source and compiled frontend assets
come from different releases, or that a browser/CDN still serves an old hashed
bundle.

1. Confirm the release archive contained `public/assets/manifest.json` and
   compiled files under `public/assets/`.
2. Run:

    ```bash
    cd /var/www/pterodactyl
    php artisan optimize:clear
    php artisan queue:restart
    ```

3. Purge any reverse-proxy or CDN cache for HTML and `/assets/*`.
4. Test in a private window with browser extensions disabled.
5. In the Network tab, look for 404/500 responses for JavaScript, CSS, API, or
   chunk requests.

Do not compile production assets on the panel host unless intentionally
deploying from source. Tagged `panel.tar.gz` archives already contain the
compiled bundle.

## Loading indicators or controls are distorted

An oval spinner, unstyled menu, blue fallback color, or misplaced mobile panel
usually means the latest CSS bundle did not load. Follow the stale-asset checks
above first. Then confirm:

-   the page has a normal responsive viewport meta tag and is not browser-zoomed;
-   a user stylesheet or extension is not overriding dimensions or colors;
-   the problem reproduces at 100% zoom in a private window; and
-   both Crimson Red and Midnight Blue behave the same before reporting a
    component-specific defect.

Include a full-page screenshot with the viewport dimensions in the issue.

## Admin settings save but the interface does not change

Database-backed settings override `.env`. Editing an environment fallback after
the same field has been saved in **Admin → Settings** will not replace the
stored value.

Check the effective configuration without exposing secrets:

```bash
php artisan config:show branding
php artisan optimize:clear
php artisan queue:restart
```

If saving shows a queue-restart warning, the values were committed but workers
may still hold old configuration. Restart the queue service under your process
manager after running `php artisan queue:restart`.

For validation errors, verify the ranges in
[Configuration](./CONFIGURATION.md). Announcement links must begin with
`http://`, `https://`, or a single root-relative `/`.

## Logo, artwork, video, or favicon does not appear

For a local media path:

-   place the file under `public/branding/`;
-   save a URL beginning with `/branding/`, not a filesystem path;
-   make the file readable by the web-server account; and
-   request the asset URL directly in a private browser window.

For remote media, use HTTPS and inspect the Network tab for 403, 404, mixed
content, hotlink protection, or an unsupported response content type. Test with
a small local image to separate theme configuration from remote-host behavior.

Favicons are aggressively cached by browsers and operating systems. Replace all
sizes under `public/favicons/`, clear panel/CDN caches, remove the site's stored
data, and reopen the browser before concluding that the old icon remains in the
release.

## Console background is missing or unreadable

Confirm the effective `console_background` value with
`php artisan config:show branding`. Open the media URL directly, then verify its
extension is an image, GIF, MP4, WebM, OGG, or MOV.

If media loads but output is difficult to read, reduce **Media Visibility** to
12–24%, disable scanlines, or use darker artwork. Console media is decorative;
terminal output should remain usable with the field blank.

## Favorites or server groups do not persist

Run all pending migrations:

```bash
cd /var/www/pterodactyl
php artisan migrate --seed --force
```

Confirm that migration `2026_08_03_000001_create_rock_theme_data_tables` is
listed as run. The `rock_user_preferences` table stores one preference document
per user. In the browser Network tab, inspect requests to
`/api/client/account/rock`; an HTTP 503 means storage is temporarily unavailable
and the client will retain a local copy for retry.

Group values are limited to 32 characters. A validation failure should be fixed
at the input rather than by editing the preference JSON directly.

## Read notifications return after refresh

Notification read and clear operations are persisted in
`rock_notifications`. Confirm the Rock Theme migration has run, then inspect
PATCH or DELETE requests under `/api/client/account/rock/notifications`.

-   HTTP 204 indicates that the read state was accepted.
-   HTTP 503 indicates temporary notification-storage failure; the client keeps a
    retry record and should reconcile when storage returns.
-   HTTP 401/403 points to session, CSRF, or account access rather than the
    notification component.

The center returns at most the latest 30 unread items. Offline/recovery events
will legitimately create a new notification when server state changes again.

## Resource history is empty

Rock Theme records scheduled samples every five minutes and retains them for
seven days. Check the normal Laravel scheduler:

```bash
php artisan schedule:list
php artisan rock:telemetry
```

Then confirm:

-   the one-minute Pterodactyl cron entry is running as the correct account;
-   the Rock Theme data migration has run;
-   the panel can reach each node's Wings API; and
-   the server is installed and not in an installation, suspension, or restoration
    state that excludes it from collection.

One unavailable node is skipped without stopping other nodes. Live charts can
still show current WebSocket data while historical ranges remain empty, so test
both independently.

## `/status` returns 404 or stale data

The backing API intentionally returns 404 when **Status Page** is set to
Hidden. Enable it under **Admin → Settings → Public Status**.

Node health is cached for 45 seconds. A short delay after changing maintenance
mode or restoring Wings connectivity is expected. If results remain wrong,
confirm panel-to-Wings connectivity and inspect the request to
`/api/public/status`.

When node cards are hidden or **Summary Totals Only** is selected, aggregate
counts remain available while the item list is intentionally empty.

## File, backup, database, mount, or egg menus do not open

First rule out mismatched assets using the blank-page procedure above. Then:

-   test at 100% browser zoom and at both desktop and mobile widths;
-   close other open menus or modals;
-   check the browser console for a render exception;
-   verify the API request backing the modal did not fail; and
-   confirm the signed-in account has the required Pterodactyl permission.

For a file-row action menu, record whether the problem affects one filename,
the final rows in a long directory, mobile only, or every row. That distinction
separates data/permission failures from dropdown positioning or clipping.

## Preparing a useful bug report

Open a [GitHub issue](https://github.com/devrock07/Rock-Theme/issues) with:

-   exact Rock Theme and Pterodactyl versions;
-   installation method and panel path;
-   route, account role, browser, viewport, and theme preset;
-   minimal reproduction steps and expected/actual behavior;
-   sanitized Laravel and browser errors;
-   relevant request status codes; and
-   screenshots or a short recording for visual problems.

Report security issues privately according to [SECURITY.md](../SECURITY.md).
