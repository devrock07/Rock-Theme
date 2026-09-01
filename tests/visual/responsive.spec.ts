import { expect, test } from '@playwright/test';

const routes = (process.env.ROCK_VISUAL_ROUTES || '/auth/login,/status')
    .split(',')
    .map((route) => route.trim())
    .filter(Boolean);

const configuredBase = new URL(process.env.ROCK_VISUAL_BASE_URL || 'http://127.0.0.1:8000');
const configuredOrigin = configuredBase.origin;
const unsafeRoute = routes.find((route) => {
    if (!route.startsWith('/') || route.startsWith('//') || route.includes('\\')) return true;

    try {
        return new URL(route, configuredBase).origin !== configuredOrigin;
    } catch {
        return true;
    }
});
if (unsafeRoute) {
    throw new Error(`Responsive QA routes must be same-origin, root-relative panel paths: ${unsafeRoute}`);
}

const isPublicRoute = (route: string) =>
    route.startsWith('/auth/') || route === '/status' || route.startsWith('/status?') || route.startsWith('/status#');
const isClientRoute = (route: string) =>
    !isPublicRoute(route) && route !== '/admin' && !route.startsWith('/admin/') && !route.startsWith('/admin?');

const slug = (route: string) => route.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'dashboard';

for (const route of routes) {
    test(`${route} stays usable at the configured viewport`, async ({ page }, testInfo) => {
        const runtimeErrors: string[] = [];
        const touchViewport = testInfo.project.name === 'phone' || testInfo.project.name === 'tablet';
        const minimumTargetSize = touchViewport ? 44 : 24;
        page.on('pageerror', (error) => runtimeErrors.push(error.message));

        if (isPublicRoute(route)) await page.context().clearCookies();

        const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
        expect(response, `No document response was returned for ${route}`).not.toBeNull();
        expect(response!.status(), `${route} returned an HTTP error`).toBeLessThan(400);
        expect(new URL(page.url()).origin, `${route} left the configured panel origin`).toBe(configuredOrigin);
        if (!isPublicRoute(route)) {
            expect(
                new URL(page.url()).pathname,
                `${route} redirected to authentication. Configure valid ROCK_VISUAL_EMAIL and ROCK_VISUAL_PASSWORD secrets.`
            ).not.toMatch(/^\/auth\//);
        }
        await expect(page.locator('body')).toBeVisible();
        await page
            .locator('.topbar:visible, main:visible, [role="main"]:visible, form:visible')
            .first()
            .waitFor({ state: 'visible', timeout: 15000 });

        if (isClientRoute(route)) {
            const notificationTrigger = page.getByRole('button', { name: 'Notifications' });
            await expect(notificationTrigger).toBeVisible();
            await notificationTrigger.click();

            const notificationDialog = page.getByRole('dialog', { name: 'Notifications' });
            await expect(notificationDialog).toBeVisible();
            const bounds = await notificationDialog.boundingBox();
            const viewport = page.viewportSize();
            expect(bounds, 'Notification dialog did not expose viewport geometry').not.toBeNull();
            expect(viewport, 'Responsive project did not expose a viewport').not.toBeNull();
            expect(bounds!.x).toBeGreaterThanOrEqual(-1);
            expect(bounds!.y).toBeGreaterThanOrEqual(-1);
            expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport!.width + 1);
            expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport!.height + 1);

            if (touchViewport) {
                const notificationTargets = await notificationDialog.locator('button, a').evaluateAll((elements) =>
                    elements.map((element) => {
                        const box = element.getBoundingClientRect();
                        return { width: box.width, height: box.height };
                    })
                );
                expect(
                    notificationTargets.filter((target) => target.width < 44 || target.height < 44),
                    'Notification dialog contains undersized touch targets'
                ).toEqual([]);
            }

            await page.keyboard.press('Escape');
            await expect(notificationDialog).toBeHidden();
        }

        const actionToggle = page.locator('button[aria-label^="Actions for "]:visible').first();
        if ((await actionToggle.count()) > 0) {
            await actionToggle.click();
            const menu = page.getByRole('menu');
            await expect(menu).toBeVisible();
            const menuBounds = await menu.boundingBox();
            const viewport = page.viewportSize();
            expect(menuBounds, 'Action menu did not expose viewport geometry').not.toBeNull();
            expect(menuBounds!.x).toBeGreaterThanOrEqual(-1);
            expect(menuBounds!.y).toBeGreaterThanOrEqual(-1);
            expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(viewport!.width + 1);
            expect(menuBounds!.y + menuBounds!.height).toBeLessThanOrEqual(viewport!.height + 1);

            const firstMenuItem = menu.getByRole('menuitem').first();
            if ((await firstMenuItem.count()) > 0) {
                await page.keyboard.press('ArrowDown');
                await expect(firstMenuItem).toBeFocused();
            }
            await page.keyboard.press('Escape');
            await expect(menu).toBeHidden();
        }

        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow, `${route} has horizontal page overflow`).toBeLessThanOrEqual(1);

        const clippedControls = await page
            .locator(
                '.topbar button, .topbar a, nav[aria-label="Mobile navigation"] a, [role="dialog"] button, form button'
            )
            .evaluateAll(
                (elements, minimumSize) =>
                    elements
                        .filter((element) => {
                            const style = window.getComputedStyle(element);
                            const box = element.getBoundingClientRect();
                            return (
                                style.visibility !== 'hidden' &&
                                style.display !== 'none' &&
                                box.width > 0 &&
                                box.height > 0
                            );
                        })
                        .map((element) => {
                            const box = element.getBoundingClientRect();
                            return {
                                label:
                                    element.getAttribute('aria-label') ||
                                    element.textContent?.trim() ||
                                    element.tagName.toLowerCase(),
                                width: box.width,
                                height: box.height,
                                outside:
                                    box.left < -1 ||
                                    box.top < -1 ||
                                    box.right > window.innerWidth + 1 ||
                                    box.bottom > window.innerHeight + 1,
                            };
                        })
                        .filter(
                            (control) => control.outside || control.width < minimumSize || control.height < minimumSize
                        ),
                minimumTargetSize
            );

        expect(clippedControls, `${route} contains clipped or undersized primary controls`).toEqual([]);
        await page.waitForTimeout(250);

        await page.screenshot({
            path: testInfo.outputPath(`${slug(route)}.png`),
            fullPage: true,
            animations: 'disabled',
        });
        expect(runtimeErrors, `${route} raised an uncaught browser error`).toEqual([]);
    });
}
