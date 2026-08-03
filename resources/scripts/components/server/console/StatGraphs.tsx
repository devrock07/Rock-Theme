import React, { useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { Line } from 'react-chartjs-2';
import { useChart, useChartTickLabel } from '@/components/server/console/chart';
import { hexToRgba } from '@/lib/helpers';
import { bytesToString } from '@/lib/formatters';
import { CloudDownloadIcon, CloudUploadIcon } from '@heroicons/react/solid';
import { theme } from 'twin.macro';
import ChartBlock from '@/components/server/console/ChartBlock';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { unstable_batchedUpdates } from 'react-dom';

export default () => {
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });
    const [current, setCurrent] = useState({ cpu: 0, memory: 0, tx: 0, rx: 0 });
    const [range, setRange] = useState<'live' | '1h' | '24h'>('live');
    const historyKey = `rock:telemetry:${serverId}`;
    const history = useRef<Array<{ t: number; cpu: number; memory: number; tx: number; rx: number }>>([]);
    const lastStored = useRef(0);
    const lastSampled = useRef(0);

    const cpu = useChartTickLabel('CPU', limits.cpu, '%', 2);
    const memory = useChartTickLabel('Memory', limits.memory, 'MiB');
    const network = useChart('Network', {
        sets: 2,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value);
                        },
                    },
                },
            },
        },
        callback(opts, index) {
            return {
                ...opts,
                label: !index ? 'Network In' : 'Network Out',
                borderColor: !index ? theme('colors.primary.300') : theme('colors.primary.500'),
                backgroundColor: hexToRgba(
                    !index ? theme('colors.primary.700') : theme('colors.primary.800'),
                    !index ? 0.38 : 0.28
                ),
            };
        },
    });

    useEffect(() => {
        try {
            history.current = JSON.parse(localStorage.getItem(historyKey) || '[]').filter(
                (point: { t: number }) => point.t > Date.now() - 86400000
            );
        } catch (_) {
            history.current = [];
        }
    }, [historyKey]);

    useEffect(() => {
        if (range === 'live') return;
        const since = Date.now() - (range === '1h' ? 3600000 : 86400000);
        const points = history.current.filter((point) => point.t >= since);
        const sampled = points
            .filter((_, index) => index % Math.max(1, Math.ceil(points.length / 20)) === 0)
            .slice(-20);
        cpu.replace([sampled.map((point) => point.cpu)]);
        memory.replace([sampled.map((point) => point.memory)]);
        network.replace([sampled.map((point) => point.tx), sampled.map((point) => point.rx)]);
    }, [range]);

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            memory.clear();
            network.clear();
            previous.current = { tx: -1, rx: -1 };
            setCurrent({ cpu: 0, memory: 0, tx: 0, rx: 0 });
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }
        unstable_batchedUpdates(() => {
            const tx = previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx);
            const rx = previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx);
            const memoryInMiB = Math.floor(values.memory_bytes / 1024 / 1024);

            const now = Date.now();
            if (now - lastSampled.current >= 10000) {
                lastSampled.current = now;
                const point = { t: now, cpu: values.cpu_absolute, memory: memoryInMiB, tx, rx };
                history.current = [...history.current.filter((entry) => entry.t > now - 86400000), point];
                if (now - lastStored.current > 30000) {
                    lastStored.current = now;
                    localStorage.setItem(historyKey, JSON.stringify(history.current));
                }
            }
            if (range === 'live') {
                cpu.push(values.cpu_absolute);
                memory.push(memoryInMiB);
                network.push([tx, rx]);
            }
            setCurrent({ cpu: values.cpu_absolute, memory: memoryInMiB, tx, rx });
        });

        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
    });

    return (
        <>
            <div className={'col-span-full flex items-center justify-between mb-1'}>
                <p className={'text-2xs uppercase tracking-widest text-neutral-500'}>Resource history</p>
                <div className={'flex gap-1'}>
                    {(['live', '1h', '24h'] as const).map((value) => (
                        <button
                            key={value}
                            onClick={() => setRange(value)}
                            className={`px-3 py-1 rounded-full text-xs border ${
                                range === value
                                    ? 'border-primary-400 text-primary-200 bg-primary-900'
                                    : 'border-neutral-700 text-neutral-500'
                            }`}
                        >
                            {value === 'live' ? 'Live' : value.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            <ChartBlock title={'CPU Load'} value={`${current.cpu.toFixed(1)}%`} tone={'rose'}>
                <Line {...cpu.props} />
            </ChartBlock>
            <ChartBlock title={'Memory'} value={`${current.memory} MiB`} tone={'crimson'}>
                <Line {...memory.props} />
            </ChartBlock>
            <ChartBlock
                title={'Network'}
                tone={'ember'}
                value={bytesToString(current.tx + current.rx)}
                legend={
                    <>
                        <Tooltip arrow content={'Inbound'}>
                            <CloudDownloadIcon className={'mr-2 w-4 h-4 text-primary-300'} />
                        </Tooltip>
                        <Tooltip arrow content={'Outbound'}>
                            <CloudUploadIcon className={'w-4 h-4 text-primary-500'} />
                        </Tooltip>
                    </>
                }
            >
                <Line {...network.props} />
            </ChartBlock>
        </>
    );
};
