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
        bottom: 0.65rem;
        left: 0.65rem;
        z-index: 120;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        padding: 0.42rem;
        border: 1px solid var(--shell-border-strong);
        border-radius: 14px;
        background: color-mix(in srgb, var(--shell-panel-strong) 92%, transparent);
        box-shadow: 0 18px 55px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(var(--shell-glass));
    }
    a {
        display: flex;
        min-width: 0;
        min-height: 3rem;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        color: var(--shell-muted);
        border-radius: 10px;
        font-size: 0.59rem;
        text-decoration: none;
    }
    a.active {
        color: var(--shell-accent-bright);
        background: rgba(var(--shell-accent-rgb), 0.12);
    }
    svg {
        font-size: 0.9rem;
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
