import {
    getRockNotifications,
    initializeRockNotificationScope,
    markRockNotificationRead,
    mergeRockNotifications,
    pushRockNotification,
    reconcileRockNotifications,
    setRockNotifications,
} from './rockNotifications';

describe('rock notifications', () => {
    beforeEach(() => {
        localStorage.clear();
        initializeRockNotificationScope('test-user');
    });

    it('ignores malformed stored data and unsafe links', () => {
        localStorage.setItem(
            'rock:notifications:test-user',
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

    it('replaces the authoritative remote subset while retaining local-only alerts', () => {
        const staleRemote = {
            id: 'stale',
            title: 'Old remote alert',
            message: 'Already read elsewhere.',
            createdAt: 100,
            tone: 'warning' as const,
            remote: true,
        };
        const local = {
            id: 'local',
            title: 'Local resource alert',
            message: 'CPU usage is high.',
            createdAt: 200,
            tone: 'warning' as const,
        };

        expect(reconcileRockNotifications([], [staleRemote, local])).toEqual([local]);
    });

    it('keeps notifications and read markers isolated between accounts', () => {
        const alert = {
            id: 'account-a-alert',
            title: 'Private alert',
            message: 'Only account A should see this.',
            createdAt: 100,
            tone: 'info' as const,
        };

        initializeRockNotificationScope('account-a');
        setRockNotifications([alert]);
        markRockNotificationRead(alert.id);

        initializeRockNotificationScope('account-b');
        expect(getRockNotifications()).toEqual([]);
        expect(mergeRockNotifications([alert])).toEqual([alert]);

        initializeRockNotificationScope('account-a');
        expect(mergeRockNotifications([alert])).toEqual([]);
    });
});
