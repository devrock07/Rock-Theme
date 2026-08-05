import React, { useEffect, useRef, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { ShinyText, SplitText } from '@/components/elements/ReactBitsEffects';
import { MagicBentoGrid } from '@/components/elements/reactbits/MagicBento';
import QuickServerDrawer from '@/components/dashboard/QuickServerDrawer';
import { ServerStats } from '@/api/server/getServerResourceUsage';
import { getRockAccountData, saveServerPreferences, ServerPreference } from '@/api/account/rockData';

const DashboardHero = styled.section`
    position: relative;
    margin-right: -2rem;
    margin-bottom: 2.5rem;
    margin-left: -2rem;
    padding: 3.5rem 2rem 2.35rem;
    overflow: hidden;
    border-bottom: 1px solid var(--shell-border);
    background: linear-gradient(105deg, var(--shell-bg), rgba(var(--shell-accent-rgb), 0.14), var(--shell-panel));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035), inset 0 -30px 90px rgba(0, 0, 0, 0.12);

    .hero-art {
        position: absolute;
        inset: 0 0 0 42%;
        z-index: 1;
        pointer-events: none;
        background-repeat: no-repeat;
        background-position: center 42%;
        background-size: cover;
        opacity: 0.58;
        filter: saturate(0.86) contrast(1.03);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.35) 18%, black 42%, black 100%);
        mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.35) 18%, black 42%, black 100%);
    }

    .hero-content {
        position: relative;
        z-index: 2;
        max-width: 48rem;
    }

    .hero-content::before {
        position: absolute;
        top: -0.4rem;
        bottom: -0.4rem;
        left: -1.15rem;
        width: 1px;
        content: '';
        background: linear-gradient(180deg, transparent, rgba(var(--shell-accent-rgb), 0.48), transparent);
    }

    &::before {
        position: absolute;
        top: -13rem;
        left: 52%;
        width: 34rem;
        height: 25rem;
        content: '';
        pointer-events: none;
        border-radius: 50%;
        background: rgba(var(--shell-accent-rgb), 0.2);
        filter: blur(100px);
    }

    .eyebrow,
    .hero-stat {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        text-transform: uppercase;
    }

    .eyebrow {
        margin-bottom: 1.1rem;
        color: #77737f;
        font-size: 0.64rem;
        font-weight: 600;
        letter-spacing: 0.16em;
    }

    .hero-copy {
        position: relative;
        z-index: 1;
        max-width: 36rem;
        margin-top: 1rem;
        color: var(--shell-muted);
        font-size: 0.88rem;
        line-height: 1.7;
    }

    .hero-stats {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 1.35rem;
        margin-top: 2.2rem;
    }

    .hero-stat {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        color: #9c99a3;
        font-size: 0.64rem;
        letter-spacing: 0.05em;
        padding: 0.38rem 0.58rem;
        border: 1px solid rgba(255, 255, 255, 0.065);
        border-radius: 999px;
        background: rgba(8, 8, 9, 0.34);
        backdrop-filter: blur(12px);
    }

    .hero-dot {
        width: 0.38rem;
        height: 0.38rem;
        color: var(--shell-success);
    }

    @media (max-width: 1150px) {
        margin-right: -1.25rem;
        margin-left: -1.25rem;
        padding-right: 1.25rem;
        padding-left: 1.25rem;
    }

    @media (max-width: 640px) {
        margin-right: -1rem;
        margin-left: -1rem;
        margin-bottom: 1.6rem;
        padding: 2.7rem 1rem 1.8rem;
        .hero-art {
            left: 18%;
            opacity: 0.24;
        }
        .hero-content::before {
            display: none;
        }
        .hero-stats {
            flex-wrap: wrap;
            gap: 0.65rem 1rem;
            margin-top: 1.55rem;
        }
        .hero-copy {
            max-width: 18rem;
            margin-top: 0.8rem;
            font-size: 0.82rem;
        }
    }
`;

const DashboardToolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    margin-bottom: 0.85rem;

    @media (max-width: 640px) {
        align-items: flex-start;
        flex-direction: column;
    }
`;

const ServerGrid = styled(MagicBentoGrid)`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const SkeletonCard = styled.div`
    min-height: 14rem;
    border: 1px solid var(--shell-border);
    border-radius: var(--shell-radius);
    background: linear-gradient(
        110deg,
        rgba(255, 255, 255, 0.018) 8%,
        rgba(var(--shell-accent-rgb), 0.07) 18%,
        rgba(255, 255, 255, 0.018) 33%
    );
    background-size: 220% 100%;
    animation: skeleton-wave 1.5s linear infinite;
    @keyframes skeleton-wave {
        to {
            background-position-x: -220%;
        }
    }
`;

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const username = useStoreState((state) => state.user.data!.username);
    const branding = useStoreState((state) => state.settings.data!.branding);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const [preferences, setPreferences] = usePersistedState<Record<string, ServerPreference>>(
        `${uuid}:server_preferences`,
        {}
    );
    const [activeGroup, setActiveGroup] = useState('All');
    const [quickServer, setQuickServer] = useState<{ server: Server; stats: ServerStats | null } | null>(null);
    const preferencesReady = useRef(false);
    const saveTimer = useRef<number>();
    const { data: accountData } = useSWR('/api/client/account/rock', getRockAccountData);
    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => setPage(1), [showOnlyAdmin]);
    useEffect(() => {
        if (servers && servers.pagination.currentPage > 1 && !servers.items.length) setPage(1);
    }, [servers?.pagination.currentPage]);
    useEffect(() => {
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);
    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);
    useEffect(() => {
        if (!accountData || preferencesReady.current) return;
        const local = preferences || {};
        const merged = { ...local, ...accountData.serverPreferences };
        setPreferences(merged);
        preferencesReady.current = true;
        if (Object.keys(local).length && !Object.keys(accountData.serverPreferences).length) {
            saveServerPreferences(merged).catch(() => undefined);
        }
    }, [accountData]);
    useEffect(() => {
        if (!preferencesReady.current) return;
        window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(
            () => saveServerPreferences(preferences || {}).catch(() => undefined),
            500
        );
        return () => window.clearTimeout(saveTimer.current);
    }, [preferences]);

    const dashboardSubtitle = branding.dashboardSubtitle.replace(/\{username\}/gi, username);
    const serverPreferences = preferences || {};
    const updatePreference = (serverId: string, next: Partial<ServerPreference>) =>
        setPreferences((current) => ({
            ...(current || {}),
            [serverId]: {
                favorite: (current || {})[serverId]?.favorite || false,
                group: (current || {})[serverId]?.group || '',
                ...next,
            },
        }));
    const groups = Array.from(
        new Set((servers?.items || []).map((server) => serverPreferences[server.id]?.group?.trim()).filter(Boolean))
    ) as string[];

    return (
        <PageContentBlock className='content-dashboard' title={'Dashboard'} showFlashKey={'dashboard'}>
            <DashboardHero>
                {!!branding.dashboardImage && (
                    <div className={'hero-art'} style={{ backgroundImage: `url("${branding.dashboardImage}")` }} />
                )}
                <div className={'hero-content'}>
                    <p className={'eyebrow'}>
                        <ShinyText>{branding.owner} / Control</ShinyText>
                    </p>
                    <SplitText text={branding.dashboardTitle} />
                    {!!dashboardSubtitle && <p className={'hero-copy'}>{dashboardSubtitle}</p>}
                    <div className={'hero-stats'}>
                        <div className={'hero-stat'}>
                            <FontAwesomeIcon icon={faCircle} className={'hero-dot'} />
                            {servers ? servers.pagination.total : '—'} total
                        </div>
                        <div className={'hero-stat'}>{rootAdmin ? 'Administrator' : 'Member'}</div>
                    </div>
                </div>
            </DashboardHero>
            {rootAdmin && (
                <DashboardToolbar>
                    <div css={tw`flex items-center`}>
                        <FontAwesomeIcon icon={faShieldAlt} css={tw`text-neutral-500 mr-2`} />
                        <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                            {showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}
                        </p>
                        <Switch
                            name={'show_all_servers'}
                            defaultChecked={showOnlyAdmin}
                            onChange={() => setShowOnlyAdmin((s) => !s)}
                        />
                    </div>
                </DashboardToolbar>
            )}
            <div
                className={
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-3 rounded-xl border border-white/5 bg-black/20 backdrop-blur-md'
                }
            >
                <div className={'flex flex-wrap items-center gap-2'}>
                    <span className={'text-xs font-semibold uppercase tracking-wider text-neutral-500 mr-1'}>
                        Filters:
                    </span>
                    {['All', 'Favorites', ...groups].map((group) => (
                        <button
                            key={group}
                            onClick={() => setActiveGroup(group)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                activeGroup === group
                                    ? 'border-red-500/50 text-red-300 bg-red-950/40 shadow-sm shadow-red-950'
                                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300 bg-neutral-900/50'
                            }`}
                        >
                            {group === 'All' ? 'All Servers' : group}
                        </button>
                    ))}
                </div>
            </div>
            {!servers ? (
                <ServerGrid>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </ServerGrid>
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) => {
                        const visibleItems = items
                            .filter(
                                (server) =>
                                    activeGroup === 'All' ||
                                    (activeGroup === 'Favorites'
                                        ? serverPreferences[server.id]?.favorite
                                        : serverPreferences[server.id]?.group === activeGroup)
                            )
                            .sort(
                                (left, right) =>
                                    Number(!!serverPreferences[right.id]?.favorite) -
                                    Number(!!serverPreferences[left.id]?.favorite)
                            );
                        return visibleItems.length ? (
                            <ServerGrid>
                                {visibleItems.map((server) => (
                                    <ServerRow
                                        key={server.uuid}
                                        server={server}
                                        favorite={!!serverPreferences[server.id]?.favorite}
                                        onToggleFavorite={() =>
                                            updatePreference(server.id, {
                                                favorite: !serverPreferences[server.id]?.favorite,
                                            })
                                        }
                                        onOpenQuick={(selected, stats) => setQuickServer({ server: selected, stats })}
                                    />
                                ))}
                            </ServerGrid>
                        ) : (
                            <p css={tw`text-center text-sm text-neutral-400`}>
                                {showOnlyAdmin
                                    ? 'There are no other servers to display.'
                                    : 'There are no servers associated with your account.'}
                            </p>
                        );
                    }}
                </Pagination>
            )}
            {quickServer && (
                <QuickServerDrawer
                    server={quickServer.server}
                    stats={quickServer.stats}
                    group={serverPreferences[quickServer.server.id]?.group || ''}
                    onGroupChange={(group) => updatePreference(quickServer.server.id, { group })}
                    onClose={() => setQuickServer(null)}
                />
            )}
        </PageContentBlock>
    );
};
