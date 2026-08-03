import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { clearRockNotifications, getRockNotifications, RockNotification } from './rockNotifications';

const Center = styled.div`
    position: relative;

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
        background: rgba(12, 11, 13, 0.96);
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
    .notification-item {
        display: block;
        padding: 0.85rem 1rem;
        color: var(--shell-text);
        text-decoration: none;
        border-bottom: 1px solid var(--shell-border);
    }
    .notification-item:hover {
        background: rgba(var(--shell-accent-rgb), 0.07);
    }
    .notification-item small {
        display: block;
        margin-top: 0.25rem;
        color: var(--shell-muted);
    }
    .empty {
        padding: 2rem 1rem;
        color: var(--shell-muted);
        text-align: center;
    }
`;

export default () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<RockNotification[]>(getRockNotifications);

    useEffect(() => {
        const refresh = () => setItems(getRockNotifications());
        window.addEventListener('rock:notification', refresh);
        window.addEventListener('rock:notifications-cleared', refresh);
        return () => {
            window.removeEventListener('rock:notification', refresh);
            window.removeEventListener('rock:notifications-cleared', refresh);
        };
    }, []);

    return (
        <Center>
            <button
                className={'navigation-link notification-trigger'}
                onClick={() => setOpen((value) => !value)}
                aria-label={'Notifications'}
            >
                <FontAwesomeIcon icon={faBell} />
                {!!items.length && <span className={'notification-count'}>{Math.min(9, items.length)}</span>}
            </button>
            {open && (
                <div className={'notification-panel'}>
                    <div className={'notification-head'}>
                        <strong>Notifications</strong>
                        <div className={'flex gap-3'}>
                            {!!items.length && (
                                <button onClick={clearRockNotifications} aria-label={'Clear notifications'}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} aria-label={'Close notifications'}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    </div>
                    {!items.length ? (
                        <div className={'empty'}>All quiet.</div>
                    ) : (
                        items.slice(0, 8).map((item) => (
                            <Link
                                key={item.id}
                                className={'notification-item'}
                                to={item.href || '/'}
                                onClick={() => setOpen(false)}
                            >
                                <strong>{item.title}</strong>
                                <small>{item.message}</small>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </Center>
    );
};
