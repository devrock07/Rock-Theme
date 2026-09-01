import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import {
    clearRockNotifications,
    getRockNotifications,
    hasPendingRockNotificationClear,
    initializeRockNotificationScope,
    markRockNotificationRead,
    setRockNotifications,
} from './rockNotifications';
import { clearServerNotifications, getRockAccountData, markServerNotificationRead } from '@/api/account/rockData';

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
const mockedGetRockAccountData = getRockAccountData as jest.Mock;
const mockedClearServerNotifications = clearServerNotifications as jest.Mock;

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
        initializeRockNotificationScope('test-user');
        document.body.innerHTML = '<div id="modal-portal"></div>';
        Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
        Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: 844 });
        Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
        jest.clearAllMocks();
        mockedGetRockAccountData.mockImplementation(() => new Promise(() => undefined));
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

        const trigger = screen.getByRole('button', { name: 'Notifications' });
        fireEvent.click(trigger);
        const close = screen.getByRole('button', { name: 'Close notifications' });
        expect(close).toHaveFocus();
        fireEvent.click(close);

        expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument();
        expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
        expect(trigger).toHaveFocus();
    });

    it('keeps keyboard focus inside the mobile notification dialog', () => {
        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        const trigger = screen.getByRole('button', { name: 'Notifications' });
        fireEvent.click(trigger);
        const close = screen.getByRole('button', { name: 'Close notifications' });
        const notificationLink = screen.getByRole('link', { name: /Server recovered/ });

        notificationLink.focus();
        fireEvent.keyDown(document, { key: 'Tab' });
        expect(screen.getByRole('button', { name: 'Clear notifications' })).toHaveFocus();

        close.focus();
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });

    it('keeps focus in the mobile dialog after clearing the focused action', async () => {
        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
        const clear = screen.getByRole('button', { name: 'Clear notifications' });
        clear.focus();
        fireEvent.click(clear);

        const close = screen.getByRole('button', { name: 'Close notifications' });
        await waitFor(() => expect(close).toHaveFocus());
        fireEvent.keyDown(document, { key: 'Tab' });
        expect(close).toHaveFocus();
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

    it('removes cached remote notifications after an authoritative empty sync', async () => {
        mockedGetRockAccountData.mockResolvedValue({
            serverPreferences: {},
            notificationsAvailable: true,
            notifications: [],
        });

        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        await waitFor(() => expect(getRockNotifications()).toEqual([]));
    });

    it('keeps cached notifications when remote storage is unavailable', async () => {
        mockedGetRockAccountData.mockResolvedValue({
            serverPreferences: {},
            notificationsAvailable: false,
            notifications: [],
        });

        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        await waitFor(() => expect(mockedGetRockAccountData).toHaveBeenCalled());
        expect(getRockNotifications()).toEqual([notification]);
    });

    it('retries a locally read remote notification on the next available sync', async () => {
        const remote = { ...notification, id: '42' };
        setRockNotifications([remote]);
        markRockNotificationRead(remote.id);
        mockedGetRockAccountData.mockResolvedValue({
            serverPreferences: {},
            notificationsAvailable: true,
            notifications: [
                {
                    id: remote.id,
                    type: 'recovered',
                    title: remote.title,
                    message: remote.message,
                    href: remote.href,
                    createdAt: new Date(remote.createdAt).toISOString(),
                },
            ],
        });

        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        await waitFor(() => expect(mockedMarkServerNotificationRead).toHaveBeenCalledWith(remote.id));
        expect(getRockNotifications()).toEqual([]);
    });

    it('retries a pending clear operation on the next available sync', async () => {
        clearRockNotifications();
        mockedGetRockAccountData.mockResolvedValue({
            serverPreferences: {},
            notificationsAvailable: true,
            notifications: [],
        });

        render(
            <MemoryRouter>
                <NotificationCenter />
            </MemoryRouter>
        );

        await waitFor(() => expect(mockedClearServerNotifications).toHaveBeenCalled());
        await waitFor(() => expect(hasPendingRockNotificationClear()).toBe(false));
    });
});
