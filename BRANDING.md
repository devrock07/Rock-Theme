# Branding

Use **Admin → Settings → Branding** to change:

-   Company or panel name
-   Footer owner and optional link
-   Header mark and optional logo URL or path
-   Copyright start year
-   Dashboard title and subtitle
-   Dashboard character or background image
-   Console image, GIF, or video background and visibility
-   Crimson Red or Blue theme preset, glass strength, card radius, and motion level
-   Login title, subtitle, and image/GIF/video artwork
-   Console font size and optional scanline treatment
-   Public status-page visibility, headline, message, node breakdown visibility, and node filter mode
-   Global announcement message, severity, and optional internal or HTTPS action link

Changes are stored in the panel database and apply to the client, login, and
admin views.

The `.env` values are fallback defaults for a fresh installation:

```env
APP_NAME="Rock Theme"
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

`{username}` in the dashboard subtitle is replaced with the signed-in user's
username.

## Dashboard artwork

Use artwork that you own or have permission to redistribute. For a local
image, place the file in `public/branding/` and enter its public path in the
Branding settings:

```text
/branding/dashboard.jpg
```

Remote HTTPS image URLs are also supported when the remote host allows them.

## Console background

Set **Admin → Settings → Console → Background Media** to a local public path
or remote URL. Images, animated GIFs, MP4, WebM, OGG, and MOV files are
supported. Media is rendered behind terminal output with a dark readability
layer and never receives pointer input. Use **Media Visibility** to keep text
legible; 12–24% works well for most artwork.

## Theme Studio and login builder

Theme Studio applies either the default Crimson Red preset (`makima`) or the
Blue preset (`blue`) to both the client and admin interfaces. Glass strength,
corner radius, and motion are global controls. The login media field accepts
the same local paths and remote image/video formats as the console background.

## Dashboard tools

Press `Ctrl+K` to open the command palette. Favorites, custom server groups,
and notification state are synchronized with the signed-in account and use a
local fallback while a request is pending or unavailable. Resource telemetry is
retained server-side for seven days. Quick view uses the normal Pterodactyl
client API and respects the signed-in user's power permissions.

## Public status page

The branded page is available at `/status` without authentication when enabled.
It is an operator-controlled availability notice. The public response includes
aggregate health counts and, when node cards are visible, node IDs, names, and
their current health or maintenance state. Use **Summary Totals Only** or hide
node cards if node names are sensitive. It does not expose private server
telemetry.

## Logo and device icons

Set the optional logo in **Admin → Settings → Branding** or with
`BRAND_LOGO`. It accepts a local public path such as
`/branding/logo.svg` or a remote HTTPS URL. When it is empty, the header uses
`BRAND_MARK` as its compact text logo.

The browser and device icons are stored in `public/favicons/`, including:

-   `favicon.ico`
-   `favicon-16x16.png`
-   `favicon-32x32.png`
-   `apple-touch-icon.png`
-   `android-chrome-192x192.png`
-   `android-chrome-512x512.png`

Replace these files with matching dimensions, then clear browser and panel
caches. The favicon URLs currently use the `rock-red-2` cache token; bump that
token in the two Blade layouts, the manifest, and `browserconfig.xml` when a
replacement must invalidate long-lived browser caches.

## Theme source

-   Client colors: `resources/scripts/assets/css/GlobalStylesheet.ts`
-   Client effects: `resources/scripts/components/elements/reactbits/`
-   Admin colors: `public/themes/pterodactyl/css/admin-rockvps.css`
-   Admin effects: `public/themes/pterodactyl/js/admin/reactbits-effects.js`
