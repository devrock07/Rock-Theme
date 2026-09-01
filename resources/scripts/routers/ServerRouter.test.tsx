import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ServerRouter from '@/routers/ServerRouter';

const mockGetServer = jest.fn();
const mockClearServerState = jest.fn();
let mockServerState: any;
let mockMatch: any;
let mockLocation: any;

jest.mock('@/state/server', () => ({
    ServerContext: {
        useStoreState: (selector: (state: unknown) => unknown) => selector(mockServerState),
        useStoreActions: (selector: (actions: unknown) => unknown) =>
            selector({ server: { getServer: mockGetServer }, clearServerState: mockClearServerState }),
    },
}));

jest.mock('easy-peasy', () => ({
    useStoreState: (selector: (state: unknown) => unknown) => selector({ user: { data: { rootAdmin: false } } }),
}));

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return { ...actual, useRouteMatch: () => mockMatch };
});
jest.mock('react-router', () => ({ useLocation: () => mockLocation }));

jest.mock('@/api/http', () => ({ httpErrorToHuman: (error: Error) => error.message }));
jest.mock('@/components/NavigationBar', () => () => null);
jest.mock('@/components/elements/AnnouncementBanner', () => () => null);
jest.mock('@/components/server/TransferListener', () => () => null);
jest.mock('@/components/server/WebsocketHandler', () => () => null);
jest.mock('@/components/server/InstallListener', () => () => null);
jest.mock('@/components/MobileBottomNav', () => () => null);
jest.mock('@/components/Sidebar', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);
jest.mock('@/components/elements/Can', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);
jest.mock('@/components/elements/ErrorBoundary', () => ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
));
jest.mock('@/components/elements/PermissionRoute', () => ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
));
jest.mock('@/components/server/ConflictStateRenderer', () => () => null);
jest.mock('@/TransitionRouter', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);
jest.mock('@/routers/routes', () => ({ __esModule: true, default: { server: [] } }));
jest.mock('@/components/elements/Spinner', () => {
    const Spinner = () => <div role={'status'}>Loading server</div>;
    Spinner.Suspense = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    return { __esModule: true, default: Spinner };
});
jest.mock('@/components/elements/ScreenBlock', () => ({
    NotFound: () => null,
    ServerError: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
        <div role={'alert'}>
            {message}
            <button type={'button'} onClick={onRetry}>
                Retry
            </button>
        </div>
    ),
}));

const pending = () => new Promise<void>(() => undefined);

const deferred = () => {
    let reject!: (error: Error) => void;
    const promise = new Promise<void>((_resolve, fail) => {
        reject = fail;
    });

    return { promise, reject };
};

describe('ServerRouter asynchronous loading', () => {
    let consoleError: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockServerState = {
            server: { data: undefined, inConflictState: false },
            status: { value: 'offline' },
        };
        mockMatch = { params: { id: 'server-a' }, path: '/server/:id', url: '/server/server-a' };
        mockLocation = { pathname: '/server/server-a', search: '', hash: '' };
        mockGetServer.mockImplementation(pending);
    });

    afterEach(() => consoleError.mockRestore());

    it('offers a working retry after a server request fails', async () => {
        mockGetServer.mockRejectedValueOnce(new Error('Server could not be loaded.'));
        render(<ServerRouter />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Server could not be loaded.');
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

        await waitFor(() => expect(mockGetServer).toHaveBeenCalledTimes(2));
        expect(mockGetServer).toHaveBeenNthCalledWith(2, 'server-a');
        expect(screen.getByRole('status')).toHaveTextContent('Loading server');
    });

    it('ignores a stale failure after navigation starts loading another server', async () => {
        const first = deferred();
        mockGetServer.mockReturnValueOnce(first.promise).mockImplementation(pending);
        const view = render(<ServerRouter />);

        mockMatch = { params: { id: 'server-b' }, path: '/server/:id', url: '/server/server-b' };
        mockLocation = { pathname: '/server/server-b', search: '', hash: '' };
        view.rerender(<ServerRouter />);

        await waitFor(() => expect(mockGetServer).toHaveBeenCalledWith('server-b'));
        await act(async () => first.reject(new Error('Old server failed.')));

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Loading server');
        expect(mockClearServerState).toHaveBeenCalled();
    });
});
