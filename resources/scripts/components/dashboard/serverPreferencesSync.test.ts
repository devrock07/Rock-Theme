import {
    mergeHydratedServerPreferences,
    PreferenceSyncStatus,
    ServerPreferenceSaveQueue,
    ServerPreferences,
} from './serverPreferencesSync';

const preferences = (group: string, favorite = false): ServerPreferences => ({
    server: { favorite, group },
});

const deferred = () => {
    let resolve!: () => void;
    const promise = new Promise<void>((next) => {
        resolve = next;
    });
    return { promise, resolve };
};

describe('server preference synchronization', () => {
    afterEach(() => jest.useRealTimers());

    it('keeps fields edited during hydration while accepting untouched remote fields', () => {
        const remote = preferences('remote', false);
        const local = preferences('still typing', true);

        expect(mergeHydratedServerPreferences(remote, local, { server: { group: true } })).toEqual(
            preferences('still typing', false)
        );
    });

    it('serializes saves and coalesces edits made while a request is in flight', async () => {
        const first = deferred();
        const second = deferred();
        const save = jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
        const statuses: PreferenceSyncStatus[] = [];
        const queue = new ServerPreferenceSaveQueue(save, (status) => statuses.push(status));

        queue.enqueue(preferences('first'), 0);
        queue.enqueue(preferences('second'));
        queue.enqueue(preferences('latest'));

        expect(save).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenNthCalledWith(1, preferences('first'));

        first.resolve();
        await first.promise;
        await Promise.resolve();

        expect(save).toHaveBeenCalledTimes(2);
        expect(save).toHaveBeenNthCalledWith(2, preferences('latest'));

        second.resolve();
        await queue.flush();
        expect(statuses[statuses.length - 1]).toBe('saved');
    });

    it('keeps a failed snapshot pending and retries it', async () => {
        jest.useFakeTimers();
        const save = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
        const statuses: PreferenceSyncStatus[] = [];
        const queue = new ServerPreferenceSaveQueue(save, (status) => statuses.push(status), 10, 100);

        queue.enqueue(preferences('pending'), 0);
        await queue.flush();

        expect(statuses[statuses.length - 1]).toBe('unsynced');
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        await queue.flush();

        expect(save).toHaveBeenCalledTimes(2);
        expect(statuses[statuses.length - 1]).toBe('saved');
    });

    it('flushes only the latest snapshot after disposal while an older save is active', async () => {
        const first = deferred();
        const save = jest.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce(undefined);
        const queue = new ServerPreferenceSaveQueue(save, jest.fn());

        queue.enqueue(preferences('first'), 0);
        queue.enqueue(preferences('intermediate'));
        queue.dispose(preferences('final'));
        first.resolve();
        await first.promise;
        await Promise.resolve();
        await queue.flush();

        expect(save).toHaveBeenCalledTimes(2);
        expect(save).toHaveBeenNthCalledWith(2, preferences('final'));
    });
});
