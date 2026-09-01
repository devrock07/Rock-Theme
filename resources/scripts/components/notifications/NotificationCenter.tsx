import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import {
    clearRockNotifications,
    getReadRockNotificationIds,
    getRockNotifications,
    hasPendingRockNotificationClear,
    markRockNotificationRead,
    reconcileRockNotifications,
    resolvePendingRockNotificationClear,
    RockNotification,
    setRockNotifications,
} from './rockNotifications';
import { clearServerNotifications, getRockAccountData, markServerNotificationRead } from '@/api/account/rockData';

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
        box-shadow: 0 0 12px rgba(var(--shell-accent-rgb), 0.34);
        font-size: 0.58rem;
    }

    @media (max-width: 800px) {
        & > .notification-trigger {
            width: 2.75rem;
            height: 2.75rem;
            margin-left: 0.15rem;
        }
    }
`;

const NotificationBackdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 998;
    background: rgba(3, 2, 3, 0.66);
    backdrop-filter: blur(5px);
`;

const NotificationPanel = styled.div`
    position: fixed;
    z-index: 999;
    display: flex;
    width: min(23rem, calc(100vw - 1.5rem));
    max-height: calc(100dvh - 5.75rem);
    overflow: hidden;
    flex-direction: column;
    border: 1px solid rgba(var(--shell-accent-rgb), 0.24);
    border-radius: 14px;
    background: linear-gradient(150deg, rgba(var(--shell-accent-rgb), 0.1), transparent 52%),
        color-mix(in srgb, var(--shell-panel-strong) 98.5%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 225, 230, 0.055), 0 25px 70px rgba(0, 0, 0, 0.58),
        0 0 42px rgba(var(--shell-accent-rgb), 0.07);
    backdrop-filter: blur(24px) saturate(1.2);

    &::before {
        position: absolute;
        top: 0;
        right: 12%;
        left: 12%;
        height: 1px;
        content: '';
        pointer-events: none;
        background: linear-gradient(90deg, transparent, rgba(var(--shell-accent-rgb), 0.58), transparent);
    }

    .notification-head {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1rem;
        border-bottom: 1px solid rgba(var(--shell-accent-rgb), 0.14);
        background: color-mix(in srgb, var(--shell-panel-strong) 90%, transparent);
        backdrop-filter: blur(18px);
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
        color: var(--shell-accent-bright);
        border-color: rgba(var(--shell-accent-rgb), 0.26);
        background: rgba(var(--shell-accent-rgb), 0.12);
    }
    .notification-list {
        min-height: 0;
        max-height: min(27rem, calc(100dvh - 9rem));
        overflow-y: auto;
        overscroll-behavior: contain;
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
        overflow-wrap: anywhere;
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

    @media (max-width: 800px) {
        .notification-actions button {
            width: 2.75rem;
            height: 2.75rem;
        }
    }

    @media (max-width: 700px) {
        width: auto;
        border-radius: 16px;

        .notification-head {
            padding: 0.9rem 1rem;
        }

        .notification-head strong {
            font-size: 0.9rem;
        }

        .notification-list {
            max-height: none;
        }

        .notification-item {
            padding: 1rem 1rem 1rem 1.3rem;
        }

        .notification-item strong {
            white-space: normal;
        }
    }
`;

interface PanelPosition {
    top: number;
    right: number;
    left?: number;
    width?: number;
    mobile: boolean;
    maxHeight: number;
}

