import React from 'react';
import { render } from '@testing-library/react';
import ThemeRuntime from '@/components/ThemeRuntime';
import { SiteSettings } from '@/state/settings';

let mockBranding: SiteSettings['branding'];

jest.mock('easy-peasy', () => ({
    useStoreState: (selector: (state: unknown) => unknown) =>
        selector({ settings: { data: { branding: mockBranding } } }),
}));

const branding = (overrides: Partial<SiteSettings['branding']> = {}): SiteSettings['branding'] => ({
    owner: 'DevRock',
    url: 'https://example.test',
    mark: 'R',
    logo: '',
    startYear: 2022,
    dashboardTitle: 'Control',
    dashboardSubtitle: 'Ready',
    dashboardImage: '',
    themePreset: 'makima',
    accent: '#c94f59',
    glassStrength: 18,
    cardRadius: 12,
    motionEnabled: true,
    loginMedia: '',
    loginTitle: 'Sign in',
    loginSubtitle: '',
    consoleBackground: '',
    consoleBackgroundOpacity: 18,
    consoleFontSize: 12,
    consoleScanlines: false,
    statusEnabled: true,
    statusTitle: 'Status',
    statusMessage: '',
    statusShowNodes: true,
    statusNodeMode: 'all',
    announcementEnabled: false,
    announcementMessage: '',
    announcementType: 'notice',
    announcementLink: '',
    ...overrides,
});

describe('ThemeRuntime', () => {
    beforeEach(() => {
        document.head.innerHTML = '<meta name="theme-color" content="#000000">';
        document.documentElement.removeAttribute('data-rock-theme');
        document.documentElement.removeAttribute('data-rock-motion');
        document.documentElement.removeAttribute('style');
    });

    it.each([
        ['makima', '#c94f59', '201, 79, 89', '#09090a'],
        ['blue', '#5b8cff', '91, 140, 255', '#070a10'],
    ] as const)('applies the complete %s token set', (preset, accent, rgb, browserColor) => {
        mockBranding = branding({ themePreset: preset });
        const view = render(<ThemeRuntime />);
        const root = document.documentElement;

        expect(root.dataset.rockTheme).toBe(preset);
        expect(root.dataset.rockMotion).toBe('full');
        expect(root.style.getPropertyValue('--shell-accent')).toBe(accent);
        expect(root.style.getPropertyValue('--shell-accent-rgb')).toBe(rgb);
        expect(root.style.getPropertyValue('--shell-accent-bright')).toMatch(/^rgb\(/);
        expect(root.style.getPropertyValue('--shell-accent-soft')).toBe(`rgba(${rgb}, 0.12)`);
        expect(root.style.getPropertyValue('--shell-glass')).toBe('18px');
        expect(root.style.getPropertyValue('--shell-radius')).toBe('12px');
        expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', browserColor);

        view.unmount();
        expect(root).not.toHaveAttribute('data-rock-theme');
        expect(root.style.getPropertyValue('--shell-accent')).toBe('');
    });

    it('clamps visual settings and exposes reduced motion to every preset', () => {
        mockBranding = branding({ themePreset: 'blue', glassStrength: 100, cardRadius: 1, motionEnabled: false });
        render(<ThemeRuntime />);

        expect(document.documentElement.dataset.rockMotion).toBe('reduced');
        expect(document.documentElement.style.getPropertyValue('--shell-glass')).toBe('30px');
        expect(document.documentElement.style.getPropertyValue('--shell-radius')).toBe('6px');
    });
});
