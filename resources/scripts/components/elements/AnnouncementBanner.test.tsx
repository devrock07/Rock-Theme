import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useStoreState } from 'easy-peasy';
import AnnouncementBanner from '@/components/elements/AnnouncementBanner';

jest.mock('easy-peasy', () => ({ useStoreState: jest.fn() }));
jest.mock('styled-components/macro', () => ({
    __esModule: true,
    default: new Proxy(
        {},
        {
            get:
                (_target, tag: string) =>
                () =>
                ({
                    children,
                    $severity: _severity,
                    ...props
                }: React.HTMLAttributes<HTMLElement> & { $severity?: string }) =>
                    React.createElement(tag, props, children),
        }
    ),
}));

const mockedUseStoreState = useStoreState as jest.Mock;

describe('AnnouncementBanner', () => {
    let branding = {
        announcementEnabled: true,
        announcementMessage: 'Maintenance tonight.',
        announcementType: 'notice' as const,
        announcementLink: '/status',
    };

    beforeEach(() => {
        sessionStorage.clear();
        branding = {
            announcementEnabled: true,
            announcementMessage: 'Maintenance tonight.',
            announcementType: 'notice',
            announcementLink: '/status',
        };
        mockedUseStoreState.mockImplementation((selector) => selector({ settings: { data: { branding } } }));
    });

    it('supports internal links and dismisses only the current announcement', () => {
        const view = render(<AnnouncementBanner />);
        const link = screen.getByRole('link', { name: 'Learn details' });

        expect(link).toHaveAttribute('href', '/status');
        expect(link).not.toHaveAttribute('target');

        fireEvent.click(screen.getByRole('button', { name: 'Dismiss announcement' }));
        expect(screen.queryByText('Maintenance tonight.')).not.toBeInTheDocument();

        branding = { ...branding, announcementMessage: 'Maintenance completed.' };
        view.rerender(<AnnouncementBanner />);
        expect(screen.getByText('Maintenance completed.')).toBeInTheDocument();
    });

    it('opens HTTPS action links in a separate tab', () => {
        branding = { ...branding, announcementLink: 'https://status.example.com' };
        render(<AnnouncementBanner />);

        expect(screen.getByRole('link', { name: 'Learn details' })).toHaveAttribute('target', '_blank');
    });
});
