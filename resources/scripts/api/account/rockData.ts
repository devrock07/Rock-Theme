import http from '@/api/http';

export interface ServerPreference {
    favorite: boolean;
    group: string;
}

export interface RockAccountData {
    serverPreferences: Record<string, ServerPreference>;
    notifications: Array<{
        id: string;
        type: string;
        title: string;
        message: string;
        href?: string;
        createdAt: string;
    }>;
}

export const getRockAccountData = (): Promise<RockAccountData> =>
    http.get('/api/client/account/rock').then(({ data }) => data);

export const saveServerPreferences = (serverPreferences: Record<string, ServerPreference>): Promise<void> =>
    http.put('/api/client/account/rock', { server_preferences: serverPreferences }).then(() => undefined);

export const clearServerNotifications = (): Promise<void> =>
    http.delete('/api/client/account/rock/notifications').then(() => undefined);
