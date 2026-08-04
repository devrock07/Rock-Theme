import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import { setRockNotifications } from './rockNotifications';

jest.mock('styled-components/macro', () => ({
    __esModule: true,
    default: new Proxy(
        {},
        {
            get: (_target, tag: string) => () =>
                React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) =>
                    React.createElement(tag, { ...props, ref }, children)
                ),
        }
    ),
}));

jest.mock('@/api/account/rockData', () => ({
    clearServerNotifications: jest.fn(() => Promise.resolve()),
    getRockAccountData: jest.fn(() => new Promise(() => undefined)),
}));

const notification = {
    id: 'server-recovered',
    title: 'Server recovered',
    message: 'The server is responding again.',
    tone: 'success' as const,
    createdAt: Date.now(),
    href: '/',
};

describe('NotificationCenter', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '<div id="modal-portal"></div>';
        Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
        Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: 844 });
        setRockNotifications([notification]);
    });

    it('renders a viewport-bound mobile dialog in the global portal', () => {
        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));

        const dialog = screen.getByRole('dialog', { name: 'Notifications' });
        expect(document.getElementById('modal-portal')).toContainElement(dialog);
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveStyle({ left: '12px', right: '12px' });
        expect(screen.getByText('Server recovered')).toBeVisible();
    });

    it('closes cleanly from the dialog action', () => {
        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
        fireEvent.click(screen.getByRole('button', { name: 'Close notifications' }));

        expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument();
        expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
    });

    it('anchors the desktop panel to the notification trigger', () => {
        window.innerWidth = 1280;
        window.innerHeight = 800;
        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        const trigger = screen.getByRole('button', { name: 'Notifications' });
        trigger.getBoundingClientRect = () =>
            ({
                bottom: 64,
                height: 38,
                left: 1162,
                right: 1200,
                top: 26,
                width: 38,
                x: 1162,
                y: 26,
                toJSON: () => undefined,
            } as DOMRect);
        fireEvent.click(trigger);

        const dialog = screen.getByRole('dialog', { name: 'Notifications' });
        expect(dialog).not.toHaveAttribute('aria-modal');
        expect(dialog).toHaveStyle({ top: '74px', right: '80px' });
    });
});
