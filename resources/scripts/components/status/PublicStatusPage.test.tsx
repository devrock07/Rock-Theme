import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { useStoreState } from 'easy-peasy';
import useSWR from 'swr';
import PublicStatusPage from '@/components/status/PublicStatusPage';

jest.mock('easy-peasy', () => ({ ...jest.requireActual('easy-peasy'), useStoreState: jest.fn() }));
jest.mock('swr', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/api/http', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('styled-components/macro', () => ({
    __esModule: true,
    default: new Proxy(
        {},
        {
            get:
                (_target, tag: string) =>
                () =>
                ({ children, ...props }: React.HTMLAttributes<HTMLElement>) =>
                    React.createElement(tag, props, children),
        }
    ),
}));

const mockedUseStoreState = useStoreState as jest.Mock;
const mockedUseSWR = useSWR as jest.Mock;

const renderPage = () =>
    render(
        <MemoryRouter>
            <PublicStatusPage />
        </MemoryRouter>
    );

describe('PublicStatusPage', () => {
    beforeEach(() => {
        mockedUseStoreState.mockImplementation((selector) =>
            selector({
                settings: {
                    data: {
                        name: 'Rock Panel',
                        branding: {
                            statusEnabled: true,
                            statusTitle: 'Systems operational',
                            statusMessage: 'Everything is online.',
                        },
                    },
                },
            })
        );
    });

    it('renders the live aggregate and privacy-safe node breakdown', () => {
        mockedUseSWR.mockReturnValue({
            data: {
                status: 'operational',
                nodes: {
                    total: 1,
                    operational: 1,
                    maintenance: 0,
                    unavailable: 0,
                    items: [{ id: 1, name: 'Miami Node', status: 'operational' }],
                },
                settings: { showNodes: true, mode: 'all' },
                checkedAt: '2026-08-04T00:00:00Z',
            },
            mutate: jest.fn(),
        });

        renderPage();
        expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
        expect(screen.getByText('Miami Node')).toBeInTheDocument();
        expect(screen.getByText('1/1 Online')).toBeInTheDocument();
    });

    it('shows an actionable degraded state when live checks fail', () => {
        const mutate = jest.fn();
        mockedUseSWR.mockReturnValue({ error: new Error('offline'), mutate });

        renderPage();
        expect(screen.getByText('Status Check Failed')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Retry now' }));
        expect(mutate).toHaveBeenCalledTimes(1);
    });
});
