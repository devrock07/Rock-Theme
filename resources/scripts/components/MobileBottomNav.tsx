import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faLayerGroup, faSlidersH, faTerminal, faUser } from '@fortawesome/free-solid-svg-icons';

const Bar = styled.nav`
    display: none;
    @media (max-width: 700px) {
        position: fixed;
        right: 0.65rem;
        bottom: calc(0.65rem + env(safe-area-inset-bottom, 0px));
        left: 0.65rem;
        z-index: 120;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        padding: 0.42rem;
        overflow: hidden;
        border: 1px solid rgba(var(--shell-accent-rgb), 0.24);
        border-radius: 16px;
        background: linear-gradient(
            145deg,
            color-mix(in srgb, var(--shell-panel-strong) 96%, transparent),
            color-mix(in srgb, var(--shell-bg) 97%, transparent)
        );
        box-shadow: inset 0 1px 0 rgba(255, 225, 230, 0.055), 0 18px 55px rgba(0, 0, 0, 0.56),
            0 0 34px rgba(var(--shell-accent-rgb), 0.06);
        backdrop-filter: blur(var(--shell-glass));

        &::before {
            position: absolute;
            top: 0;
            right: 12%;
            left: 12%;
            height: 1px;
            content: '';
            pointer-events: none;
            background: linear-gradient(90deg, transparent, rgba(var(--shell-accent-rgb), 0.5), transparent);
        }
    }
    a {
        position: relative;
        display: flex;
        min-width: 0;
        min-height: 3.15rem;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        color: var(--shell-muted);
        border: 1px solid transparent;
        border-radius: 11px;
        font-size: 0.59rem;
        text-decoration: none;
        transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
    }
    && a.active {
        color: var(--shell-accent-bright);
        border-color: rgba(var(--shell-accent-rgb), 0.3);
        background: linear-gradient(145deg, rgba(var(--shell-accent-rgb), 0.22), rgba(var(--shell-accent-rgb), 0.1));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 8px 24px rgba(var(--shell-accent-rgb), 0.18);
    }
    svg {
        font-size: 0.9rem;
    }

    && a.active svg {
        color: var(--shell-accent-bright);
        filter: drop-shadow(0 0 8px rgba(var(--shell-accent-rgb), 0.32));
    }

    @media (max-width: 380px) {
        right: 0.45rem;
        left: 0.45rem;
        padding: 0.32rem;

        a {
            min-height: 3rem;
        }
    }
`;

export default ({ serverId }: { serverId?: string }) => {
    const items = serverId
        ? [
              { to: `/server/${serverId}`, label: 'Console', icon: faTerminal, exact: true },
              { to: `/server/${serverId}/files`, label: 'Files', icon: faFolder },
              { to: `/server/${serverId}/settings`, label: 'Settings', icon: faSlidersH },
              { to: '/', label: 'Servers', icon: faLayerGroup, exact: true },
          ]
        : [
              { to: '/', label: 'Servers', icon: faLayerGroup, exact: true },
              { to: '/account', label: 'Account', icon: faUser, exact: true },
              { to: '/account/api', label: 'API', icon: faSlidersH },
              { to: '/status', label: 'Status', icon: faTerminal },
          ];

    return (
        <Bar aria-label={'Mobile navigation'}>
            {items.map((item) => (
                <NavLink key={item.to} to={item.to} exact={item.exact}>
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </Bar>
    );
};
