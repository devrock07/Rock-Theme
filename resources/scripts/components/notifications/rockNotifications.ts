export interface RockNotification {
    id: string;
    title: string;
    message: string;
    createdAt: number | string;
    tone: 'info' | 'warning' | 'danger' | 'success';
    href?: string;
}

const STORAGE_KEY = 'rock:notifications';
const MAX_NOTIFICATIONS = 30;
const tones: RockNotification['tone'][] = ['info', 'warning', 'danger', 'success'];

const normalizeNotification = (value: unknown): RockNotification | null => {
    if (!value || typeof value !== 'object') return null;
    const item = value as Partial<RockNotification>;
    if (!item.id || !item.title || !item.message) return null;

    return {
        id: String(item.id),
        title: String(item.title),
        message: String(item.message),
        createdAt: item.createdAt || Date.now(),
        tone: tones.includes(item.tone as RockNotification['tone']) ? (item.tone as RockNotification['tone']) : 'info',
        href: typeof item.href === 'string' && item.href.startsWith('/') ? item.href : undefined,
    };
};

const uniqueNotifications = (notifications: RockNotification[]) => {
    const seen = new Set<string>();

    return notifications.filter((item) => {
        const key = `${item.title}:${item.message}:${item.href || ''}:${item.tone}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const timestamp = (value: RockNotification['createdAt']) => {
    const parsed = typeof value === 'number' ? value : Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const getRockNotifications = (): RockNotification[] => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(stored)) return [];

        return stored.map(normalizeNotification).filter((item): item is RockNotification => !!item);
    } catch (_) {
        return [];
    }
};

export const mergeRockNotifications = (remote: RockNotification[], local = getRockNotifications()) =>
    uniqueNotifications([...remote, ...local])
        .sort((left, right) => timestamp(right.createdAt) - timestamp(left.createdAt))
        .slice(0, MAX_NOTIFICATIONS);

export const pushRockNotification = (notification: Omit<RockNotification, 'id' | 'createdAt'>) => {
    const next: RockNotification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergeRockNotifications([next])));
    window.dispatchEvent(new CustomEvent('rock:notification', { detail: next }));
};

export const clearRockNotifications = () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    window.dispatchEvent(new CustomEvent('rock:notifications-cleared'));
};

export const setRockNotifications = (notifications: RockNotification[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueNotifications(notifications).slice(0, MAX_NOTIFICATIONS)));
    window.dispatchEvent(new CustomEvent('rock:notification'));
};

export const removeRockNotification = (id: string) => {
    setRockNotifications(getRockNotifications().filter((item) => item.id !== id));
};
