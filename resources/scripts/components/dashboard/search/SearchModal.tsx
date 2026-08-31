import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Field, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { object, string } from 'yup';
import debounce from 'debounce';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import InputSpinner from '@/components/elements/InputSpinner';
import getServers from '@/api/getServers';
import { Server } from '@/api/server/getServer';
import { ApplicationStore } from '@/state';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import { ip } from '@/lib/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faCode, faHome, faKey, faServer, faTerminal, faUser } from '@fortawesome/free-solid-svg-icons';

type Props = RequiredModalProps;

interface Values {
    term: string;
}

const ServerResult = styled(Link)`
    ${tw`flex items-center bg-neutral-900 p-4 rounded border-l-4 border-neutral-900 no-underline transition-all duration-150`};

    &:hover {
        ${tw`shadow border-primary-500`};
    }

    &:not(:last-of-type) {
        ${tw`mb-2`};
    }
`;

const CommandResult = styled(Link)`
    ${tw`flex items-center p-3 rounded no-underline transition-all duration-150`};
    color: var(--shell-muted);
    border: 1px solid transparent;

    &:hover {
        color: var(--shell-text);
        border-color: var(--shell-border);
        background: rgba(var(--shell-accent-rgb), 0.07);
    }
`;

const SearchWatcher = ({ onReset }: { onReset: () => void }) => {
    const { setSubmitting, submitForm, values } = useFormikContext<Values>();

    useEffect(() => {
        if (values.term.length >= 3) {
            submitForm();
        } else {
            onReset();
            setSubmitting(false);
        }
    }, [onReset, setSubmitting, submitForm, values.term]);

    return null;
};

