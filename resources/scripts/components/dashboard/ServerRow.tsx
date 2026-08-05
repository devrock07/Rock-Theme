import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBolt, faCircle, faEthernet, faSlidersH, faStar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import { MagicBentoCard } from '@/components/elements/reactbits/MagicBento';
import { pushRockNotification } from '@/components/notifications/rockNotifications';

const Card = styled(MagicBentoCard)`
    min-height: 14rem;
    border: 1px solid rgba(255, 255, 255, 0.085);
    border-radius: 12px;
    background: radial-gradient(circle at 92% 8%, rgba(var(--shell-accent-rgb), 0.065), transparent 34%),
        linear-gradient(145deg, rgba(255, 255, 255, 0.025), var(--shell-panel) 48%, rgba(var(--shell-accent-rgb), 0.08));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045), 0 18px 48px rgba(0, 0, 0, 0.12);
    transition: border-color 220ms ease, background 220ms ease, box-shadow 320ms ease;

    &:hover {
        border-color: rgba(var(--shell-accent-rgb), 0.22);
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

    .server-title {
        color: var(--shell-text);
        text-decoration: none;
    }
    .server-title:hover {
        color: var(--shell-accent-bright);
    }
    .card-actions {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .icon-button {
        display: grid;
        width: 2rem;
        height: 2rem;
        place-items: center;
        color: #77737f;
        border: 1px solid var(--shell-border);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.025);
    }
    .icon-button:hover,
    .icon-button.active {
        color: var(--shell-accent-bright);
        border-color: rgba(var(--shell-accent-rgb), 0.3);
        background: rgba(var(--shell-accent-rgb), 0.1);
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
        border-color: rgba(var(--shell-accent-rgb), 0.09);
        background: rgba(var(--shell-accent-rgb), 0.025);
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
        background: var(--shell-accent);
        box-shadow: 0 0 8px rgba(var(--shell-accent-rgb), 0.42);
    }
    .footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.55rem;
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
        color: var(--shell-accent-bright);
        border: 1px solid rgba(var(--shell-accent-rgb), 0.24);
        border-radius: 7px;
        background: rgba(var(--shell-accent-rgb), 0.09);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.61rem;
        font-weight: 650;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        transition: color 180ms ease, border-color 180ms ease, background 180ms ease, transform 180ms ease;
    }
    &:hover .manage {
        color: white;
        border-color: rgba(var(--shell-accent-rgb), 0.4);
        background: rgba(var(--shell-accent-rgb), 0.16);
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

interface Props {
    server: Server;
    className?: string;
    favorite?: boolean;
    onToggleFavorite?: () => void;
    onOpenQuick?: (server: Server, stats: ServerStats | null) => void;
}

export default ({ server, className, favorite = false, onToggleFavorite, onOpenQuick }: Props) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const previousStatus = useRef<string>();
    const lastHighCpuAlert = useRef(0);
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

    useEffect(() => {
        if (!stats) return;
        if (previousStatus.current && previousStatus.current !== stats.status) {
            pushRockNotification({
                title: server.name,
                message: `Server changed from ${previousStatus.current} to ${stats.status}.`,
                tone: stats.status === 'offline' ? 'danger' : 'success',
                href: `/server/${server.id}`,
            });
        }
        previousStatus.current = stats.status;
        if (stats.cpuUsagePercent >= 90 && Date.now() - lastHighCpuAlert.current > 15 * 60 * 1000) {
            lastHighCpuAlert.current = Date.now();
            pushRockNotification({
                title: `${server.name} resource alert`,
                message: `CPU usage reached ${stats.cpuUsagePercent.toFixed(1)}%.`,
                tone: 'warning',
                href: `/server/${server.id}`,
            });
        }
    }, [stats?.status, stats?.cpuUsagePercent]);

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
            glowColor={'var(--shell-accent-rgb)'}
            particleCount={6}
            enableStars
            enableTilt
            enableMagnetism
            clickEffect={false}
            style={{ '--status-color': color } as React.CSSProperties}
        >
            <div className={'card-link'}>
                <div className={'flex items-start justify-between gap-4'}>
                    <div className={'min-w-0'}>
                        <Link className={'server-title'} to={`/server/${server.id}`}>
                            <h3 className={'text-lg font-medium truncate'}>{server.name}</h3>
                        </Link>
                    </div>
                    <div className={'card-actions'}>
                        <button
                            className={`icon-button ${favorite ? 'active' : ''}`}
                            onClick={onToggleFavorite}
                            aria-label={favorite ? 'Remove favorite' : 'Add favorite'}
                        >
                            <FontAwesomeIcon icon={faStar} />
                        </button>
                        <span className={'micro status'}>
                            <FontAwesomeIcon icon={faCircle} /> {statusLabel}
                        </span>
                    </div>
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
                    <button className={'manage'} onClick={() => onOpenQuick?.(server, stats)}>
                        <FontAwesomeIcon icon={faBolt} /> Quick view
                    </button>
                    <Link className={'manage'} to={`/server/${server.id}`}>
                        <FontAwesomeIcon icon={faSlidersH} />
                        Manage server
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
            </div>
        </Card>
    );
};
