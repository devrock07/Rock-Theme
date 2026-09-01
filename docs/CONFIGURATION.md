# Configuration reference

Rock Theme configuration is available under **Admin → Settings**. Saving the
form writes values to the panel's settings table and restarts the queue worker
when possible.

For complete starting profiles rather than individual fields, see
[Operator recipes](./RECIPES.md).

## Configuration precedence

The values in `.env` and `config/branding.php` are installation defaults. Once
a setting has been saved in the admin panel, its database value takes
precedence over the matching environment value.

Use this order in production:

1. set safe bootstrap defaults in `.env` before first use;
2. perform ongoing changes through **Admin → Settings**; and
3. run `php artisan optimize:clear` after changing `.env` directly.

If the admin panel reports that settings were saved but the queue could not be
restarted, run this from the panel directory and inspect the application logs:

```bash
php artisan queue:restart
```

## Identity and dashboard

| Admin setting        | Environment fallback       | Validation and behavior                                                         |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| Panel Name           | `APP_NAME`                 | Required; displayed throughout the panel                                        |
| Footer Owner         | `BRAND_OWNER`              | Required, up to 64 characters                                                   |
| Footer URL           | `BRAND_URL`                | Optional valid URL, up to 191 characters                                        |
| Header Mark          | `BRAND_MARK`               | Required compact text mark, up to 12 characters; used when no logo is set       |
| Logo                 | `BRAND_LOGO`               | Optional local public path or remote media URL, up to 500 characters            |
| Copyright Start Year | `BRAND_START_YEAR`         | From 1900 through the current year                                              |
| Dashboard Title      | `BRAND_DASHBOARD_TITLE`    | Required, up to 100 characters                                                  |
| Dashboard Subtitle   | `BRAND_DASHBOARD_SUBTITLE` | Optional, up to 160 characters; `{username}` is replaced for the signed-in user |
| Dashboard Image      | `BRAND_DASHBOARD_IMAGE`    | Optional image path or URL, up to 500 characters                                |

Keep the mark short enough to fit the mobile header. Use concise dashboard copy
because the title and artwork share the hero area at desktop widths.

## Theme Studio

| Admin setting | Environment fallback   | Accepted values                                      |
| ------------- | ---------------------- | ---------------------------------------------------- |
| Preset        | `BRAND_THEME_PRESET`   | `makima` for Crimson Red or `blue` for Midnight Blue |
| Glass         | `BRAND_GLASS_STRENGTH` | `0`–`30` pixels                                      |
| Radius        | `BRAND_CARD_RADIUS`    | `6`–`20` pixels                                      |
| Motion        | `BRAND_MOTION_ENABLED` | Enabled or Reduced                                   |

The preset controls the client, server, login, status, and admin accent system.
The live preview in Admin Settings shows the selected accent, glass strength,
radius, and motion mode before the form is saved.

Reduced mode limits nonessential interface motion. The frontend also respects
the device's `prefers-reduced-motion` setting, regardless of the admin choice.

## Local and remote media

For files hosted by the panel, place assets in `public/branding/` and save the
corresponding public path:

```text
/branding/logo.svg
/branding/dashboard.webp
/branding/login.mp4
/branding/console.gif
```

The web-server account must be able to read these files. Use HTTPS for remote
assets and confirm that the source permits direct browser loading. Operators
are responsible for copyright, privacy, bandwidth, and availability of media
served from third-party hosts.

Large GIFs and high-bitrate video can increase mobile data use and delay first
paint. Prefer compressed WebP/AVIF images and short, muted WebM/MP4 loops.

### Login

| Admin setting   | Environment fallback   | Validation and behavior                                                      |
| --------------- | ---------------------- | ---------------------------------------------------------------------------- |
| Title           | `BRAND_LOGIN_TITLE`    | Required, up to 80 characters                                                |
| Subtitle        | `BRAND_LOGIN_SUBTITLE` | Optional, up to 120 characters                                               |
| Artwork / Video | `BRAND_LOGIN_MEDIA`    | Optional local path or remote image, GIF, or video URL; up to 500 characters |

### Console

| Admin setting    | Environment fallback               | Accepted values                                                            |
| ---------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| Background Media | `BRAND_CONSOLE_BACKGROUND`         | Optional image, GIF, MP4, WebM, OGG, or MOV path/URL; up to 500 characters |
| Media Visibility | `BRAND_CONSOLE_BACKGROUND_OPACITY` | `5`–`45` percent                                                           |
| Font Size        | `BRAND_CONSOLE_FONT_SIZE`          | `10`–`18` pixels                                                           |
| Scanlines        | `BRAND_CONSOLE_SCANLINES`          | On or Off                                                                  |

Console media renders behind a dark readability layer and does not receive
pointer input. Start at 12–24% visibility, then verify warning, error, and ANSI
colors against a busy console before increasing it.

## Browser and device icons

Favicons are static files rather than database settings. Replace the matching
files under `public/favicons/`:

-   `favicon.ico`
-   `favicon-16x16.png`
-   `favicon-32x32.png`
-   `apple-touch-icon.png`
-   `android-chrome-192x192.png`
-   `android-chrome-512x512.png`

Preserve the expected dimensions and filenames, then clear panel caches and
the browser/site icon cache. The favicon URLs currently use the `rock-red-2`
cache token; bump it consistently in the Blade layouts, manifest, and
`browserconfig.xml` when a replacement must invalidate long-lived caches.

