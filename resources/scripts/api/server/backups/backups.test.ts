import http from '@/api/http';
import createServerBackup from '@/api/server/backups/createServerBackup';
import deleteBackup from '@/api/server/backups/deleteBackup';
import getBackupDownloadUrl from '@/api/server/backups/getBackupDownloadUrl';
import { restoreServerBackup } from '@/api/server/backups';
import { rawDataToServerBackup } from '@/api/transformers';

jest.mock('@/api/http', () => ({
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));
jest.mock('@/api/transformers', () => ({ rawDataToServerBackup: jest.fn((value) => ({ transformed: value })) }));

const mockedHttp = http as jest.Mocked<typeof http>;
const mockedTransform = rawDataToServerBackup as jest.Mock;

describe('server backup API workflows', () => {
    beforeEach(() => jest.clearAllMocks());

    it('creates a backup with the API field names and transforms the response', async () => {
        const response = { object: 'backup', attributes: { uuid: 'backup-a' } };
        mockedHttp.post.mockResolvedValue({ data: response });

        await expect(
            createServerBackup('server-a', { name: 'Nightly', ignored: '*.tmp', isLocked: true })
        ).resolves.toEqual({ transformed: response });
        expect(mockedHttp.post).toHaveBeenCalledWith('/api/client/servers/server-a/backups', {
            name: 'Nightly',
            ignored: '*.tmp',
            is_locked: true,
        });
        expect(mockedTransform).toHaveBeenCalledWith(response);
    });

    it('requests a download URL without swallowing a failed response', async () => {
        mockedHttp.get.mockResolvedValueOnce({ data: { attributes: { url: 'https://download.example.test/a' } } });
        await expect(getBackupDownloadUrl('server-a', 'backup-a')).resolves.toBe('https://download.example.test/a');

        const failure = new Error('link expired');
        mockedHttp.get.mockRejectedValueOnce(failure);
        await expect(getBackupDownloadUrl('server-a', 'backup-a')).rejects.toBe(failure);
    });

    it('forwards delete and restore operations and propagates failures for UI recovery', async () => {
        mockedHttp.delete.mockResolvedValueOnce({});
        mockedHttp.post.mockResolvedValueOnce({});

        await deleteBackup('server-a', 'backup-a');
        await restoreServerBackup('server-a', 'backup-a', true);

        expect(mockedHttp.delete).toHaveBeenCalledWith('/api/client/servers/server-a/backups/backup-a');
        expect(mockedHttp.post).toHaveBeenCalledWith('/api/client/servers/server-a/backups/backup-a/restore', {
            truncate: true,
        });

        const failure = new Error('backup is busy');
        mockedHttp.delete.mockRejectedValueOnce(failure);
        await expect(deleteBackup('server-a', 'backup-a')).rejects.toBe(failure);
    });
});
