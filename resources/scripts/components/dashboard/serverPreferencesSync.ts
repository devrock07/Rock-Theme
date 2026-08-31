import { ServerPreference } from '@/api/account/rockData';

export type ServerPreferences = Record<string, ServerPreference>;
export type PreferenceSyncStatus = 'loading' | 'saved' | 'saving' | 'unsynced';
export type DirtyPreferenceFields = Record<string, Partial<Record<keyof ServerPreference, true>>>;

const clonePreferences = (preferences: ServerPreferences): ServerPreferences =>
    Object.keys(preferences).reduce<ServerPreferences>((copy, serverId) => {
        copy[serverId] = { ...preferences[serverId] };
        return copy;
    }, {});

const snapshotKey = (preferences: ServerPreferences) =>
    JSON.stringify(
        Object.keys(preferences)
            .sort()
            .map((serverId) => [serverId, !!preferences[serverId].favorite, preferences[serverId].group || ''])
    );

export const allPreferenceFieldsDirty = (preferences: ServerPreferences): DirtyPreferenceFields =>
    Object.keys(preferences).reduce<DirtyPreferenceFields>((dirty, serverId) => {
        dirty[serverId] = { favorite: true, group: true };
        return dirty;
    }, {});

export const hasDirtyPreferenceFields = (dirty: DirtyPreferenceFields) =>
    Object.values(dirty).some((fields) => !!fields.favorite || !!fields.group);

export const mergeHydratedServerPreferences = (
    remote: ServerPreferences,
    local: ServerPreferences,
    dirty: DirtyPreferenceFields
): ServerPreferences => {
    const merged = { ...clonePreferences(local), ...clonePreferences(remote) };

    Object.keys(dirty).forEach((serverId) => {
        const localPreference = local[serverId];
        if (!localPreference) return;

        const next = { ...(merged[serverId] || { favorite: false, group: '' }) };
        if (dirty[serverId].favorite) next.favorite = localPreference.favorite;
        if (dirty[serverId].group) next.group = localPreference.group;
        merged[serverId] = next;
    });

    return merged;
};

export class ServerPreferenceSaveQueue {
    private pending?: { preferences: ServerPreferences; key: string };
    private inFlight?: Promise<void>;
    private inFlightKey?: string;
    private lastSavedKey?: string;
    private debounceTimer?: number;
    private retryTimer?: number;
    private disposed = false;

    constructor(
        private readonly save: (preferences: ServerPreferences) => Promise<void>,
        private readonly onStatus: (status: PreferenceSyncStatus) => void,
        private readonly debounceMs = 500,
        private readonly retryMs = 5000
    ) {}

    seed(preferences: ServerPreferences) {
        this.clearTimers();
        this.pending = undefined;
        this.lastSavedKey = snapshotKey(preferences);
        this.onStatus('saved');
    }

    enqueue(preferences: ServerPreferences, delay = this.debounceMs) {
        if (this.disposed) return;
        if (!this.stage(preferences)) {
            if (!this.inFlight) this.onStatus('saved');
            return;
        }

        this.onStatus('unsynced');
        window.clearTimeout(this.retryTimer);
        window.clearTimeout(this.debounceTimer);
        if (this.inFlight) return;

        if (delay <= 0) {
            void this.flush();
            return;
        }

        this.debounceTimer = window.setTimeout(() => void this.flush(), delay);
    }

    retry() {
        if (this.disposed) return;
        window.clearTimeout(this.retryTimer);
        void this.flush();
    }

    flushLatest(preferences: ServerPreferences) {
        if (!this.stage(preferences)) return this.inFlight || Promise.resolve();
        this.onStatus('unsynced');
        return this.flush();
    }

    flush(): Promise<void> {
        window.clearTimeout(this.debounceTimer);
        window.clearTimeout(this.retryTimer);
        if (this.inFlight) return this.inFlight;
        if (!this.pending) return Promise.resolve();

        const snapshot = this.pending;
        this.pending = undefined;
        this.inFlightKey = snapshot.key;
        this.onStatus('saving');
        this.inFlight = this.performSave(snapshot);
        return this.inFlight;
    }

    dispose(preferences: ServerPreferences) {
        this.disposed = true;
        this.clearTimers();
        this.stage(preferences);
        void this.flush();
    }

    private stage(preferences: ServerPreferences) {
        const copy = clonePreferences(preferences);
        const key = snapshotKey(copy);

        if (key === this.inFlightKey) {
            this.pending = undefined;
            return false;
        }
        if (!this.inFlight && key === this.lastSavedKey) {
            this.pending = undefined;
            return false;
        }

        this.pending = { preferences: copy, key };
        return true;
    }

    private async performSave(snapshot: { preferences: ServerPreferences; key: string }) {
        try {
            await this.save(snapshot.preferences);
            this.lastSavedKey = snapshot.key;
            this.inFlight = undefined;
            this.inFlightKey = undefined;

            if (this.pending) {
                await this.flush();
            } else {
                this.onStatus('saved');
            }
        } catch (_) {
            this.inFlight = undefined;
            this.inFlightKey = undefined;
            if (!this.pending) this.pending = snapshot;
            this.onStatus('unsynced');

            if (this.disposed) {
                if (this.pending.key !== snapshot.key) await this.flush();
                return;
            }

            this.retryTimer = window.setTimeout(() => void this.flush(), this.retryMs);
        }
    }

    private clearTimers() {
        window.clearTimeout(this.debounceTimer);
        window.clearTimeout(this.retryTimer);
    }
}
