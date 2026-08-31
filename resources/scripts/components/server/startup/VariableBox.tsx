import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ServerEggVariable } from '@/api/server/types';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { usePermissions } from '@/plugins/usePermissions';
import InputSpinner from '@/components/elements/InputSpinner';
import Input from '@/components/elements/Input';
import Switch from '@/components/elements/Switch';
import { debounce } from 'debounce';
import updateStartupVariable from '@/api/server/updateStartupVariable';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import getServerStartup from '@/api/swr/getServerStartup';
import Select from '@/components/elements/Select';
import isEqual from 'react-fast-compare';
import { ServerContext } from '@/state/server';

interface Props {
    variable: ServerEggVariable;
}

const VariableBox = ({ variable }: Props) => {
    const FLASH_KEY = `server:startup:${variable.envVariable}`;

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [loading, setLoading] = useState(false);
    const [unsynced, setUnsynced] = useState(false);
    const [value, setValue] = useState(() => variable.serverValue ?? variable.defaultValue ?? '');
    const mounted = useRef(false);
    const requestGeneration = useRef(0);
    const hasLocalChange = useRef(false);
    const queuedWrite = useRef<{ value: string; generation: number } | null>(null);
    const writeInFlight = useRef(false);
    const [canEdit] = usePermissions(['startup.update']);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { mutate } = getServerStartup(uuid);

    const persistVariable = useCallback(
        async (nextValue: string, generation: number) => {
            queuedWrite.current = { value: nextValue, generation };
            if (writeInFlight.current) return;

            writeInFlight.current = true;
            while (queuedWrite.current) {
                const write = queuedWrite.current;
                queuedWrite.current = null;
                clearFlashes(FLASH_KEY);

                try {
                    const [response, invocation] = await updateStartupVariable(uuid, variable.envVariable, write.value);

                    if (mounted.current && write.generation === requestGeneration.current) {
                        await mutate(
                            (data) => ({
                                ...data,
                                invocation,
                                variables: (data.variables || []).map((item) =>
                                    item.envVariable === response.envVariable ? response : item
                                ),
                            }),
                            false
                        );
                        hasLocalChange.current = false;
                        setUnsynced(false);
                    }
                } catch (error) {
                    if (mounted.current && write.generation === requestGeneration.current) {
                        console.error(error);
                        clearAndAddHttpError({ error, key: FLASH_KEY });
                        setUnsynced(true);
                    }
                }
            }

            writeInFlight.current = false;
            if (mounted.current && !queuedWrite.current) setLoading(false);
        },
        [FLASH_KEY, clearAndAddHttpError, clearFlashes, mutate, uuid, variable.envVariable]
    );
    const persistVariableRef = useRef(persistVariable);
    persistVariableRef.current = persistVariable;

    const setVariableValue = useMemo(
        () =>
            debounce((nextValue: string, generation: number) => {
                void persistVariableRef.current(nextValue, generation);
            }, 500),
        []
    );

    const updateValue = useCallback(
        (nextValue: string) => {
            const generation = ++requestGeneration.current;

            hasLocalChange.current = true;
            setUnsynced(false);
            setValue(nextValue);
            setLoading(true);
            setVariableValue(nextValue, generation);
        },
        [setVariableValue]
    );

    const retryLatestValue = useCallback(() => {
        const generation = ++requestGeneration.current;

        hasLocalChange.current = true;
        setUnsynced(false);
        setLoading(true);
        void persistVariable(value, generation);
    }, [persistVariable, value]);

    useEffect(() => {
        if (!hasLocalChange.current) {
            setValue(variable.serverValue ?? variable.defaultValue ?? '');
            setUnsynced(false);
        }
    }, [variable.defaultValue, variable.serverValue]);

    useEffect(() => {
        mounted.current = true;

        return () => {
            setVariableValue.flush();
            mounted.current = false;
            requestGeneration.current += 1;
        };
    }, [setVariableValue]);

    const useSwitch = variable.rules.some(
        (v) => v === 'boolean' || v === 'in:0,1' || v === 'in:1,0' || v === 'in:true,false' || v === 'in:false,true'
    );
    const isStringSwitch = variable.rules.some((v) => v === 'string');
    const selectValues = variable.rules.find((v) => v.startsWith('in:'))?.split(',') || [];

    return (
        <TitledGreyBox
            title={
                <p className='text-sm uppercase'>
                    {!variable.isEditable && (
                        <span className='bg-neutral-700 text-xs py-1 px-2 rounded-full mr-2 mb-1'>Read Only</span>
                    )}
                    {variable.name}
                </p>
            }
        >
            <FlashMessageRender byKey={FLASH_KEY} className='mb-2 md:mb-4' />
            {unsynced && (
                <div className='mb-3 flex items-center justify-between gap-3 text-xs text-red-300' role='status'>
                    <span>Not saved</span>
                    <button
                        type='button'
                        className='rounded border border-primary-500/40 px-2 py-1 text-primary-300 hover:bg-primary-900/40'
                        onClick={retryLatestValue}
                    >
                        Retry
                    </button>
                </div>
            )}
            <InputSpinner visible={loading}>
                {useSwitch ? (
                    <>
                        <Switch
                            readOnly={!canEdit || !variable.isEditable}
                            name={variable.envVariable}
                            checked={isStringSwitch ? value === 'true' : value === '1'}
                            onChange={(event) => {
                                if (canEdit && variable.isEditable) {
                                    updateValue(
                                        isStringSwitch
                                            ? event.currentTarget.checked
                                                ? 'true'
                                                : 'false'
                                            : event.currentTarget.checked
                                            ? '1'
                                            : '0'
                                    );
                                }
                            }}
                        />
                    </>
                ) : (
                    <>
                        {selectValues.length > 0 ? (
                            <>
                                <Select
                                    onChange={(e) => updateValue(e.target.value)}
                                    name={variable.envVariable}
                                    value={value}
                                    disabled={!canEdit || !variable.isEditable}
                                >
                                    {selectValues.map((selectValue) => (
                                        <option
                                            key={selectValue.replace('in:', '')}
                                            value={selectValue.replace('in:', '')}
                                        >
                                            {selectValue.replace('in:', '')}
                                        </option>
                                    ))}
                                </Select>
                            </>
                        ) : (
                            <>
                                <Input
                                    onChange={(e) => {
                                        if (canEdit && variable.isEditable) {
                                            updateValue(e.currentTarget.value);
                                        }
                                    }}
                                    readOnly={!canEdit || !variable.isEditable}
                                    name={variable.envVariable}
                                    value={value}
                                    placeholder={variable.defaultValue}
                                />
                            </>
                        )}
                    </>
                )}
            </InputSpinner>

            <p className='mt-1 text-xs text-neutral-300'>{variable.description}</p>
        </TitledGreyBox>
    );
};

export default memo(VariableBox, isEqual);
