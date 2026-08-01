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
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });
    const [current, setCurrent] = useState({ cpu: 0, memory: 0, tx: 0, rx: 0 });

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

            cpu.push(values.cpu_absolute);
            memory.push(memoryInMiB);
            network.push([tx, rx]);
            setCurrent({ cpu: values.cpu_absolute, memory: memoryInMiB, tx, rx });
        });

        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
    });

    return (
        <>
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
