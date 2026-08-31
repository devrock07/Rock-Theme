import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import VariableBox from '@/components/server/startup/VariableBox';
import updateStartupVariable from '@/api/server/updateStartupVariable';

const mockedMutate = jest.fn((_data?: unknown, _revalidate?: boolean) => Promise.resolve());
const mockedAddError = jest.fn((_error?: unknown) => undefined);

jest.mock('@/api/server/updateStartupVariable', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/api/swr/getServerStartup', () => ({
    __esModule: true,
    default: () => ({ mutate: (data: unknown, revalidate?: boolean) => mockedMutate(data, revalidate) }),
}));
jest.mock('@/plugins/usePermissions', () => ({ usePermissions: () => [true] }));
jest.mock('@/plugins/useFlash', () => ({
    __esModule: true,
    default: () => ({ clearFlashes: jest.fn(), clearAndAddHttpError: (error: unknown) => mockedAddError(error) }),
}));
jest.mock('@/state/server', () => ({
    ServerContext: {
        useStoreState: (selector: (state: { server: { data: { uuid: string } } }) => unknown) =>
            selector({ server: { data: { uuid: 'server-uuid' } } }),
    },
}));
jest.mock('@/components/elements/TitledGreyBox', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/elements/InputSpinner', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/components/FlashMessageRender', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/elements/Input', () => ({
    __esModule: true,
    default: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
        <input ref={ref} {...props} />
    )),
}));
jest.mock('@/components/elements/Select', () => ({
    __esModule: true,
    default: (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} />,
}));
jest.mock('@/components/elements/Switch', () => ({
    __esModule: true,
    default: () => null,
}));

const mockedUpdateStartupVariable = updateStartupVariable as jest.MockedFunction<typeof updateStartupVariable>;

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });

    return { promise, reject, resolve };
};

const variable = {
    name: 'Server group',
    description: 'A startup variable.',
    envVariable: 'SERVER_GROUP',
    defaultValue: '',
    serverValue: '',
    isEditable: true,
    rules: ['string'],
};

describe('VariableBox', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('serializes writes so the latest typed value reaches the backend last', async () => {
        const first = deferred<Awaited<ReturnType<typeof updateStartupVariable>>>();
        const second = deferred<Awaited<ReturnType<typeof updateStartupVariable>>>();
        mockedUpdateStartupVariable.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

        render(<VariableBox variable={variable} />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value: 'dev' } });
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(mockedUpdateStartupVariable).toHaveBeenLastCalledWith('server-uuid', 'SERVER_GROUP', 'dev');

        fireEvent.change(input, { target: { value: 'development' } });
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(mockedUpdateStartupVariable).toHaveBeenCalledTimes(1);

        await act(async () => {
            first.resolve([{ ...variable, serverValue: 'dev' }, 'run stale']);
            await first.promise;
            await Promise.resolve();
        });
        expect(mockedUpdateStartupVariable).toHaveBeenCalledTimes(2);
        expect(mockedUpdateStartupVariable).toHaveBeenLastCalledWith('server-uuid', 'SERVER_GROUP', 'development');

        await act(async () => {
            second.resolve([{ ...variable, serverValue: 'development' }, 'run latest']);
            await second.promise;
        });

        expect(input).toHaveValue('development');
        expect(mockedMutate).toHaveBeenCalledTimes(1);
        expect(mockedAddError).not.toHaveBeenCalled();
    });

    it('keeps a failed value visibly unsynced and retries it on demand', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockedUpdateStartupVariable
            .mockRejectedValueOnce(new Error('save failed'))
            .mockResolvedValueOnce([{ ...variable, serverValue: 'development' }, 'run latest']);

        render(<VariableBox variable={variable} />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value: 'development' } });
        await act(async () => {
            jest.advanceTimersByTime(500);
            await Promise.resolve();
        });

        expect(input).toHaveValue('development');
        expect(screen.getByText('Not saved')).toBeInTheDocument();
        expect(mockedAddError).toHaveBeenCalled();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
            await Promise.resolve();
        });

        expect(mockedUpdateStartupVariable).toHaveBeenLastCalledWith('server-uuid', 'SERVER_GROUP', 'development');
        expect(screen.queryByText('Not saved')).not.toBeInTheDocument();
        expect(mockedMutate).toHaveBeenCalledTimes(1);
    });
});
