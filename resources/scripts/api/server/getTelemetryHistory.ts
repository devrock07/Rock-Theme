import http from '@/api/http';

export interface TelemetryPoint {
    t: number;
    cpu: number;
    memory: number;
    tx: number;
    rx: number;
}

export default (server: string, range: '1h' | '24h'): Promise<TelemetryPoint[]> =>
    http.get(`/api/client/servers/${server}/resources/history`, { params: { range } }).then(({ data }) => {
        let previous: { tx: number; rx: number } | undefined;
        return data.samples.map((sample: any) => {
            const tx = Number(sample.network_tx);
            const rx = Number(sample.network_rx);
            const point = {
                t: new Date(sample.recorded_at).getTime(),
                cpu: Number(sample.cpu),
                memory: Math.floor(Number(sample.memory) / 1024 / 1024),
                tx: previous ? Math.max(0, tx - previous.tx) : 0,
                rx: previous ? Math.max(0, rx - previous.rx) : 0,
            };
            previous = { tx, rx };
            return point;
        });
    });
