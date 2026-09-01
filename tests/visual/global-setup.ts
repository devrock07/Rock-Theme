import fs from 'fs';
import path from 'path';
import { chromium, FullConfig } from '@playwright/test';

export const authStatePath = path.resolve(__dirname, '.auth', 'state.json');

export default async (config: FullConfig) => {
    const routes = (process.env.ROCK_VISUAL_ROUTES || '/auth/login,/status').split(',').map((route) => route.trim());
    const needsAuthentication = routes.some(
        (route) =>
            !route.startsWith('/auth/') &&
            route !== '/status' &&
            !route.startsWith('/status?') &&
            !route.startsWith('/status#')
    );
    const username = process.env.ROCK_VISUAL_EMAIL;
    const password = process.env.ROCK_VISUAL_PASSWORD;
    if (!!username !== !!password) {
        throw new Error('ROCK_VISUAL_EMAIL and ROCK_VISUAL_PASSWORD must be provided together.');
    }
    if (!needsAuthentication || !username || !password) return;

    const configuredBase = config.projects[0]?.use.baseURL;
    if (typeof configuredBase !== 'string') throw new Error('Responsive QA requires a base URL.');
    const configuredOrigin = new URL(configuredBase).origin;
    const browser = await chromium.launch();

    try {
        const context = await browser.newContext({ colorScheme: 'dark' });
        const page = await context.newPage();
        await page.goto(new URL('/auth/login', configuredBase).toString(), { waitUntil: 'domcontentloaded' });
        if (new URL(page.url()).origin !== configuredOrigin) {
            throw new Error('Responsive QA authentication left the configured panel origin.');
        }

        await page.locator('input[name="username"], input[type="email"]').first().fill(username);
        await page.locator('input[type="password"]').first().fill(password);
        await page.locator('button[type="submit"]').click();
        await page.waitForURL((url) => !url.pathname.startsWith('/auth/'), { timeout: 15000 });
        if (new URL(page.url()).origin !== configuredOrigin) {
            throw new Error('Responsive QA login left the configured panel origin.');
        }

        fs.mkdirSync(path.dirname(authStatePath), { recursive: true });
        await context.storageState({ path: authStatePath });
    } finally {
        await browser.close();
    }

    return () => fs.rmSync(authStatePath, { force: true });
};
