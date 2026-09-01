import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import UploadButton, { containsDirectory } from '@/components/server/files/UploadButton';
import axios from 'axios';
import getFileUploadUrl from '@/api/server/files/getFileUploadUrl';

jest.mock('axios', () => ({
    __esModule: true,
    default: { post: jest.fn(), isCancel: jest.fn(() => false) },
}));
jest.mock('@/api/server/files/getFileUploadUrl', () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock('@/state/server', () => ({
    __testMocks: {
        pushFileUpload: jest.fn(),
        removeFileUpload: jest.fn(),
        setUploadProgress: jest.fn(),
    },
    ServerContext: {
        useStoreState: (selector: (state: unknown) => unknown) =>
            selector({ server: { data: { uuid: 'server-uuid' } }, files: { directory: '/backups' } }),
        useStoreActions: (selector: (actions: unknown) => unknown) => {
            const mocks = jest.requireMock('@/state/server').__testMocks;
            return selector({
                files: {
                    pushFileUpload: mocks.pushFileUpload,
                    removeFileUpload: mocks.removeFileUpload,
                    setUploadProgress: mocks.setUploadProgress,
                },
            });
        },
    },
}));
jest.mock('@/plugins/useFileManagerSwr', () => ({
    __esModule: true,
    __testMutate: jest.fn(() => Promise.resolve()),
    default: () => ({ mutate: jest.requireMock('@/plugins/useFileManagerSwr').__testMutate }),
}));
jest.mock('@/plugins/useFlash', () => ({
    __testMocks: { addError: jest.fn(), clearAndAddHttpError: jest.fn() },
    useFlashKey: () => {
        const mocks = jest.requireMock('@/plugins/useFlash').__testMocks;
        return { addError: mocks.addError, clearAndAddHttpError: mocks.clearAndAddHttpError };
    },
}));
jest.mock('@/plugins/useEventListener', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@preact/signals-react', () => ({ useSignal: (value: unknown) => ({ value }) }));
jest.mock('@/components/elements/Portal', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);
jest.mock('@/components/elements/Fade', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);
jest.mock('@/components/elements/Modal', () => ({
    ModalMask: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/elements/button/index', () => ({
    Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button type={'button'} {...props} />,
}));
jest.mock('twin.macro', () => ({ __esModule: true, default: () => '' }));

const mockAxiosPost = axios.post as jest.Mock;
const mockGetFileUploadUrl = getFileUploadUrl as jest.Mock;
const serverMocks = jest.requireMock('@/state/server').__testMocks;
const mockPushFileUpload = serverMocks.pushFileUpload as jest.Mock;
const mockRemoveFileUpload = serverMocks.removeFileUpload as jest.Mock;
const mockSetUploadProgress = serverMocks.setUploadProgress as jest.Mock;
const mockMutate = jest.requireMock('@/plugins/useFileManagerSwr').__testMutate as jest.Mock;
const flashMocks = jest.requireMock('@/plugins/useFlash').__testMocks;
const mockAddError = flashMocks.addError as jest.Mock;
const mockClearAndAddHttpError = flashMocks.clearAndAddHttpError as jest.Mock;

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('UploadButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetFileUploadUrl.mockResolvedValue('https://uploads.example.test');
        mockAxiosPost.mockResolvedValue({});
    });

    it('tracks simultaneous duplicate filenames independently and refreshes after success', async () => {
        const { container } = render(<UploadButton />);
        const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
        const first = new File(['one'], 'backup.tar.gz', { type: 'application/gzip' });
        const second = new File(['two'], 'backup.tar.gz', { type: 'application/gzip' });

        fireEvent.change(input, { target: { files: [first, second] } });

        expect(mockPushFileUpload).toHaveBeenCalledTimes(2);
        const firstUpload = mockPushFileUpload.mock.calls[0][0];
        const secondUpload = mockPushFileUpload.mock.calls[1][0];
        expect(firstUpload.id).not.toBe(secondUpload.id);
        expect(firstUpload.data).toEqual(
            expect.objectContaining({ name: 'backup.tar.gz', serverUuid: 'server-uuid', directory: '/backups' })
        );

        await waitFor(() => expect(mockAxiosPost).toHaveBeenCalledTimes(2));
        mockAxiosPost.mock.calls[0][2].onUploadProgress({ loaded: 2, total: 3 });
        expect(mockSetUploadProgress).toHaveBeenCalledWith({ id: firstUpload.id, loaded: 2 });
        await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    });

    it('allows legitimate empty files without mistaking them for folders', async () => {
        const { container } = render(<UploadButton />);
        const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
        const emptyFile = new File([], '.env');

        fireEvent.change(input, { target: { files: [emptyFile] } });

        await waitFor(() => expect(mockGetFileUploadUrl).toHaveBeenCalledWith('server-uuid'));
        expect(mockPushFileUpload).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ name: '.env', total: 0 }) })
        );
        expect(mockAddError).not.toHaveBeenCalled();
    });

    it('detects dropped directories from the browser drag entry metadata', () => {
        const items = [
            {
                webkitGetAsEntry: () => ({ isDirectory: true }),
            },
        ] as unknown as DataTransferItemList;

        expect(containsDirectory(items)).toBe(true);
        expect(containsDirectory(null)).toBe(false);
    });

    it('removes a cancelled upload without reporting it as an HTTP failure', async () => {
        let rejectUpload!: (error: Error) => void;
        mockAxiosPost.mockReturnValue(
            new Promise((_resolve, reject) => {
                rejectUpload = reject;
            })
        );
        const { container } = render(<UploadButton />);
        const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;

        fireEvent.change(input, { target: { files: [new File(['data'], 'large.zip')] } });
        await waitFor(() => expect(mockPushFileUpload).toHaveBeenCalled());
        const upload = mockPushFileUpload.mock.calls[0][0];
        await waitFor(() => expect(mockAxiosPost).toHaveBeenCalled());

        upload.data.abort.abort();
        rejectUpload(new Error('cancelled'));
        await flushPromises();

        expect(mockRemoveFileUpload).toHaveBeenCalledWith(upload.id);
        expect(mockClearAndAddHttpError).not.toHaveBeenCalledWith(expect.any(Error));
        expect(mockMutate).not.toHaveBeenCalled();
    });
});
