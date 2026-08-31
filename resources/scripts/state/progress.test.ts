import { createStore } from 'easy-peasy';
import progress from '@/state/progress';

describe('progress state', () => {
    it('waits for every concurrent request before completing', () => {
        const store = createStore(progress);

        store.getActions().startContinuous();
        store.getActions().startContinuous();
        store.getActions().setProgress(42);

        store.getActions().setComplete();
        expect(store.getState()).toMatchObject({ continuous: true, pending: 1, progress: 42 });

        store.getActions().setComplete();
        expect(store.getState()).toMatchObject({ continuous: false, pending: 0, progress: 100 });
    });

    it('ignores unmatched completions and resets a completed bar for the next request', () => {
        const store = createStore(progress);

        store.getActions().setComplete();
        expect(store.getState().pending).toBe(0);

        store.getActions().startContinuous();
        store.getActions().setProgress(25);
        store.getActions().setComplete();
        store.getActions().startContinuous();

        expect(store.getState()).toMatchObject({ continuous: true, pending: 1, progress: undefined });
    });
});
