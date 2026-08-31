import { createStore } from 'easy-peasy';
import files, { FileUploadData, ServerFileStore } from '@/state/server/files';

const upload = (name: string, abort = new AbortController()): FileUploadData => ({
    name,
    serverUuid: 'server-uuid',
    directory: '/',
    loaded: 0,
    total: 10,
    abort,
});

describe('server file uploads', () => {
    it('tracks duplicate filenames independently and cancels only the selected upload', () => {
        const store = createStore<ServerFileStore>(files);
        const firstAbort = new AbortController();
        const secondAbort = new AbortController();

        store.getActions().pushFileUpload({ id: 'first', data: upload('backup.tar.gz', firstAbort) });
        store.getActions().pushFileUpload({ id: 'second', data: upload('backup.tar.gz', secondAbort) });
        store.getActions().cancelFileUpload('first');

        expect(firstAbort.signal.aborted).toBe(true);
        expect(secondAbort.signal.aborted).toBe(false);
        expect(store.getState().uploads).toEqual({ second: expect.objectContaining({ name: 'backup.tar.gz' }) });
    });

    it('aborts every in-flight upload when the upload state is cleared', () => {
        const store = createStore<ServerFileStore>(files);
        const firstAbort = new AbortController();
        const secondAbort = new AbortController();

        store.getActions().pushFileUpload({ id: 'first', data: upload('first.txt', firstAbort) });
        store.getActions().pushFileUpload({ id: 'second', data: upload('second.txt', secondAbort) });
        store.getActions().clearFileUploads();

        expect(firstAbort.signal.aborted).toBe(true);
        expect(secondAbort.signal.aborted).toBe(true);
        expect(store.getState().uploads).toEqual({});
    });
});
