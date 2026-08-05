import { action, Action } from 'easy-peasy';

export interface SiteSettings {
    name: string;
    locale: string;
    branding: {
        owner: string;
        url: string;
        mark: string;
        logo: string;
        startYear: number;
        dashboardTitle: string;
        dashboardSubtitle: string;
        dashboardImage: string;
        themePreset: 'makima' | 'blue';
        accent: string;
        glassStrength: number;
        cardRadius: number;
        motionEnabled: boolean;
        loginMedia: string;
        loginTitle: string;
        loginSubtitle: string;
        consoleBackground: string;
        consoleBackgroundOpacity: number;
        consoleFontSize: number;
        consoleScanlines: boolean;
        statusEnabled: boolean;
        statusTitle: string;
        statusMessage: string;
        statusShowNodes: boolean;
        statusNodeMode: 'all' | 'operational_only' | 'summary_only';
        announcementEnabled: boolean;
        announcementMessage: string;
        announcementType: 'notice' | 'warning' | 'critical';
        announcementLink: string;
    };
    recaptcha: {
        enabled: boolean;
        siteKey: string;
    };
}

export interface SettingsStore {
    data?: SiteSettings;
    setSettings: Action<SettingsStore, SiteSettings>;
}

const settings: SettingsStore = {
    data: undefined,

    setSettings: action((state, payload) => {
        state.data = payload;
    }),
};

export default settings;
