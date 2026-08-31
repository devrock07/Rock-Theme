export interface RockNotification {
    id: string;
    title: string;
    message: string;
    createdAt: number | string;
    tone: 'info' | 'warning' | 'danger' | 'success';
    href?: string;
    remote?: boolean;
}

const STORAGE_KEY = 'rock:notifications';
const READ_STORAGE_KEY = 'rock:notifications:read';
const MAX_NOTIFICATIONS = 30;
const MAX_READ_MARKERS = 120;
const tones: RockNotification['tone'][] = ['info', 'warning', 'danger', 'success'];

const normalizeNotification = (value: unknown): RockNotification | null => {
    if (!value || typeof value !== 'object') return null;
    const item = value as Partial<RockNotification>;
    if (!item.id || !item.title || !item.message) return null;

    const normalized: RockNotification = {
        id: String(item.id),
        title: String(item.title),
        message: String(item.message),
        createdAt: item.createdAt ?? Date.now(),
        tone: tones.includes(item.tone as RockNotification['tone']) ? (item.tone as RockNotification['tone']) : 'info',
        href: typeof item.href === 'string' && item.href.startsWith('/') ? item.href : undefined,
    };

    if (item.remote === true) normalized.remote = true;

    return normalized;
};

const getReadNotificationIds = (): string[] => {
    try {
        const stored = JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || '[]');
        return Array.isArray(stored) ? stored.map(String).slice(0, MAX_READ_MARKERS) : [];
    } catch (_) {
        return [];
    }
};

const rememberReadNotificationIds = (ids: string[]) => {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids)).slice(0, MAX_READ_MARKERS)));
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

        const read = new Set(getReadNotificationIds());

        return stored
            .map(normalizeNotification)
            .filter((item): item is RockNotification => !!item && !read.has(item.id));
    } catch (_) {
        return [];
    }
};

export const mergeRockNotifications = (remote: RockNotification[], local = getRockNotifications()) => {
    const read = new Set(getReadNotificationIds());

    return uniqueNotifications([...remote, ...local].filter((item) => !read.has(item.id)))
        .sort((left, right) => timestamp(right.createdAt) - timestamp(left.createdAt))
        .slice(0, MAX_NOTIFICATIONS);
};

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
    rememberReadNotificationIds([...getRockNotifications().map((item) => item.id), ...getReadNotificationIds()]);
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

export const markRockNotificationRead = (id: string) => {
    rememberReadNotificationIds([id, ...getReadNotificationIds()]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getRockNotifications().filter((item) => item.id !== id)));
    window.dispatchEvent(new CustomEvent('rock:notification'));
};