## Public status page

When enabled, `/status` is available without authentication. Its backing API
checks Wings node health and caches the aggregate result for 45 seconds.

| Admin setting    | Environment fallback      | Accepted values                                     |
| ---------------- | ------------------------- | --------------------------------------------------- |
| Status Page      | `BRAND_STATUS_ENABLED`    | Public or Hidden; Hidden makes the API return 404   |
| Headline         | `BRAND_STATUS_TITLE`      | Required, up to 80 characters                       |
| Message          | `BRAND_STATUS_MESSAGE`    | Optional, up to 240 characters                      |
| Show Node Cards  | `BRAND_STATUS_SHOW_NODES` | Visible or Hidden                                   |
| Node Filter Mode | `BRAND_STATUS_NODE_MODE`  | All Nodes, Operational Only, or Summary Totals Only |

The public response contains aggregate operational, maintenance, and
unavailable counts. When node cards are visible, it can also expose node IDs,
names, and their current status. Choose **Summary Totals Only** or hide node
cards if node names should remain private.

The page is an availability view, not a replacement for external monitoring.
A request marked operational confirms that Wings responded during the cached
check; it does not test every allocation or hosted service.

## Announcement banner

| Admin setting        | Environment fallback         | Accepted values                                                                    |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| Banner Status        | `BRAND_ANNOUNCEMENT_ENABLED` | Active or Disabled                                                                 |
| Severity Level       | `BRAND_ANNOUNCEMENT_TYPE`    | `notice`, `warning`, or `critical`                                                 |
| Announcement Message | `BRAND_ANNOUNCEMENT_MESSAGE` | Optional, up to 300 characters                                                     |
| Action Link          | `BRAND_ANNOUNCEMENT_LINK`    | Optional `http://`, `https://`, or root-relative `/path` URL; up to 500 characters |

Users can dismiss an announcement. The dismissal is keyed to its severity,
message, and link, so changing any of those fields presents the new
announcement again.

## Dashboard preferences and notifications

Favorites and server groups are stored per account in
`rock_user_preferences`. Group names are limited to 32 characters. The client
retains a local copy during a temporary storage outage and reconciles it after
the API becomes available.

Unread Rock Theme notifications are stored per account in
`rock_notifications`. The notification center retrieves the latest 30 unread
items and persists read or clear actions. Current automated events include:

-   a server becoming offline;
-   a server recovering to the running state; and
-   CPU usage crossing 90%, limited to one CPU warning per server per hour.

The server owner and assigned subusers receive events for that server. These
in-panel notifications are independent of Pterodactyl email notifications.

## Resource history

The normal Laravel scheduler runs `rock:telemetry` every five minutes. Samples
are stored in `rock_telemetry_samples`, pruned after seven days, and used for
the one-hour and 24-hour chart ranges. The client API returns at most roughly
120 evenly spaced samples for a requested range.

Pterodactyl's scheduler must run every minute, normally through a cron entry
similar to:

```cron
* * * * * php /var/www/pterodactyl/artisan schedule:run >> /dev/null 2>&1
```

Run one collection manually for diagnosis:

```bash
cd /var/www/pterodactyl
php artisan rock:telemetry
```

Unavailable nodes are skipped without preventing collection for other nodes.
See [Troubleshooting](./TROUBLESHOOTING.md) if history remains empty.

## Default environment block

These are the Rock Theme fallbacks recognized by `config/branding.php`:

```env
BRAND_OWNER="DevRock"
BRAND_URL="https://github.com/devrock07"
BRAND_MARK="R"
BRAND_LOGO=""
BRAND_START_YEAR=2022
BRAND_DASHBOARD_TITLE="Your infrastructure, without the noise."
BRAND_DASHBOARD_SUBTITLE="Welcome back, {username}."
BRAND_DASHBOARD_IMAGE=""
BRAND_THEME_PRESET=makima
BRAND_GLASS_STRENGTH=18
BRAND_CARD_RADIUS=12
BRAND_MOTION_ENABLED=true
BRAND_LOGIN_MEDIA=""
BRAND_LOGIN_TITLE="Server control."
BRAND_LOGIN_SUBTITLE="Use your account."
BRAND_CONSOLE_BACKGROUND=""
BRAND_CONSOLE_BACKGROUND_OPACITY=18
BRAND_CONSOLE_FONT_SIZE=12
BRAND_CONSOLE_SCANLINES=false
BRAND_STATUS_ENABLED=true
BRAND_STATUS_TITLE="Systems operational"
BRAND_STATUS_MESSAGE="Infrastructure is online and operating normally."
BRAND_STATUS_SHOW_NODES=true
BRAND_STATUS_NODE_MODE=all
BRAND_ANNOUNCEMENT_ENABLED=false
BRAND_ANNOUNCEMENT_MESSAGE=""
BRAND_ANNOUNCEMENT_TYPE=notice
BRAND_ANNOUNCEMENT_LINK=""
```

## Theme source map

These are the primary implementation locations for maintainers extending the
visual system:

-   Client color tokens: `resources/scripts/assets/css/GlobalStylesheet.ts`
-   Client effects: `resources/scripts/components/elements/reactbits/`
-   Admin styles: `public/themes/pterodactyl/css/admin-rockvps.css`
-   Admin effects: `public/themes/pterodactyl/js/admin/reactbits-effects.js`
