import http from '@/api/http';
import getTelemetryHistory from '@/api/server/getTelemetryHistory';

jest.mock('@/api/http', () => ({
    __esModule: true,
    default: { get: jest.fn() },
}));

test('converts persisted telemetry and calculates network deltas', async () => {
    (http.get as jest.Mock).mockResolvedValue({
        data: {
            samples: [
                {
                    recorded_at: '2026-08-03T00:00:00Z',
                    cpu: '12.5',
                    memory: 1048576,
                    network_tx: 100,
                    network_rx: 200,
                },
                {
                    recorded_at: '2026-08-03T00:01:00Z',
                    cpu: '25',
                    memory: 2097152,
                    network_tx: 175,
                    network_rx: 350,
                },
            ],
        },
    });

    const result = await getTelemetryHistory('abc123', '1h');

    expect(http.get).toHaveBeenCalledWith('/api/client/servers/abc123/resources/history', {
        params: { range: '1h' },
    });
    expect(result).toEqual([
        expect.objectContaining({ cpu: 12.5, memory: 1, tx: 0, rx: 0 }),
        expect.objectContaining({ cpu: 25, memory: 2, tx: 75, rx: 150 }),
    ]);
});
