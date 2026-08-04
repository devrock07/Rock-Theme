import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import {
    clearRockNotifications,
    getRockNotifications,
    mergeRockNotifications,
    RockNotification,
    setRockNotifications,
} from './rockNotifications';
import { clearServerNotifications, getRockAccountData } from '@/api/account/rockData';

const Center = styled.div`
    position: relative;
    z-index: 140;

    & > .notification-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.35rem;
        height: 2.35rem;
        margin-left: 0.35rem;
        color: var(--shell-muted);
        border: 1px solid var(--shell-border);
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.012));
    }

    .notification-trigger {
        position: relative;
    }
    .notification-count {
        position: absolute;
        top: -0.3rem;
        right: -0.3rem;
        display: grid;
        min-width: 1rem;
        height: 1rem;
        place-items: center;
        padding: 0 0.2rem;
        color: white;
        border-radius: 999px;
        background: var(--shell-accent);
        font-size: 0.58rem;
    }
    .notification-panel {
        position: absolute;
        top: calc(100% + 0.7rem);
        right: 0;
        z-index: 130;
        width: min(23rem, calc(100vw - 1.5rem));
        overflow: hidden;
        border: 1px solid var(--shell-border-strong);
        border-radius: var(--shell-radius);
        background: color-mix(in srgb, var(--shell-panel-strong) 96%, transparent);
        box-shadow: 0 25px 70px rgba(0, 0, 0, 0.48);
        backdrop-filter: blur(var(--shell-glass));
    }
    .notification-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--shell-border);
    }
    .notification-head strong {
        color: var(--shell-text);
        font-size: 0.84rem;
    }
    .notification-head small {
        display: block;
        margin-top: 0.12rem;
        color: var(--shell-muted);
        font-size: 0.64rem;
    }
    .notification-actions {
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }
    .notification-actions button {
        display: grid;
        width: 2rem;
        height: 2rem;
        place-items: center;
        color: var(--shell-muted);
        border: 1px solid transparent;
        border-radius: 7px;
    }
    .notification-actions button:hover {
        color: var(--shell-text);
        border-color: var(--shell-border);
        background: var(--shell-accent-soft);
    }
    .notification-list {
        max-height: min(27rem, calc(100vh - 7rem));
        overflow-y: auto;
    }
    .notification-item {
        position: relative;
        display: block;
        padding: 0.9rem 1rem 0.9rem 1.25rem;
        color: var(--shell-text);
        text-decoration: none;
        border-bottom: 1px solid var(--shell-border);
    }
    .notification-item::before {
        position: absolute;
        top: 1rem;
        left: 0.65rem;
        width: 0.34rem;
        height: 0.34rem;
        content: '';
        border-radius: 999px;
        background: var(--shell-accent-bright);
        box-shadow: 0 0 12px rgba(var(--shell-accent-rgb), 0.36);
    }
    .notification-item[data-tone='success']::before {
        background: var(--shell-success);
    }
    .notification-item[data-tone='warning']::before {
        background: var(--shell-warning);
    }
    .notification-item[data-tone='danger']::before {
        background: var(--shell-danger);
    }
    .notification-item strong {
        display: block;
        overflow: hidden;
        font-size: 0.78rem;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .notification-item:hover {
        background: rgba(var(--shell-accent-rgb), 0.07);
    }
    .notification-item small {
        display: block;
        margin-top: 0.25rem;
        color: var(--shell-muted);
    }
    .notification-time {
        color: var(--shell-muted);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.58rem;
        letter-spacing: 0.03em;
    }
    .empty {
        padding: 2rem 1rem;
        color: var(--shell-muted);
        text-align: center;
    }
`;

const relativeTime = (value: RockNotification['createdAt']) => {
    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    if (!Number.isFinite(timestamp)) return 'Now';
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 60) return 'Now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
};

export default () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<RockNotification[]>(getRockNotifications);
    const center = useRef<HTMLDivElement>(null);

    const sync = useCallback(() => {
        return getRockAccountData()
            .then((data) => {
                const remote: RockNotification[] = data.notifications.map((item) => ({
                    ...item,
                    tone: item.type === 'offline' ? 'danger' : item.type === 'recovered' ? 'success' : 'warning',
                }));
                setRockNotifications(mergeRockNotifications(remote));
            })
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        const refresh = () => setItems(getRockNotifications());
        window.addEventListener('rock:notification', refresh);
        window.addEventListener('rock:notifications-cleared', refresh);
        return () => {
            window.removeEventListener('rock:notification', refresh);
            window.removeEventListener('rock:notifications-cleared', refresh);
        };
    }, []);
    useEffect(() => {
        sync();
        const timer = window.setInterval(sync, 60000);
        return () => window.clearInterval(timer);
    }, [sync]);
    useEffect(() => {
        if (!open) return;
        sync();
        const close = (event: MouseEvent) => {
            if (!center.current?.contains(event.target as Node)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [open, sync]);

    return (
        <Center ref={center}>
            <button
                type={'button'}
                className={'navigation-link notification-trigger'}
                onClick={() => setOpen((value) => !value)}
                aria-label={'Notifications'}
                aria-expanded={open}
                aria-controls={'rock-notification-panel'}
            >
                <FontAwesomeIcon icon={faBell} />
                {!!items.length && (
                    <span className={'notification-count'}>{items.length > 9 ? '9+' : items.length}</span>
                )}
            </button>
            {open && (
                <div
                    id={'rock-notification-panel'}
                    className={'notification-panel'}
                    role={'dialog'}
                    aria-label={'Notifications'}
                >
                    <div className={'notification-head'}>
                        <div>
                            <strong>Notifications</strong>
                            <small>{items.length ? `${items.length} recent` : 'You are all caught up'}</small>
                        </div>
                        <div className={'notification-actions'}>
                            {!!items.length && (
                                <button
                                    type={'button'}
                                    onClick={() => {
                                        clearRockNotifications();
                                        clearServerNotifications().catch(() => undefined);
                                    }}
                                    aria-label={'Clear notifications'}
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>
                            )}
                            <button type={'button'} onClick={() => setOpen(false)} aria-label={'Close notifications'}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    </div>
                    {!items.length ? (
                        <div className={'empty'}>All quiet.</div>
                    ) : (
                        <div className={'notification-list'}>
                            {items.map((item) => (
                                <Link
                                    key={item.id}
                                    className={'notification-item'}
                                    data-tone={item.tone}
                                    to={item.href || '/'}
                                    onClick={() => setOpen(false)}
                                >
                                    <strong>{item.title}</strong>
                                    <small>{item.message}</small>
                                    <span className={'notification-time'}>{relativeTime(item.createdAt)}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Center>
    );
};
