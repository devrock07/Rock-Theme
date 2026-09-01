import { defineConfig, devices } from '@playwright/test';
import { authStatePath } from './global-setup';

const baseURL = process.env.ROCK_VISUAL_BASE_URL || 'http://127.0.0.1:8000';
const configuredRoutes = (process.env.ROCK_VISUAL_ROUTES || '/auth/login,/status')
    .split(',')
    .map((route) => route.trim());
const needsAuthentication = configuredRoutes.some(
    (route) =>
        !route.startsWith('/auth/') &&
        route !== '/status' &&
        !route.startsWith('/status?') &&
        !route.startsWith('/status#')
);

export default defineConfig({
    testDir: '.',
    testMatch: /responsive\.spec\.ts/,
    globalSetup: require.resolve('./global-setup'),
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : 'list',
    outputDir: 'test-results/responsive',
    use: {
        baseURL,
        colorScheme: 'dark',
        screenshot: 'only-on-failure',
        storageState:
            needsAuthentication && process.env.ROCK_VISUAL_EMAIL && process.env.ROCK_VISUAL_PASSWORD
                ? authStatePath
                : undefined,
        trace: 'off',
    },
    projects: [
        {
            name: 'phone',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 360, height: 800 },
                isMobile: true,
                hasTouch: true,
            },
        },
        {
            name: 'tablet',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 768, height: 1024 },
                isMobile: true,
                hasTouch: true,
            },
        },
        { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
        { name: 'ultrawide', use: { ...devices['Desktop Chrome'], viewport: { width: 2560, height: 1080 } } },
    ],
});
