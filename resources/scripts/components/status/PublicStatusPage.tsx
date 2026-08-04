import React from 'react';
import useSWR from 'swr';
import http from '@/api/http';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowRight,
    faCheckCircle,
    faExclamationTriangle,
    faHdd,
    faNetworkWired,
    faServer,
    faShieldAlt,
    faSignal,
    faTools,
} from '@fortawesome/free-solid-svg-icons';

interface NodeItem {
    id: number;
    name: string;
    status: 'operational' | 'maintenance' | 'unavailable';
}

interface StatusResponse {
    status: 'operational' | 'maintenance' | 'degraded';
    nodes: {
        total: number;
        operational: number;
        maintenance: number;
        unavailable: number;
        items: NodeItem[];
    };
    settings: {
        showNodes: boolean;
        mode: 'all' | 'operational_only' | 'summary_only';
    };
    checkedAt: string;
}

const Page = styled.main`
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 2.5rem 1rem;
    background: radial-gradient(circle at 18% 0%, rgba(var(--shell-accent-rgb), 0.16), transparent 35%),
        radial-gradient(circle at 82% 12%, rgba(var(--shell-accent-rgb), 0.08), transparent 30%), #0a0a0c;

    .status-shell {
        width: min(58rem, 100%);
        padding: clamp(1.5rem, 5vw, 3rem);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--shell-radius, 12px);
        background: linear-gradient(145deg, rgba(var(--shell-accent-rgb), 0.08), rgba(12, 12, 15, 0.94) 40%);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.035);
        backdrop-filter: blur(16px);
    }

    .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.85rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;

        &.operational {
            color: #4ade80;
            border: 1px solid rgba(74, 222, 128, 0.25);
            background: rgba(74, 222, 128, 0.08);
        }

        &.degraded {
            color: #f87171;
            border: 1px solid rgba(248, 113, 113, 0.25);
            background: rgba(248, 113, 113, 0.08);
        }

        &.maintenance {
            color: #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.25);
            background: rgba(251, 191, 36, 0.08);
        }

        &.checking {
            color: var(--shell-muted);
            border: 1px solid var(--shell-border);
            background: rgba(255, 255, 255, 0.035);
        }
    }

    .status-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
        margin-top: 2rem;
    }

    .status-card {
        padding: 1.25rem;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.02);
        transition: border-color 0.2s ease, transform 0.2s ease;

        &:hover {
            border-color: rgba(var(--shell-accent-rgb), 0.35);
            transform: translateY(-2px);
        }
    }

    .node-list {
        margin-top: 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
    }

    .node-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1.15rem;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.25);
        gap: 1rem;
    }

    .node-name {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    .status-error {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1.5rem;
        padding: 0.85rem 1rem;
        color: #fca5a5;
        border: 1px solid rgba(248, 113, 113, 0.2);
        border-radius: 8px;
        background: rgba(248, 113, 113, 0.06);
        font-size: 0.78rem;

        button {
            flex: 0 0 auto;
            padding: 0.35rem 0.65rem;
            color: var(--shell-text);
            border: 1px solid rgba(248, 113, 113, 0.24);
            border-radius: 6px;
            background: rgba(248, 113, 113, 0.1);
        }
    }

    .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.25rem 0.6rem;
        border-radius: 4px;

        &.badge-green {
            background: rgba(74, 222, 128, 0.12);
            color: #4ade80;
            border: 1px solid rgba(74, 222, 128, 0.2);
        }

        &.badge-red {
            background: rgba(248, 113, 113, 0.12);
            color: #f87171;
            border: 1px solid rgba(248, 113, 113, 0.2);
        }

        &.badge-yellow {
            background: rgba(251, 191, 36, 0.12);
            color: #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.2);
        }
    }

    @media (max-width: 640px) {
        .status-grid {
            grid-template-columns: 1fr;
        }

        .status-shell {
            padding: 1.25rem;
        }

        .node-row {
            align-items: flex-start;
        }

        .status-error {
            align-items: flex-start;
            flex-direction: column;
        }
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);
    const { data, error, mutate } = useSWR<StatusResponse>(
        '/api/public/status',
        (url) => http.get(url).then((response) => response.data),
        { refreshInterval: 60000 }
    );

    const isChecking = !data && !error;
    const isOperational = data?.status === 'operational';
    const isMaintenance = data?.status === 'maintenance';

    const pillClass = isChecking
        ? 'checking'
        : isOperational
        ? 'operational'
        : isMaintenance
        ? 'maintenance'
        : 'degraded';
    const statusIcon = isChecking
        ? faSignal
        : isOperational
        ? faCheckCircle
        : isMaintenance
        ? faTools
        : faExclamationTriangle;
    const statusLabel = isChecking
        ? 'Checking Systems'
        : error
        ? 'Status Check Failed'
        : isOperational
        ? 'All Systems Operational'
        : isMaintenance
        ? 'Scheduled Maintenance'
        : 'Service Degraded';

    if (!branding.statusEnabled) {
        return (
            <Page>
                <section className={'status-shell text-center'}>
                    <h1 className={'text-3xl font-semibold mb-3 text-neutral-100'}>Status Unavailable</h1>
                    <p className={'text-neutral-400 mb-6'}>Public status reporting is currently disabled.</p>
                    <Link to={'/'} className={'text-red-400 hover:text-red-300 no-underline transition-colors'}>
                        Return to Control Panel
                    </Link>
                </section>
            </Page>
        );
    }

    const nodeItems: NodeItem[] = data?.nodes?.items || [];
    const showNodeCards = data?.settings?.showNodes !== false && nodeItems.length > 0;

    return (
        <Page>
            <section className={'status-shell'}>
                <div className={`status-pill ${pillClass}`} aria-live={'polite'}>
                    <FontAwesomeIcon icon={statusIcon} /> {statusLabel}
                </div>

                <p className={'mt-8 text-xs font-semibold uppercase tracking-widest text-neutral-500'}>
                    {name} Infrastructure Health
                </p>
                <h1 className={'mt-2 text-3xl sm:text-4xl font-bold text-neutral-100'}>{branding.statusTitle}</h1>
                <p className={'mt-3 text-neutral-400 max-w-2xl leading-relaxed text-sm sm:text-base'}>
                    {branding.statusMessage}
                </p>

                {error && (
                    <div className={'status-error'} role={'alert'}>
                        <span>Live node data is temporarily unavailable. The panel will retry automatically.</span>
                        <button type={'button'} onClick={() => mutate()}>
                            Retry now
                        </button>
                    </div>
                )}

                <div className={'status-grid'}>
                    <div className={'status-card'}>
                        <FontAwesomeIcon icon={faServer} className={'text-red-400 text-lg mb-3'} />
                        <p className={'text-xs font-medium uppercase tracking-wider text-neutral-400'}>Control Panel</p>
                        <div className={'mt-2'}>
                            <span
                                className={`badge ${error ? 'badge-red' : isChecking ? 'badge-yellow' : 'badge-green'}`}
                            >
                                <FontAwesomeIcon icon={error ? faExclamationTriangle : faCheckCircle} />
                                {error ? 'Status API unavailable' : isChecking ? 'Checking' : 'Operational'}
                            </span>
                        </div>
                    </div>

                    <div className={'status-card'}>
                        <FontAwesomeIcon icon={faSignal} className={'text-red-400 text-lg mb-3'} />
                        <p className={'text-xs font-medium uppercase tracking-wider text-neutral-400'}>Active Nodes</p>
                        <div className={'mt-2'}>
                            <span className={`badge ${data?.nodes?.unavailable ? 'badge-red' : 'badge-green'}`}>
                                <FontAwesomeIcon
                                    icon={data?.nodes?.unavailable ? faExclamationTriangle : faCheckCircle}
                                />
                                {data ? `${data.nodes.operational}/${data.nodes.total} Online` : 'Checking...'}
                            </span>
                        </div>
                    </div>

                    <div className={'status-card'}>
                        <FontAwesomeIcon icon={faShieldAlt} className={'text-red-400 text-lg mb-3'} />
                        <p className={'text-xs font-medium uppercase tracking-wider text-neutral-400'}>
                            Node Maintenance
                        </p>
                        <div className={'mt-2'}>
                            <span className={`badge ${data?.nodes?.maintenance ? 'badge-yellow' : 'badge-green'}`}>
                                <FontAwesomeIcon icon={data?.nodes?.maintenance ? faTools : faCheckCircle} />
                                {data ? `${data.nodes.maintenance} Active` : 'Checking...'}
                            </span>
                        </div>
                    </div>
                </div>

                {showNodeCards && (
                    <div className={'mt-8'}>
                        <h2 className={'text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3'}>
                            Node Breakdown
                        </h2>
                        <div className={'node-list'}>
                            {nodeItems.map((node) => (
                                <div key={node.id} className={'node-row'}>
                                    <div className={'flex items-center gap-3'}>
                                        <FontAwesomeIcon
                                            icon={
                                                node.status === 'operational'
                                                    ? faHdd
                                                    : node.status === 'maintenance'
                                                    ? faTools
                                                    : faNetworkWired
                                            }
                                            className={
                                                node.status === 'operational'
                                                    ? 'text-green-400'
                                                    : node.status === 'maintenance'
                                                    ? 'text-yellow-400'
                                                    : 'text-red-400'
                                            }
                                        />
                                        <div className={'node-name'}>
                                            <p className={'text-sm font-medium text-neutral-200'}>{node.name}</p>
                                            <p className={'text-xs text-neutral-500'}>Infrastructure node</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span
                                            className={`badge ${
                                                node.status === 'operational'
                                                    ? 'badge-green'
                                                    : node.status === 'maintenance'
                                                    ? 'badge-yellow'
                                                    : 'badge-red'
                                            }`}
                                        >
                                            {node.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={'mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4'}>
                    <Link
                        to={'/'}
                        className={
                            'inline-flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 no-underline transition-colors'
                        }
                    >
                        Open Control Panel <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                    {data?.checkedAt && (
                        <span className={'text-xs text-neutral-500 font-mono'}>
                            Last checked: {new Date(data.checkedAt).toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </section>
        </Page>
    );
};