const getPanelPosition = (trigger?: HTMLButtonElement | null): PanelPosition => {
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const mobile = viewportWidth <= 700;
    const rect = trigger?.getBoundingClientRect();
    const top = Math.max(viewportTop + 12, (rect?.bottom ?? viewportTop + 64) + 10);
    const availableHeight = Math.max(0, viewportTop + viewportHeight - top - (mobile ? 12 : 16));

    return {
        top,
        right: mobile
            ? Math.max(0, window.innerWidth - (viewportLeft + viewportWidth) + 12)
            : Math.max(12, window.innerWidth - (rect?.right ?? viewportLeft + viewportWidth - 12)),
        left: mobile ? viewportLeft + 12 : undefined,
        width: mobile ? Math.max(0, viewportWidth - 24) : undefined,
        mobile,
        maxHeight: availableHeight,
    };
};

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
    const [panelPosition, setPanelPosition] = useState<PanelPosition>(() => getPanelPosition());
    const center = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const syncGeneration = useRef(0);

    const sync = useCallback(() => {
        const generation = ++syncGeneration.current;

        return getRockAccountData()
            .then((data) => {
                if (generation !== syncGeneration.current) return;
                if (!data.notificationsAvailable) return;

                if (hasPendingRockNotificationClear()) {
                    setRockNotifications(reconcileRockNotifications([]));
                    return clearServerNotifications().then(resolvePendingRockNotificationClear);
                }

                const remote: RockNotification[] = data.notifications.map((item) => ({
                    ...item,
                    remote: true,
                    tone: item.type === 'offline' ? 'danger' : item.type === 'recovered' ? 'success' : 'warning',
                }));
                const read = new Set(getReadRockNotificationIds());
                setRockNotifications(reconcileRockNotifications(remote));
                remote
                    .filter((item) => read.has(item.id))
                    .forEach((item) => markServerNotificationRead(item.id).catch(() => undefined));
                return undefined;
            })
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        const refresh = () => setItems(getRockNotifications());
        window.addEventListener('rock:notification', refresh);
        window.addEventListener('rock:notifications-cleared', refresh);
        return () => {
            syncGeneration.current += 1;
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
            const target = event.target as Node;
            if (!center.current?.contains(target) && !panel.current?.contains(target)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => {
            document.removeEventListener('mousedown', close);
        };
    }, [open, sync]);

    useEffect(() => {
        if (!open) return;

        const panelElement = panel.current;
        const restoreFocusTo = trigger.current;
        panelElement?.querySelector<HTMLButtonElement>('[aria-label="Close notifications"]')?.focus();

        const handleKeyboard = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                return;
            }

            if (event.key !== 'Tab' || !panelPosition.mobile || !panelElement) return;

            const focusable = Array.from(
                panelElement.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            );
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!panelElement.contains(document.activeElement)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            } else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyboard);
        return () => {
            document.removeEventListener('keydown', handleKeyboard);
            restoreFocusTo?.focus();
        };
    }, [open, panelPosition.mobile]);

    useLayoutEffect(() => {
        if (!open) return;

        const panelElement = panel.current;
        if (panelElement && !panelElement.contains(document.activeElement)) {
            panelElement.querySelector<HTMLButtonElement>('[aria-label="Close notifications"]')?.focus();
        }
    }, [items.length, open, panelPosition.mobile]);

    useLayoutEffect(() => {
        if (!open) return;

        const updatePosition = () => setPanelPosition(getPanelPosition(trigger.current));
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        window.visualViewport?.addEventListener('resize', updatePosition);
        window.visualViewport?.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
            window.visualViewport?.removeEventListener('resize', updatePosition);
            window.visualViewport?.removeEventListener('scroll', updatePosition);
        };
    }, [open]);

    useEffect(() => {
        if (!open || !panelPosition.mobile) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open, panelPosition.mobile]);

    return (
        <Center ref={center}>
            <button
                ref={trigger}
                type={'button'}
                className={'navigation-link notification-trigger'}
                onClick={() => setOpen((value) => !value)}
                aria-label={'Notifications'}
                aria-expanded={open}
                aria-controls={'rock-notification-panel'}
            >
                <FontAwesomeIcon icon={faBell} aria-hidden={'true'} />
                {!!items.length && (
                    <span className={'notification-count'}>{items.length > 9 ? '9+' : items.length}</span>
                )}
            </button>
            {open &&
                createPortal(
                    <>
                        {panelPosition.mobile && (
                            <NotificationBackdrop aria-hidden={'true'} onClick={() => setOpen(false)} />
                        )}
                        <NotificationPanel
                            ref={panel}
                            id={'rock-notification-panel'}
                            role={'dialog'}
                            aria-label={'Notifications'}
                            aria-modal={panelPosition.mobile || undefined}
                            style={
                                panelPosition.mobile
                                    ? {
                                          top: panelPosition.top,
                                          right: 'auto',
                                          left: panelPosition.left,
                                          width: panelPosition.width,
                                          maxHeight: panelPosition.maxHeight,
                                      }
                                    : {
                                          top: panelPosition.top,
                                          right: panelPosition.right,
                                          maxHeight: panelPosition.maxHeight,
                                      }
                            }
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
                                                clearServerNotifications()
                                                    .then(resolvePendingRockNotificationClear)
                                                    .catch(() => undefined);
                                            }}
                                            aria-label={'Clear notifications'}
                                        >
                                            <FontAwesomeIcon icon={faCheck} aria-hidden={'true'} />
                                        </button>
                                    )}
                                    <button
                                        type={'button'}
                                        onClick={() => setOpen(false)}
                                        aria-label={'Close notifications'}
                                    >
                                        <FontAwesomeIcon icon={faTimes} aria-hidden={'true'} />
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
                                            onClick={() => {
                                                markRockNotificationRead(item.id);
                                                if (item.remote) {
                                                    markServerNotificationRead(item.id).catch(() => undefined);
                                                }
                                                setOpen(false);
                                            }}
                                        >
                                            <strong>{item.title}</strong>
                                            <small>{item.message}</small>
                                            <span className={'notification-time'}>{relativeTime(item.createdAt)}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </NotificationPanel>
                    </>,
                    document.getElementById('modal-portal') || document.body
                )}
        </Center>
    );
};
