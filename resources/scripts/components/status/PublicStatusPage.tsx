import React from 'react';
import useSWR from 'swr';
import http from '@/api/http';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheckCircle, faServer, faShieldAlt, faSignal } from '@fortawesome/free-solid-svg-icons';

const Page = styled.main`
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 2rem 1rem;

    .status-shell {
        width: min(48rem, 100%);
        padding: clamp(1.4rem, 5vw, 3rem);
        border: 1px solid var(--shell-border);
        border-radius: var(--shell-radius);
        background: linear-gradient(145deg, rgba(var(--shell-accent-rgb), 0.1), rgba(10, 10, 12, 0.9) 46%);
        box-shadow: var(--shell-shadow);
        backdrop-filter: blur(var(--shell-glass));
    }

    .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.7rem;
        color: var(--shell-success);
        border: 1px solid rgba(114, 214, 165, 0.24);
        border-radius: 999px;
        background: rgba(114, 214, 165, 0.06);
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .status-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 2rem;
    }

    .status-grid > div {
        padding: 1rem;
        border: 1px solid var(--shell-border);
        border-radius: calc(var(--shell-radius) - 3px);
        background: rgba(255, 255, 255, 0.025);
    }

    @media (max-width: 560px) {
        .status-grid {
            grid-template-columns: 1fr;
        }
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);
    const { data } = useSWR('/api/public/status', (url) => http.get(url).then((response) => response.data), {
        refreshInterval: 60000,
    });
    const operational = data?.status === 'operational';
    const statusLabel = !data ? 'Checking systems' : operational ? 'Operational' : 'Service degraded';

    if (!branding.statusEnabled) {
        return (
            <Page>
                <section className={'status-shell text-center'}>
                    <h1 className={'text-3xl mb-3'}>Status unavailable</h1>
                    <p className={'text-neutral-400 mb-6'}>This page is not public.</p>
                    <Link to={'/'} className={'text-primary-300 no-underline'}>
                        Return to panel
                    </Link>
                </section>
            </Page>
        );
    }

    return (
        <Page>
            <section className={'status-shell'}>
                <div className={'status-pill'}>
                    <FontAwesomeIcon icon={faCheckCircle} /> {statusLabel}
                </div>
                <p className={'mt-8 text-xs uppercase tracking-widest text-neutral-500'}>{name} status</p>
                <h1 className={'mt-3 text-4xl sm:text-5xl'}>{branding.statusTitle}</h1>
                <p className={'mt-4 text-neutral-400 max-w-xl leading-relaxed'}>{branding.statusMessage}</p>
                <div className={'status-grid'}>
                    <div>
                        <FontAwesomeIcon icon={faServer} className={'text-primary-300 mb-3'} />
                        <p>Panel</p>
                        <small className={'text-green-300'}>Operational</small>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faSignal} className={'text-primary-300 mb-3'} />
                        <p>Nodes</p>
                        <small className={data?.nodes?.unavailable ? 'text-red-300' : 'text-green-300'}>
                            {data ? `${data.nodes.operational}/${data.nodes.total} online` : 'Checking'}
                        </small>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faShieldAlt} className={'text-primary-300 mb-3'} />
                        <p>Maintenance</p>
                        <small className={data?.nodes?.maintenance ? 'text-yellow-300' : 'text-green-300'}>
                            {data ? `${data.nodes.maintenance} nodes` : 'Checking'}
                        </small>
                    </div>
                </div>
                <Link to={'/'} className={'inline-flex items-center gap-2 mt-8 text-primary-300 no-underline'}>
                    Open control panel <FontAwesomeIcon icon={faArrowRight} />
                </Link>
            </section>
        </Page>
    );
};
