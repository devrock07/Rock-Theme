import {
    getRockNotifications,
    markRockNotificationRead,
    mergeRockNotifications,
    pushRockNotification,
    setRockNotifications,
} from './rockNotifications';

describe('rock notifications', () => {
    beforeEach(() => localStorage.clear());

    it('ignores malformed stored data and unsafe links', () => {
        localStorage.setItem(
            'rock:notifications',
            JSON.stringify([
                {
                    id: 'safe',
                    title: 'Ready',
                    message: 'Server online',
                    createdAt: 10,
                    tone: 'success',
                    href: '/server/a',
                },
                {
                    id: 'unsafe',
                    title: 'Alert',
                    message: 'External',
                    createdAt: 9,
                    tone: 'danger',
                    href: 'https://example.com',
                },
                { id: 'broken' },
            ])
        );

        expect(getRockNotifications()).toEqual([
            { id: 'safe', title: 'Ready', message: 'Server online', createdAt: 10, tone: 'success', href: '/server/a' },
            { id: 'unsafe', title: 'Alert', message: 'External', createdAt: 9, tone: 'danger', href: undefined },
        ]);
    });

    it('merges, sorts, and de-duplicates equivalent alerts', () => {
        const older = {
            id: 'local',
            title: 'CPU high',
            message: 'Crossed 90%.',
            createdAt: 100,
            tone: 'warning' as const,
        };
        const remote = { ...older, id: 'remote', createdAt: 200 };
        const latest = {
            id: 'latest',
            title: 'Recovered',
            message: 'Online',
            createdAt: 300,
            tone: 'success' as const,
        };

        expect(mergeRockNotifications([remote, latest], [older])).toEqual([latest, remote]);
    });

    it('keeps only the newest thirty notifications', () => {
        setRockNotifications(
            Array.from({ length: 30 }, (_, index) => ({
                id: String(index),
                title: `Alert ${index}`,
                message: 'Message',
                createdAt: index,
                tone: 'info' as const,
            }))
        );
        pushRockNotification({ title: 'Newest', message: 'Message', tone: 'success' });

        expect(getRockNotifications()).toHaveLength(30);
        expect(getRockNotifications()[0].title).toBe('Newest');
    });

    it('keeps a read notification hidden after the server sends it again', () => {
        const remote = {
            id: '42',
            title: 'Server recovered',
            message: 'The server is responding again.',
            createdAt: 100,
            tone: 'success' as const,
            remote: true,
        };
        setRockNotifications([remote]);

        markRockNotificationRead(remote.id);

        expect(getRockNotifications()).toEqual([]);
        expect(mergeRockNotifications([remote])).toEqual([]);
    });
});
