import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { usePersistedState } from '@/plugins/usePersistedState';

const Harness = ({ storageKey, fallback = 'fallback' }: { storageKey: string; fallback?: string }) => {
    const [value, setValue] = usePersistedState(storageKey, fallback);

    return (
        <>
            <output aria-label={'Persisted value'}>{value}</output>
            <button type={'button'} onClick={() => setValue((current) => `${current || ''}!`)}>
                Update
            </button>
            <button type={'button'} onClick={() => setValue(undefined)}>
                Remove
            </button>
        </>
    );
};

describe('usePersistedState', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('hydrates and persists functional updates', async () => {
        localStorage.setItem('settings:a', JSON.stringify('saved'));
        render(<Harness storageKey={'settings:a'} />);

        expect(screen.getByLabelText('Persisted value')).toHaveTextContent('saved');
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() => expect(localStorage.getItem('settings:a')).toBe(JSON.stringify('saved!')));
    });

    it('switches storage scopes without leaking or overwriting the previous value', async () => {
        localStorage.setItem('settings:a', JSON.stringify('account A'));
        localStorage.setItem('settings:b', JSON.stringify('account B'));
        const view = render(<Harness storageKey={'settings:a'} />);

        view.rerender(<Harness storageKey={'settings:b'} />);

        expect(screen.getByLabelText('Persisted value')).toHaveTextContent('account B');
        await waitFor(() => expect(localStorage.getItem('settings:b')).toBe(JSON.stringify('account B')));
        expect(localStorage.getItem('settings:a')).toBe(JSON.stringify('account A'));
    });

    it('recovers from malformed data and unavailable storage writes', async () => {
        localStorage.setItem('settings:a', '{bad json');
        const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('Storage full', 'QuotaExceededError');
        });

        render(<Harness storageKey={'settings:a'} />);

        expect(screen.getByLabelText('Persisted value')).toHaveTextContent('fallback');
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        await waitFor(() =>
            expect(warning).toHaveBeenCalledWith('Failed to persist value in store.', expect.anything())
        );
        expect(setItem).toHaveBeenCalled();
    });

    it('removes the key when the value becomes undefined', async () => {
        localStorage.setItem('settings:a', JSON.stringify('saved'));
        render(<Harness storageKey={'settings:a'} />);

        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

        await waitFor(() => expect(localStorage.getItem('settings:a')).toBeNull());
    });

    it('updates from storage events emitted by another tab', async () => {
        render(<Harness storageKey={'settings:a'} />);
        localStorage.setItem('settings:a', JSON.stringify('remote'));

        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'settings:a',
                    newValue: JSON.stringify('remote'),
                    storageArea: localStorage,
                })
            );
        });

        await waitFor(() => expect(screen.getByLabelText('Persisted value')).toHaveTextContent('remote'));
    });

    it('resets to the fallback after another tab removes the key without recreating it', async () => {
        localStorage.setItem('settings:a', JSON.stringify('saved'));
        render(<Harness storageKey={'settings:a'} />);
        localStorage.removeItem('settings:a');

        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'settings:a',
                    oldValue: JSON.stringify('saved'),
                    newValue: null,
                    storageArea: localStorage,
                })
            );
        });

        await waitFor(() => expect(screen.getByLabelText('Persisted value')).toHaveTextContent('fallback'));
        expect(localStorage.getItem('settings:a')).toBeNull();
    });

    it('resets to the fallback when another tab clears storage without recreating the key', async () => {
        localStorage.setItem('settings:a', JSON.stringify('saved'));
        render(<Harness storageKey={'settings:a'} />);
        localStorage.clear();

        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: null,
                    oldValue: null,
                    newValue: null,
                    storageArea: localStorage,
                })
            );
        });

        await waitFor(() => expect(screen.getByLabelText('Persisted value')).toHaveTextContent('fallback'));
        expect(localStorage.getItem('settings:a')).toBeNull();
    });
});
