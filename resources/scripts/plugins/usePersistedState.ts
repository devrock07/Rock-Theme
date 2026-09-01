import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

const parsePersistedValue = <S>(item: string | null, defaultValue: S): S | undefined => {
    if (item === null) return defaultValue;

    try {
        return JSON.parse(item);
    } catch (error) {
        console.warn('Failed to retrieve persisted value from store.', error);

        return defaultValue;
    }
};

const readPersistedValue = <S>(key: string, defaultValue: S): S | undefined => {
    try {
        return parsePersistedValue(localStorage.getItem(key), defaultValue);
    } catch (error) {
        console.warn('Failed to retrieve persisted value from store.', error);

        return defaultValue;
    }
};

interface PersistedEntry<S> {
    key: string;
    value: S | undefined;
    persist: boolean;
}

export function usePersistedState<S = undefined>(
    key: string,
    defaultValue: S
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
    const [entry, setEntry] = useState<PersistedEntry<S>>(() => ({
        key,
        value: readPersistedValue(key, defaultValue),
        persist: true,
    }));
    const value = entry.key === key ? entry.value : readPersistedValue(key, defaultValue);

    const setState = useCallback<Dispatch<SetStateAction<S | undefined>>>(
        (next) => {
            setEntry((current) => {
                const currentValue = current.key === key ? current.value : readPersistedValue(key, defaultValue);

                return {
                    key,
                    value:
                        typeof next === 'function'
                            ? (next as (value: S | undefined) => S | undefined)(currentValue)
                            : next,
                    persist: true,
                };
            });
        },
        [key, defaultValue]
    );

    useEffect(() => {
        if (entry.key !== key) {
            setEntry({ key, value: readPersistedValue(key, defaultValue), persist: true });
        }
    }, [defaultValue, entry.key, key]);

    useEffect(() => {
        if (entry.key !== key || !entry.persist) return;

        try {
            if (entry.value === undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(entry.value));
            }
        } catch (error) {
            console.warn('Failed to persist value in store.', error);
        }
    }, [entry, key]);

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.storageArea !== localStorage || (event.key !== key && event.key !== null)) return;

            setEntry({
                key,
                value:
                    event.key === null || event.newValue === null
                        ? defaultValue
                        : parsePersistedValue(event.newValue, defaultValue),
                // The other document has already changed storage. Updating local
                // React state must not immediately write the fallback back and
                // undo a remote remove/clear operation.
                persist: false,
            });
        };

        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [defaultValue, key]);

    return [value, setState];
}
