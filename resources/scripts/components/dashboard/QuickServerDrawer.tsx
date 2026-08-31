import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBolt, faCopy, faPlay, faRedo, faStop, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Server } from '@/api/server/getServer';
import { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip } from '@/lib/formatters';
import http from '@/api/http';
import copy from 'copy-to-clipboard';

const Shell = styled.div`
    position: fixed;
    inset: 0;
    z-index: 160;
    display: flex;
    justify-content: flex-end;
    background: rgba(2, 2, 3, 0.58);
    backdrop-filter: blur(5px);

    aside {
        width: min(29rem, 100%);
        height: 100%;
        padding: 1.35rem;
        overflow-y: auto;
        border-left: 1px solid var(--shell-border-strong);
        background: linear-gradient(155deg, rgba(var(--shell-accent-rgb), 0.1), var(--shell-panel-strong) 34%);
        box-shadow: -30px 0 80px rgba(0, 0, 0, 0.45);
        animation: drawer-in 240ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .drawer-card {
        padding: 1rem;
        border: 1px solid var(--shell-border);
        border-radius: var(--shell-radius);
        background: rgba(255, 255, 255, 0.025);
    }
    .drawer-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.55rem;
        margin-top: 1rem;
    }
    .drawer-grid > div {
        padding: 0.75rem;
        border: 1px solid var(--shell-border);
        border-radius: calc(var(--shell-radius) - 3px);
    }
    .power-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.55rem;
    }
    .power-grid button {
        min-height: 2.5rem;
        border: 1px solid rgba(var(--shell-accent-rgb), 0.28);
        border-radius: 8px;
        background: rgba(var(--shell-accent-rgb), 0.09);
        color: var(--shell-text);
    }
    .power-grid button:disabled {
        opacity: 0.45;
    }
    @media (max-width: 420px) {
        aside {
            padding: 1rem;
        }
        .drawer-grid,
        .power-grid {
            grid-template-columns: 1fr;
        }
    }
    @keyframes drawer-in {
        from {
            transform: translateX(2rem);
            opacity: 0;
        }
    }
`;

interface Props {
    server: Server;
    stats: ServerStats | null;
    group: string;
    onGroupChange: (group: string) => void;
    onClose: () => void;
}

export default ({ server, stats, group, onGroupChange, onClose }: Props) => {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const closeButton = useRef<HTMLButtonElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const allocation = server.allocations.find((candidate) => candidate.isDefault);
    const address = allocation ? `${allocation.alias || ip(allocation.ip)}:${allocation.port}` : '';
    const power = (signal: 'start' | 'restart' | 'stop') => {
        setBusy(true);
        setMessage('');
        http.post(`/api/client/servers/${server.id}/power`, { signal })
            .then(() => setMessage(`${signal[0].toUpperCase()}${signal.slice(1)} signal sent.`))
            .catch(() => setMessage('Power action unavailable for this account.'))
            .finally(() => setBusy(false));
    };

    useEffect(() => {
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeButton.current?.focus();
        const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onCloseRef.current();
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

    return createPortal(
        <Shell
            role={'dialog'}
            aria-modal={'true'}
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <aside>
                <div className={'flex items-center justify-between mb-8'}>
                    <span className={'text-xs uppercase tracking-widest text-neutral-500'}>
                        <FontAwesomeIcon icon={faBolt} className={'mr-2'} />
                        Quick control
                    </span>
                    <button ref={closeButton} type={'button'} onClick={onClose} aria-label={'Close quick control'}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <h2 className={'text-3xl truncate'}>{server.name}</h2>
                <button
                    type={'button'}
                    className={'mt-2 text-sm text-neutral-400'}
                    disabled={!address}
                    onClick={() => {
                        copy(address);
                        setMessage('Address copied.');
                    }}
                >
                    {address} <FontAwesomeIcon icon={faCopy} className={'ml-2'} />
                </button>
                <div className={'drawer-grid'}>
                    <div>
                        <small className={'text-neutral-500'}>CPU</small>
                        <p>{stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '—'}</p>
                    </div>
                    <div>
                        <small className={'text-neutral-500'}>Memory</small>
                        <p>{stats ? bytesToString(stats.memoryUsageInBytes) : '—'}</p>
                    </div>
                    <div>
                        <small className={'text-neutral-500'}>Disk</small>
                        <p>{stats ? bytesToString(stats.diskUsageInBytes) : '—'}</p>
                    </div>
                </div>
                <div className={'drawer-card mt-5'}>
                    <label htmlFor={'server-group'} className={'text-xs uppercase tracking-widest text-neutral-500'}>
                        Server group
                    </label>
                    <input
                        id={'server-group'}
                        className={'mt-2 w-full rounded border border-neutral-700 px-3 py-2'}
                        style={{ color: 'var(--shell-text)', background: 'var(--shell-panel)' }}
                        value={group}
                        onChange={(event) => onGroupChange(event.currentTarget.value)}
                        placeholder={'Production, Games, Clients…'}
                        maxLength={32}
                    />
                </div>
                <div className={'drawer-card mt-5'}>
                    <p className={'text-xs uppercase tracking-widest text-neutral-500 mb-3'}>Power</p>
                    <div className={'power-grid'}>
                        <button
                            type={'button'}
                            disabled={busy || !server.powerPermissions.start}
                            onClick={() => power('start')}
                        >
                            <FontAwesomeIcon icon={faPlay} className={'mr-2'} />
                            Start
                        </button>
                        <button
                            type={'button'}
                            disabled={busy || !server.powerPermissions.restart}
                            onClick={() => power('restart')}
                        >
                            <FontAwesomeIcon icon={faRedo} className={'mr-2'} />
                            Restart
                        </button>
                        <button
                            type={'button'}
                            disabled={busy || !server.powerPermissions.stop}
                            onClick={() => power('stop')}
                        >
                            <FontAwesomeIcon icon={faStop} className={'mr-2'} />
                            Stop
                        </button>
                    </div>
                    {!!message && <p className={'mt-3 text-xs text-neutral-400'}>{message}</p>}
                </div>
                <Link
                    className={'mt-6 inline-flex items-center text-primary-300 no-underline'}
                    to={`/server/${server.id}`}
                >
                    Open full server <FontAwesomeIcon icon={faArrowRight} className={'ml-2'} />
                </Link>
            </aside>
        </Shell>,
        document.getElementById('modal-portal') || document.body
    );
};
