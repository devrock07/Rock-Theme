import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCircle, faEthernet, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import { MagicBentoCard } from '@/components/elements/reactbits/MagicBento';

const Card = styled(MagicBentoCard)`
    min-height: 14rem;
    border: 1px solid rgba(255, 255, 255, 0.085);
    border-radius: 12px;
    background: radial-gradient(circle at 92% 8%, rgba(201, 79, 89, 0.065), transparent 34%),
        linear-gradient(145deg, rgba(255, 255, 255, 0.025), rgba(14, 14, 16, 0.94) 48%, rgba(32, 9, 13, 0.3));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045), 0 18px 48px rgba(0, 0, 0, 0.12);
    transition: border-color 220ms ease, background 220ms ease, box-shadow 320ms ease;

    &:hover {
        border-color: rgba(240, 138, 144, 0.22);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.065), 0 24px 58px rgba(0, 0, 0, 0.18);
    }

    .card-link {
        display: flex;
        min-height: 14rem;
        flex-direction: column;
        padding: 1.25rem;
        color: var(--shell-text);
        text-decoration: none;
    }

    .micro {
        color: #77737f;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.61rem;
        letter-spacing: 0.09em;
        text-transform: uppercase;
    }

    .status {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--status-color);
        padding: 0.35rem 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.065);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.025);
    }

    .status svg {
        width: 0.38rem;
        height: 0.38rem;
        filter: drop-shadow(0 0 5px var(--status-color));
    }
    .allocation {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        margin-top: 0.5rem;
        color: var(--shell-muted);
        font-size: 0.72rem;
    }
    .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-top: auto;
        padding-top: 1.4rem;
    }
    .metrics > div {
        min-width: 0;
        padding: 0.65rem 0.7rem 0.7rem;
        border: 1px solid rgba(255, 255, 255, 0.055);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.018);
        transition: border-color 180ms ease, background 180ms ease;
    }
    &:hover .metrics > div {
        border-color: rgba(240, 138, 144, 0.09);
        background: rgba(201, 79, 89, 0.025);
    }
    .metric-value {
        margin-top: 0.35rem;
        color: #d8d6dd;
        font-size: 0.8rem;
    }
    .rail {
        height: 2px;
        margin-top: 0.6rem;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
    }
    .rail > span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: #c94f59;
        box-shadow: 0 0 8px rgba(240, 138, 144, 0.42);
    }
    .footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 1.15rem;
        padding-top: 0.8rem;
        border-top: 1px solid var(--shell-border);
    }
    .manage {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        min-height: 2rem;
        padding: 0 0.75rem;
        color: #e8c5c8;
        border: 1px solid rgba(240, 138, 144, 0.24);
        border-radius: 7px;
        background: rgba(201, 79, 89, 0.09);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.61rem;
        font-weight: 650;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        transition: color 180ms ease, border-color 180ms ease, background 180ms ease, transform 180ms ease;
    }
    &:hover .manage {
        color: white;
        border-color: rgba(240, 138, 144, 0.4);
        background: rgba(201, 79, 89, 0.16);
        transform: translateX(2px);
    }

    @media (max-width: 480px) {
        min-height: 13rem;

        .card-link {
            min-height: 13rem;
            padding: 1rem;
        }

        .metrics {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.55rem;
            padding-top: 1.1rem;
        }

        .micro {
            font-size: 0.56rem;
        }

        .metric-value {
            font-size: 0.73rem;
        }
    }
`;

type Timer = ReturnType<typeof setInterval>;

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [stats, setStats] = useState<ServerStats | null>(null);
    const isSuspended = stats?.isSuspended || server.status === 'suspended';

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then(setStats)
            .catch((error) => console.error(error));

    useEffect(() => {
        if (isSuspended || server.isNodeUnderMaintenance) return;
        getStats().then(() => {
            interval.current = setInterval(getStats, 30000);
        });
        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended, server.isNodeUnderMaintenance]);

    const statusLabel = isSuspended
        ? 'Suspended'
        : server.isNodeUnderMaintenance
        ? 'Maintenance'
        : server.isTransferring
        ? 'Transferring'
        : server.status === 'installing'
        ? 'Installing'
        : stats?.status || 'Offline';
    const color =
        stats?.status === 'running'
            ? 'var(--shell-success)'
            : stats?.status === 'starting'
            ? 'var(--shell-warning)'
            : 'var(--shell-danger)';
    const metric = (value: number, limit: number, fallback: number) =>
        Math.min(100, limit > 0 ? (value / mbToBytes(limit)) * 100 : (value / mbToBytes(fallback)) * 100);

    return (
        <Card
            className={className}
            glowColor={'201, 79, 89'}
            particleCount={6}
            enableStars
            enableTilt
            enableMagnetism
            clickEffect
            style={{ '--status-color': color } as React.CSSProperties}
        >
            <Link to={`/server/${server.id}`} className={'card-link'}>
                <div className={'flex items-start justify-between gap-4'}>
                    <div className={'min-w-0'}>
                        <p className={'micro mb-2'}>
                            {server.node} / {server.identifier}
                        </p>
                        <h3 className={'text-lg font-medium truncate'}>{server.name}</h3>
                    </div>
                    <span className={'micro status'}>
                        <FontAwesomeIcon icon={faCircle} /> {statusLabel}
                    </span>
                </div>
                <div className={'allocation'}>
                    <FontAwesomeIcon icon={faEthernet} />
                    {server.allocations
                        .filter((allocation) => allocation.isDefault)
                        .map((allocation) => (
                            <React.Fragment key={allocation.ip + allocation.port}>
                                {allocation.alias || ip(allocation.ip)}:{allocation.port}
                            </React.Fragment>
                        ))}
                </div>
                {!stats || isSuspended || server.isNodeUnderMaintenance ? (
                    <div className={'flex flex-1 items-center justify-center'}>
                        {!stats && !isSuspended && !server.isNodeUnderMaintenance ? (
                            <Spinner size={'small'} />
                        ) : (
                            <p className={'micro'}>Telemetry unavailable</p>
                        )}
                    </div>
                ) : (
                    <div className={'metrics'}>
                        <div>
                            <p className={'micro'}>CPU</p>
                            <p className={'metric-value'}>{stats.cpuUsagePercent.toFixed(1)}%</p>
                            <div className={'rail'}>
                                <span style={{ width: `${Math.min(100, stats.cpuUsagePercent)}%` }} />
                            </div>
                        </div>
                        <div>
                            <p className={'micro'}>Memory</p>
                            <p className={'metric-value'}>{bytesToString(stats.memoryUsageInBytes)}</p>
                            <div className={'rail'}>
                                <span
                                    style={{
                                        width: `${metric(stats.memoryUsageInBytes, server.limits.memory, 16384)}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <p className={'micro'}>Storage</p>
                            <p className={'metric-value'}>{bytesToString(stats.diskUsageInBytes)}</p>
                            <div className={'rail'}>
                                <span
                                    style={{ width: `${metric(stats.diskUsageInBytes, server.limits.disk, 65536)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className={'footer micro'}>
                    <span className={'manage'}>
                        <FontAwesomeIcon icon={faSlidersH} />
                        Manage server
                        <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                </div>
            </Link>
        </Card>
    );
};
