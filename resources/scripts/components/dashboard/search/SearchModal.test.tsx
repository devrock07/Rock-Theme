import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchModal from '@/components/dashboard/search/SearchModal';
import getServers from '@/api/getServers';

const mockedClearFlashes = jest.fn((_key?: string) => undefined);
const mockedAddError = jest.fn((_error?: unknown) => undefined);

jest.mock('@/api/getServers', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('easy-peasy', () => ({
    useStoreState: (selector: (state: { user: { data: { rootAdmin: boolean } } }) => unknown) =>
        selector({ user: { data: { rootAdmin: false } } }),
    useStoreActions: () => ({ clearAndAddHttpError: mockedAddError, clearFlashes: mockedClearFlashes }),
}));
jest.mock('twin.macro', () => ({ __esModule: true, default: () => '' }));
jest.mock('styled-components/macro', () => {
    const createStyledComponent = (element: React.ElementType) => () =>
        React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) =>
            React.createElement(element, { ...props, ref }, children)
        );
    const styled = new Proxy(createStyledComponent, {
        get: (_target, element: string) => createStyledComponent(element),
    });

    return { __esModule: true, default: styled };
});
jest.mock('@/components/elements/Modal', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/elements/FormikFieldWrapper', () => ({
    __esModule: true,
    default: ({ children, label }: { children: React.ReactNode; label?: string }) => (
        <label>
            {label}
            {children}
        </label>
    ),
}));
jest.mock('@/components/elements/InputSpinner', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@/components/elements/Input', () => ({
    __esModule: true,
    default: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
        <input ref={ref} {...props} />
    )),
}));

const mockedGetServers = getServers as jest.MockedFunction<typeof getServers>;

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });

    return { promise, reject, resolve };
};

const response = (name: string) =>
    ({
        items: [
            {
                id: name.toLowerCase(),
                uuid: `${name.toLowerCase()}-uuid`,
                name,
                node: 'Node 1',
                allocations: [{ alias: null, ip: '127.0.0.1', isDefault: true, port: 25565 }],
            },
        ],
        pagination: {},
    } as Awaited<ReturnType<typeof getServers>>);

describe('SearchModal', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('keeps only the newest response and clears results when the query becomes too short', async () => {
        const first = deferred<Awaited<ReturnType<typeof getServers>>>();
        const second = deferred<Awaited<ReturnType<typeof getServers>>>();
        mockedGetServers.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

        render(
            <MemoryRouter>
                <SearchModal visible onDismissed={jest.fn()} />
            </MemoryRouter>
        );
        const input = screen.getByRole('textbox', { name: 'Search term' });

        await act(async () => {
            fireEvent.change(input, { target: { value: 'old' } });
        });
        act(() => {
            jest.advanceTimersByTime(500);
        });

        await act(async () => {
            fireEvent.change(input, { target: { value: 'newest' } });
        });
        act(() => {
            jest.advanceTimersByTime(500);
        });

        await act(async () => {
            second.resolve(response('Newest server'));
            await second.promise;
        });
        await act(async () => {
            first.resolve(response('Stale server'));
            await first.promise;
        });

        expect(screen.getByText('Newest server')).toBeInTheDocument();
        expect(screen.queryByText('Stale server')).not.toBeInTheDocument();
        expect(mockedAddError).not.toHaveBeenCalled();

        await act(async () => {
            fireEvent.change(input, { target: { value: 'no' } });
            await Promise.resolve();
        });

        expect(input).toHaveValue('no');
        expect(mockedClearFlashes).toHaveBeenCalledWith('search');
        expect(screen.queryByText('Newest server')).not.toBeInTheDocument();
    });
});
