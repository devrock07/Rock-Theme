import { action, Action } from 'easy-peasy';
import { cleanDirectoryPath } from '@/helpers';

export interface FileUploadData {
    name: string;
    serverUuid: string;
    directory: string;
    loaded: number;
    readonly abort: AbortController;
    readonly total: number;
}

export interface ServerFileStore {
    directory: string;
    selectedFiles: string[];
    uploads: Record<string, FileUploadData>;

    setDirectory: Action<ServerFileStore, string>;
    setSelectedFiles: Action<ServerFileStore, string[]>;
    appendSelectedFile: Action<ServerFileStore, string>;
    removeSelectedFile: Action<ServerFileStore, string>;

    pushFileUpload: Action<ServerFileStore, { id: string; data: FileUploadData }>;
    setUploadProgress: Action<ServerFileStore, { id: string; loaded: number }>;
    clearFileUploads: Action<ServerFileStore>;
    removeFileUpload: Action<ServerFileStore, string>;
    cancelFileUpload: Action<ServerFileStore, string>;
}

const files: ServerFileStore = {
    directory: '/',
    selectedFiles: [],
    uploads: {},

    setDirectory: action((state, payload) => {
        state.directory = cleanDirectoryPath(payload);
    }),

    setSelectedFiles: action((state, payload) => {
        state.selectedFiles = payload;
    }),

    appendSelectedFile: action((state, payload) => {
        state.selectedFiles = state.selectedFiles.filter((f) => f !== payload).concat(payload);
    }),

    removeSelectedFile: action((state, payload) => {
        state.selectedFiles = state.selectedFiles.filter((f) => f !== payload);
    }),

    clearFileUploads: action((state) => {
        Object.values(state.uploads).forEach((upload) => upload.abort.abort());

        state.uploads = {};
    }),

    pushFileUpload: action((state, payload) => {
        state.uploads[payload.id] = payload.data;
    }),

    setUploadProgress: action((state, { id, loaded }) => {
        if (state.uploads[id]) {
            state.uploads[id].loaded = loaded;
        }
    }),

    removeFileUpload: action((state, payload) => {
        if (state.uploads[payload]) {
            delete state.uploads[payload];
        }
    }),

    cancelFileUpload: action((state, payload) => {
        if (state.uploads[payload]) {
            // Abort the request if it is still in flight. If it already completed this is
            // a no-op.
            state.uploads[payload].abort.abort();

            delete state.uploads[payload];
        }
    }),
};

export default files;
