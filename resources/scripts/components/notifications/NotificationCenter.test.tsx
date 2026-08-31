import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import { setRockNotifications } from './rockNotifications';
import { markServerNotificationRead } from '@/api/account/rockData';

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
    markServerNotificationRead: jest.fn(() => Promise.resolve()),
    getRockAccountData: jest.fn(() => new Promise(() => undefined)),
}));

const mockedMarkServerNotificationRead = markServerNotificationRead as jest.Mock;

const notification = {
    id: 'server-recovered',
    title: 'Server recovered',
    message: 'The server is responding again.',
    tone: 'success' as const,
    createdAt: Date.now(),
    href: '/',
    remote: true,
};

describe('NotificationCenter', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '<div id="modal-portal"></div>';
        Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
        Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: 844 });
        Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
        jest.clearAllMocks();
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
        expect(dialog).toHaveStyle({ left: '12px', right: 'auto', width: '366px' });
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

    it('marks a remote notification read when it is opened', () => {
        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
        fireEvent.click(screen.getByText('Server recovered'));

        expect(mockedMarkServerNotificationRead).toHaveBeenCalledWith('server-recovered');
        expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument();
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

    it('stays inside the Android visual viewport when browser chrome moves it', () => {
        const visualViewport = {
            width: 360,
            height: 400,
            offsetLeft: 5,
            offsetTop: 20,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };
        Object.defineProperty(window, 'visualViewport', { configurable: true, value: visualViewport });

        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        const trigger = screen.getByRole('button', { name: 'Notifications' });
        trigger.getBoundingClientRect = () => ({ bottom: 60 } as DOMRect);
        fireEvent.click(trigger);

        expect(screen.getByRole('dialog', { name: 'Notifications' })).toHaveStyle({
            top: '70px',
            left: '17px',
            width: '336px',
            maxHeight: '338px',
        });
        expect(visualViewport.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
});