export default ({ ...props }: Props) => {
    const ref = useRef<HTMLInputElement>(null);
    const mounted = useRef(false);
    const requestGeneration = useRef(0);
    const isAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [servers, setServers] = useState<Server[]>([]);
    const commands = [
        { name: 'Dashboard', hint: 'Servers and telemetry', path: '/', icon: faHome },
        { name: 'Account', hint: 'Profile and security', path: '/account', icon: faUser },
        { name: 'API credentials', hint: 'Application access', path: '/account/api', icon: faCode },
        { name: 'SSH keys', hint: 'Secure file access', path: '/account/ssh', icon: faKey },
        { name: 'Public status', hint: 'Infrastructure status', path: '/status', icon: faServer },
    ];
    const { clearAndAddHttpError, clearFlashes } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes
    );

    const performSearch = useCallback(
        async ({ term }: Values, { setSubmitting }: FormikHelpers<Values>, generation: number) => {
            if (!mounted.current || generation !== requestGeneration.current) return;

            try {
                const response = await getServers({ query: term, type: isAdmin ? 'admin-all' : undefined });

                if (!mounted.current || generation !== requestGeneration.current) return;
                setServers(response.items.filter((_, index) => index < 5));
            } catch (error) {
                if (!mounted.current || generation !== requestGeneration.current) return;

                console.error(error);
                clearAndAddHttpError({ key: 'search', error });
            } finally {
                if (mounted.current && generation === requestGeneration.current) {
                    setSubmitting(false);
                    ref.current?.focus();
                }
            }
        },
        [clearAndAddHttpError, isAdmin]
    );
    const performSearchRef = useRef(performSearch);
    performSearchRef.current = performSearch;

    const debouncedSearch = useMemo(
        () =>
            debounce((values: Values, helpers: FormikHelpers<Values>, generation: number) => {
                void performSearchRef.current(values, helpers, generation);
            }, 500),
        []
    );

    const search = useCallback(
        (values: Values, helpers: FormikHelpers<Values>) => {
            const generation = ++requestGeneration.current;

            clearFlashes('search');
            setServers((current) => (current.length > 0 ? [] : current));
            debouncedSearch(values, helpers, generation);
        },
        [clearFlashes, debouncedSearch]
    );

    const resetSearch = useCallback(() => {
        requestGeneration.current += 1;
        debouncedSearch.clear();
        clearFlashes('search');
        setServers((current) => (current.length > 0 ? [] : current));
    }, [clearFlashes, debouncedSearch]);

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
            requestGeneration.current += 1;
            debouncedSearch.clear();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        if (props.visible) {
            if (ref.current) ref.current.focus();
        }
    }, [props.visible]);

    // Formik does not support an innerRef on custom components.
    const InputWithRef = useCallback(
        ({ onChange, ...inputProps }: React.InputHTMLAttributes<HTMLInputElement>) => (
            <Input
                autoFocus
                {...inputProps}
                ref={ref}
                onChange={(event) => {
                    onChange?.(event);
                    if (event.currentTarget.value.length < 3) resetSearch();
                }}
            />
        ),
        [resetSearch]
    );

    return (
        <Formik
            onSubmit={search}
            validationSchema={object().shape({ term: string() })}
            initialValues={{ term: '' } as Values}
        >
            {({ isSubmitting, values }) => (
                <Modal {...props}>
                    <Form>
                        <FormikFieldWrapper
                            name={'term'}
                            label={'Search term'}
                            description={'Search servers, pages, and actions.'}
                        >
                            <SearchWatcher onReset={resetSearch} />
                            <InputSpinner visible={isSubmitting}>
                                <Field as={InputWithRef} name={'term'} />
                            </InputSpinner>
                        </FormikFieldWrapper>
                    </Form>
                    <div css={tw`mt-5`}>
                        <p css={tw`text-2xs uppercase tracking-widest text-neutral-500 mb-2`}>Quick actions</p>
                        {commands
                            .filter((command) =>
                                `${command.name} ${command.hint}`.toLowerCase().includes(values.term.toLowerCase())
                            )
                            .map((command) => (
                                <CommandResult key={command.path} to={command.path} onClick={() => props.onDismissed()}>
                                    <FontAwesomeIcon icon={command.icon} css={tw`w-4 mr-3 text-primary-300`} />
                                    <span css={tw`flex-1 text-sm`}>{command.name}</span>
                                    <small css={tw`text-neutral-500`}>{command.hint}</small>
                                </CommandResult>
                            ))}
                        {isAdmin && (
                            <a
                                href={'/admin'}
                                className={
                                    'flex items-center p-3 rounded no-underline text-neutral-400 hover:text-white'
                                }
                            >
                                <FontAwesomeIcon icon={faBolt} css={tw`w-4 mr-3 text-primary-300`} />
                                <span css={tw`flex-1 text-sm`}>Admin panel</span>
                                <small css={tw`text-neutral-500`}>Administration</small>
                            </a>
                        )}
                    </div>
                    {servers.length > 0 && (
                        <div css={tw`mt-6`}>
                            <p css={tw`text-2xs uppercase tracking-widest text-neutral-500 mb-2`}>
                                <FontAwesomeIcon icon={faTerminal} css={tw`mr-2`} /> Servers
                            </p>
                            {servers.map((server) => (
                                <ServerResult
                                    key={server.uuid}
                                    to={`/server/${server.id}`}
                                    onClick={() => props.onDismissed()}
                                >
                                    <div css={tw`flex-1 mr-4`}>
                                        <p css={tw`text-sm`}>{server.name}</p>
                                        <p css={tw`mt-1 text-xs text-neutral-400`}>
                                            {server.allocations
                                                .filter((alloc) => alloc.isDefault)
                                                .map((allocation) => (
                                                    <span key={allocation.ip + allocation.port.toString()}>
                                                        {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                                    </span>
                                                ))}
                                        </p>
                                    </div>
                                    <div css={tw`flex-none text-right`}>
                                        <span css={tw`text-xs py-1 px-2 bg-primary-800 text-primary-100 rounded`}>
                                            {server.node}
                                        </span>
                                    </div>
                                </ServerResult>
                            ))}
                        </div>
                    )}
                </Modal>
            )}
        </Formik>
    );
};
