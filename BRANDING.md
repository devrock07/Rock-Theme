# Branding

Use **Admin → Settings → Branding** to change:

-   Company or panel name
-   Footer owner and optional link
-   Header mark and optional logo URL or path
-   Copyright start year
-   Dashboard title and subtitle
-   Dashboard character or background image
-   Console image, GIF, or video background and visibility

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
BRAND_CONSOLE_BACKGROUND=""
BRAND_CONSOLE_BACKGROUND_OPACITY=18
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
caches.

## Theme source

-   Client colors: `resources/scripts/assets/css/GlobalStylesheet.ts`
-   Client effects: `resources/scripts/components/elements/reactbits/`
-   Admin colors: `public/themes/pterodactyl/css/admin-rockvps.css`
-   Admin effects: `public/themes/pterodactyl/js/admin/reactbits-effects.js`
