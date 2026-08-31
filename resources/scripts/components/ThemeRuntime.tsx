import { useLayoutEffect } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

const hexToRgb = (value: string) => {
    const match = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
    return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : [201, 79, 89];
};

const mixWithWhite = (rgb: number[], amount = 0.38) =>
    `rgb(${rgb.map((channel) => Math.round(channel + (255 - channel) * amount)).join(', ')})`;

export default () => {
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);

    useLayoutEffect(() => {
        const root = document.documentElement;
        const themePreset = branding.themePreset === 'blue' ? 'blue' : 'makima';
        const accent = themePreset === 'blue' ? '#5b8cff' : '#c94f59';
        const rgb = hexToRgb(accent);
        const glassStrength = Number.isFinite(branding.glassStrength) ? branding.glassStrength : 18;
        const cardRadius = Number.isFinite(branding.cardRadius) ? branding.cardRadius : 12;

        root.dataset.rockTheme = themePreset;
        root.dataset.rockMotion = branding.motionEnabled ? 'full' : 'reduced';
        root.style.setProperty('--shell-accent', accent);
        root.style.setProperty('--shell-accent-rgb', rgb.join(', '));
        root.style.setProperty('--shell-accent-bright', mixWithWhite(rgb));
        root.style.setProperty('--shell-accent-soft', `rgba(${rgb.join(', ')}, 0.12)`);
        root.style.setProperty('--shell-glass', `${Math.min(30, Math.max(0, glassStrength))}px`);
        root.style.setProperty('--shell-radius', `${Math.min(20, Math.max(6, cardRadius))}px`);

        const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        themeColor?.setAttribute('content', themePreset === 'blue' ? '#070a10' : '#09090a');

        return () => {
            delete root.dataset.rockTheme;
            delete root.dataset.rockMotion;
            [
                '--shell-accent',
                '--shell-accent-rgb',
                '--shell-accent-bright',
                '--shell-accent-soft',
                '--shell-glass',
                '--shell-radius',
            ].forEach((property) => root.style.removeProperty(property));
        };
    }, [branding]);

    return null;
};
