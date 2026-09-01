# Responsive browser checks

The Playwright suite checks Rock Theme at four maintained viewport contracts:

| Project     | Viewport    | Primary use                                          |
| ----------- | ----------- | ---------------------------------------------------- |
| `phone`     | 360 × 800   | Small Android/iOS screens and browser chrome changes |
| `tablet`    | 768 × 1024  | Touch tablets and narrow admin layouts               |
| `desktop`   | 1440 × 900  | Standard desktop panel usage                         |
| `ultrawide` | 2560 × 1080 | Wide dashboards and server grids                     |

Every route is checked for document errors, uncaught JavaScript errors,
horizontal page overflow, clipped primary navigation, and undersized primary
navigation or dialog controls. Phone and tablet checks enforce 44 px touch
targets. Authenticated client routes also open and bound-check the notification
dialog, while file or backup action menus are exercised whenever the route has
one. A full-page screenshot is produced locally for each viewport.

Run the public-route matrix against a local panel:

```bash
ROCK_VISUAL_BASE_URL=http://127.0.0.1:8000 yarn test:responsive
```

Authenticated client, server, and admin routes can be supplied without putting credentials in the repository:

```bash
ROCK_VISUAL_BASE_URL=https://panel.example.com \
ROCK_VISUAL_EMAIL=admin@example.com \
ROCK_VISUAL_PASSWORD='use-a-secret' \
ROCK_VISUAL_ROUTES='/,/server/example,/server/example/files,/admin,/status' \
yarn test:responsive
```

For GitHub's **Responsive QA** workflow, create a protected environment named
`responsive-qa`, set its `ROCK_VISUAL_BASE_URL` variable to the exact HTTPS panel
origin, and optionally add `ROCK_VISUAL_EMAIL` and `ROCK_VISUAL_PASSWORD`
environment secrets for protected routes. The target is deliberately not a
workflow input, the job runs only from `main`, and the checkout is pinned to
`main`. Every requested route is resolved and required to remain on that exact
origin before navigation, including rejection of backslash URL variants, so a
dispatcher cannot redirect the authenticated browser to another host. Credentials
are scoped only to the Playwright step, and tracing is disabled so password input
is never retained.

Use a least-privilege account and sanitized test data. Configure required
reviewers on the environment when available. Failure screenshots and the HTML
report are uploaded only after a failed run and expire after three days; treat
those artifacts as potentially sensitive.
