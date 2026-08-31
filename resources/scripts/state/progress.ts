import { action, Action } from 'easy-peasy';

export interface ProgressStore {
    continuous: boolean;
    pending: number;
    progress?: number;

    startContinuous: Action<ProgressStore>;
    setProgress: Action<ProgressStore, number | undefined>;
    setComplete: Action<ProgressStore>;
}

const progress: ProgressStore = {
    continuous: false,
    pending: 0,
    progress: undefined,

    startContinuous: action((state) => {
        state.pending += 1;

        if (state.pending > 1) return;

        state.continuous = true;
        if (state.progress === 100) state.progress = undefined;
    }),

    setProgress: action((state, payload) => {
        state.progress = payload;
    }),

    setComplete: action((state) => {
        if (state.pending === 0) return;

        state.pending -= 1;
        if (state.pending > 0) return;

        if (state.progress) state.progress = 100;
        state.continuous = false;
    }),
};

export default progress;
