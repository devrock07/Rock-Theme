# Operator recipes

These recipes are starting points for common Rockdactyl deployments. Apply
them in **Admin → Settings**, save once, and verify the result in a private
browser window and at a phone-sized viewport. Database-backed admin values take
precedence over matching `.env` fallbacks.

## Branded production panel

Use local, versioned assets so the panel does not depend on a third-party image
host.

1. Place an SVG or transparent PNG logo and a compressed dashboard image in
   `public/branding/`.
2. Set **Panel Name**, **Footer Owner**, **Footer URL**, **Header Mark**, and the
   copyright start year.
3. Set **Logo** to `/branding/logo.svg` and **Dashboard Image** to
   `/branding/dashboard.webp`.
4. Keep the dashboard title short enough to remain on one or two lines on a
   phone.

Example bootstrap values for `.env`:

```env
APP_NAME="Example Hosting"
BRAND_OWNER="Example Hosting"
BRAND_URL="https://example.com"
BRAND_MARK="EH"
BRAND_LOGO="/branding/logo.svg"
BRAND_START_YEAR=2026
BRAND_DASHBOARD_TITLE="Servers, under control."
BRAND_DASHBOARD_SUBTITLE="Welcome back, {username}."
BRAND_DASHBOARD_IMAGE="/branding/dashboard.webp"
```

After replacing a local asset without changing its filename, invalidate any CDN
cache for that path and perform a hard browser refresh.

## Crimson Red or Midnight Blue

Rockdactyl intentionally ships two complete presets. Select **Crimson Red** for
the default warm interface or **Midnight Blue** for a cooler operations-focused
interface.

| Setting | Conservative production value                                 |
| ------- | ------------------------------------------------------------- |
| Glass   | `14`–`18` px                                                  |
| Radius  | `10`–`14` px                                                  |
| Motion  | Reduced for shared terminals; Enabled for personal dashboards |

Check login, dashboard, server console, file menus, modal dialogs, admin forms,
notifications, and `/status` after switching presets. The selected preset is a
panel-wide setting; it is not stored separately per user.

## Privacy-first status page

To expose availability without publishing infrastructure names:

-   enable **Status Page**;
-   set **Node Filter Mode** to **Summary Totals Only**; and
-   disable **Show Node Cards**.

Use a neutral message such as “Live infrastructure status.” The endpoint
returns cached aggregate health for 45 seconds, so it should complement rather
than replace an independent uptime monitor.

For a private installation, set **Status Page** to **Hidden**. Both `/status`
and its backing public API then return a not-found response.

## Incident announcement

Use the global banner for short, actionable communication:

| Situation        | Severity | Example message                              |
| ---------------- | -------- | -------------------------------------------- |
| Planned work     | Notice   | `Maintenance begins at 02:00 UTC.`           |
| Degraded service | Warning  | `Database provisioning is delayed.`          |
| Active outage    | Critical | `Console access is temporarily unavailable.` |

Set **Action Link** to a root-relative route such as `/status` or an HTTPS
incident page. Changing the message, severity, or link creates a new dismissal
identity, so users who dismissed an earlier notice will see the update.

Disable the banner after the incident is resolved instead of leaving stale
operational text in place.

## Readable console media

Prefer a dark, low-detail image or a short muted WebM loop. Host it locally when
possible:

```text
/branding/console.webp
/branding/console.webm
```

Start with these values:

| Setting          | Suggested value          |
| ---------------- | ------------------------ |
| Background Media | `/branding/console.webp` |
| Media Visibility | `14`%                    |
| Font Size        | `12` px                  |
| Scanlines        | Off                      |

Verify green, yellow, red, and ANSI-colored output over both bright and dark
areas. Increase opacity only after logs remain readable. If a remote URL fails,
confirm that it is HTTPS, publicly reachable by a browser, returns the expected
media content type, and is not protected by hotlink or authentication rules.

## Mobile and low-motion deployment

For panels commonly used on phones or low-powered devices:

-   use WebP/AVIF artwork instead of large GIFs;
-   keep dashboard and login videos short, muted, and compressed;
-   set **Motion** to **Reduced**;
-   keep **Glass** at `14` px or lower; and
-   test at widths of `360`, `390`, `768`, `1440`, and `1920` pixels.

Reduced mode also follows the browser's `prefers-reduced-motion` setting. Core
actions, focus indicators, menus, and loading states remain available without
decorative animation.

## Telemetry and persistent notifications

Resource history and threshold notifications depend on the Laravel scheduler.
Install the standard per-minute scheduler entry:

```cron
* * * * * php /var/www/pterodactyl/artisan schedule:run >> /dev/null 2>&1
```

Then run one collection and inspect the schedule:

```bash
cd /var/www/pterodactyl
php artisan schedule:list
php artisan rock:telemetry
```

Notification read and clear actions are stored per account. When validating a
deployment, read one notification, reload the page, and confirm it does not
return as unread.

## TLS reverse proxy

Keep the panel origin private, terminate TLS at the edge, and trust only the
addresses of proxies you operate:

```env
APP_URL=https://panel.example.com
TRUSTED_PROXIES=10.0.0.10,10.0.0.11
```

Do not use `TRUSTED_PROXIES=*` on an origin reachable from the public internet.
A minimal Nginx edge configuration is:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl http2;
    server_name panel.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

Configure certificates, upload limits, and timeouts for your environment. Keep
WebSocket upgrade headers intact so server consoles connect, then verify that
generated links use HTTPS and that login, uploads, downloads, and a live console
work through the public hostname.

## Production verification

After applying any recipe:

```bash
cd /var/www/pterodactyl
php artisan optimize:clear
php artisan queue:restart
php artisan schedule:list
```

Verify the login page, dashboard, notification center, one server console, file
actions, admin settings persistence, and `/status` where enabled. Keep a copy of
the previous settings and local branding files so a visual change can be rolled
back independently of application code.
