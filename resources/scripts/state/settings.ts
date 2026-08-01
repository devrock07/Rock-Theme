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
