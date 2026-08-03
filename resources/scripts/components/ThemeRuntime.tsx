import { useEffect } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

const hexToRgb = (value: string) => {
    const match = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
    return match ? `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}` : '201, 79, 89';
};

export default () => {
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);

    useEffect(() => {
        const root = document.documentElement;
        const accent = branding.accent || '#c94f59';
        const rgb = hexToRgb(accent);

        root.dataset.rockTheme = branding.themePreset || 'makima';
        root.dataset.rockMotion = branding.motionEnabled ? 'full' : 'reduced';
        root.style.setProperty('--shell-accent', accent);
        root.style.setProperty('--shell-accent-rgb', rgb);
        root.style.setProperty('--shell-accent-bright', `color-mix(in srgb, ${accent} 62%, white)`);
        root.style.setProperty('--shell-accent-soft', `rgba(${rgb}, 0.12)`);
        root.style.setProperty('--shell-glass', `${Math.min(30, Math.max(0, branding.glassStrength || 0))}px`);
        root.style.setProperty('--shell-radius', `${Math.min(20, Math.max(6, branding.cardRadius || 12))}px`);

        return () => {
            delete root.dataset.rockTheme;
            delete root.dataset.rockMotion;
        };
    }, [branding]);

    return null;
};
