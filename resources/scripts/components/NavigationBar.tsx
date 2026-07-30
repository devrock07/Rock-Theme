import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center justify-center no-underline cursor-pointer transition-all duration-150`};
        width: 2.35rem;
        height: 2.35rem;
        margin-left: 0.35rem;
        color: var(--shell-muted);
        border: 1px solid var(--shell-border);
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.012));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055);
        backdrop-filter: blur(16px) saturate(1.3);

        &:active,
        &:hover {
            color: white;
            border-color: var(--shell-border-strong);
            background: rgba(255, 255, 255, 0.04);
        }
    }

    & > a.active {
        color: var(--shell-accent-bright);
        border-color: rgba(201, 79, 89, 0.42);
        background: var(--shell-accent-soft);
    }

    & > .search-trigger {
        width: 16rem;
        padding: 0 0.75rem;
        justify-content: flex-start;
        gap: 0.65rem;
        color: #737a91;

        .search-copy {
            overflow: hidden;
            flex: 1;
            font-size: 0.76rem;
            text-align: left;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        kbd {
            padding: 0.16rem 0.42rem;
            color: #80879c;
            border: 1px solid rgba(148, 163, 184, 0.12);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.035);
            font-size: 0.62rem;
        }
    }

    @media (max-width: 800px) {
        & > .search-trigger {
            width: 2.55rem;
            padding: 0;
            justify-content: center;

            .search-copy,
            kbd {
                display: none;
            }
        }
    }
`;

const Topbar = styled.div`
    border-bottom: 1px solid var(--shell-border);
    background: linear-gradient(105deg, rgba(8, 8, 9, 0.9), rgba(28, 12, 15, 0.76), rgba(8, 8, 9, 0.88));
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.025);
    backdrop-filter: blur(22px) saturate(1.35);

    .brand-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        margin-right: 0.6rem;
        color: var(--shell-accent-bright);
        border: 1px solid rgba(201, 79, 89, 0.44);
        border-radius: 6px;
        background: rgba(201, 79, 89, 0.09);
        font-size: 0.72rem;
    }

    .brand-logo {
        width: 1.75rem;
        height: 1.75rem;
        margin-right: 0.6rem;
        border-radius: 6px;
        object-fit: contain;
    }

    .brand-name {
        color: var(--shell-text);
        letter-spacing: -0.025em;
    }

    .user-copy {
        margin: 0 0.65rem 0 0.9rem;
        text-align: right;
    }

    @media (max-width: 640px) {
        .user-copy,
        .optional-nav {
            display: none;
        }

        .brand-name {
            font-size: 0.95rem;
        }

        .brand-mark {
            width: 1.65rem;
            height: 1.65rem;
            margin-right: 0.45rem;
        }

        .brand-logo {
            width: 1.65rem;
            height: 1.65rem;
            margin-right: 0.45rem;
        }
    }

    @media (max-width: 420px) {
        & > div {
            padding-right: 0.75rem;
            padding-left: 0.75rem;
        }

        .brand-name {
            max-width: 8.25rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
`;

const onTriggerNavButton = () => {
    const sidebar = document.getElementById('sidebar');

    if (sidebar) {
        sidebar.classList.toggle('active-nav');
    }
};

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);
    const username = useStoreState((state: ApplicationStore) => state.user.data!.username);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/server') || location.pathname.startsWith('/account')) {
            setShowSidebar(true);
            return;
        }
        setShowSidebar(false);
    }, [location.pathname]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <Topbar className={'topbar'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'w-full flex items-center h-full px-4 sm:px-6'}>
                {showSidebar && (
                    <FontAwesomeIcon
                        icon={faBars}
                        className='navbar-button'
                        onClick={onTriggerNavButton}
                    ></FontAwesomeIcon>
                )}

                <div id={'logo'} className={'flex-1'}>
                    <Link to={'/'} className={'inline-flex items-center no-underline'}>
                        {branding.logo ? (
                            <img className={'brand-logo'} src={branding.logo} alt={''} aria-hidden={'true'} />
                        ) : (
                            <span className={'brand-mark'}>{branding.mark}</span>
                        )}
                        <span className={'brand-name text-lg font-header font-semibold'}>{name}</span>
                    </Link>
                </div>

                <RightNavigation className={'flex items-center justify-center'}>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact className={'optional-nav'}>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'} className={'optional-nav'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <div className={'user-copy'}>
                        <p className={'text-xs font-semibold text-neutral-100 leading-tight'}>{username}</p>
                        <p className={'text-2xs text-neutral-500 leading-tight'}>Control panel</p>
                    </div>
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span className={'flex items-center w-5 h-5'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </Topbar>
    );
};
