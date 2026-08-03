export interface RockNotification {
    id: string;
    title: string;
    message: string;
    createdAt: number;
    tone: 'info' | 'warning' | 'danger' | 'success';
    href?: string;
}

const STORAGE_KEY = 'rock:notifications';

export const getRockNotifications = (): RockNotification[] => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (_) {
        return [];
    }
};

export const pushRockNotification = (notification: Omit<RockNotification, 'id' | 'createdAt'>) => {
    const next: RockNotification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...getRockNotifications()].slice(0, 30)));
    window.dispatchEvent(new CustomEvent('rock:notification', { detail: next }));
};

export const clearRockNotifications = () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    window.dispatchEvent(new CustomEvent('rock:notifications-cleared'));
};
