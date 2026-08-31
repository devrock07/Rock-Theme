import React, { useEffect, useRef, useState } from 'react';
import { Websocket } from '@/plugins/Websocket';
import { ServerContext } from '@/state/server';
import getWebsocketToken from '@/api/server/getWebsocketToken';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import tw from 'twin.macro';

const reconnectErrors = ['jwt: exp claim is invalid', 'jwt: created too far in past (denylist)'];

export default () => {
    const mounted = useRef(true);
    const connectionGeneration = useRef(0);
    const tokenUpdateGeneration = useRef(-1);
    const [error, setError] = useState<'connecting' | string>('');
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const currentUuid = useRef(uuid);
    currentUuid.current = uuid;
    const setServerStatus = ServerContext.useStoreActions((actions) => actions.status.setServerStatus);
    const { setInstance, setConnectionState } = ServerContext.useStoreActions((actions) => actions.socket);

    const isCurrentConnection = (generation: number, targetUuid: string) =>
        mounted.current && connectionGeneration.current === generation && currentUuid.current === targetUuid;

    const updateToken = (targetUuid: string, socket: Websocket, generation: number) => {
        if (!isCurrentConnection(generation, targetUuid) || tokenUpdateGeneration.current === generation) return;

        tokenUpdateGeneration.current = generation;
        getWebsocketToken(targetUuid)
            .then((data) => {
                if (isCurrentConnection(generation, targetUuid)) socket.setToken(data.token, true);
            })
            .catch((error) => {
                if (!isCurrentConnection(generation, targetUuid)) return;
                console.error(error);
                setError('Unable to refresh the console connection. Please retry.');
            })
            .finally(() => {
                if (tokenUpdateGeneration.current === generation) tokenUpdateGeneration.current = -1;
            });
    };

    const connect = (targetUuid: string) => {
        const generation = ++connectionGeneration.current;
        const socket = new Websocket();
        const active = () => isCurrentConnection(generation, targetUuid);

        socket.on('auth success', () => active() && setConnectionState(true));
        socket.on('SOCKET_CLOSE', () => active() && setConnectionState(false));
        socket.on('SOCKET_CONNECT_ERROR', () => {
            if (!active()) return;
            setError('Failed to connect to websocket instance after multiple attempts: try refreshing the page.');
        });
        socket.on('SOCKET_ERROR', () => {
            if (!active()) return;
            setError('connecting');
            setConnectionState(false);
        });
        socket.on('status', (status) => active() && setServerStatus(status));

        socket.on('daemon error', (message) => {
            if (active()) console.warn('Got error message from daemon socket:', message);
        });

        socket.on('token expiring', () => updateToken(targetUuid, socket, generation));
        socket.on('token expired', () => updateToken(targetUuid, socket, generation));
        socket.on('jwt error', (error: string) => {
            if (!active()) return;
            setConnectionState(false);
            console.warn('JWT validation error from wings:', error);

            if (reconnectErrors.find((v) => error.toLowerCase().indexOf(v) >= 0)) {
                updateToken(targetUuid, socket, generation);
            } else {
                setError(
                    'There was an error validating the credentials provided for the websocket. Please refresh the page.'
                );
            }
        });

        socket.on('transfer status', (status: string) => {
            if (!active()) return;
            if (status === 'starting' || status === 'success') {
                return;
            }

            // This code forces a reconnection to the websocket which will connect us to the target node instead of the source node
            // in order to be able to receive transfer logs from the target node.
            socket.close();
            setError('connecting');
            setConnectionState(false);
            setInstance(null);
            connect(targetUuid);
        });

        getWebsocketToken(targetUuid)
            .then((data) => {
                if (!active()) {
                    socket.close();
                    return;
                }

                // Connect and then set the authentication token.
                socket.setToken(data.token).connect(data.socket);

                // Once that is done, set the instance.
                setInstance(socket);
            })
            .catch((error) => {
                socket.close();
                if (!active()) return;
                console.error(error);
                setConnectionState(false);
                setError('Unable to start the console connection. Please retry.');
            });
    };

    const retry = () => {
        if (!uuid) return;

        instance?.close();
        setConnectionState(false);
        setInstance(null);
        setError('connecting');
        connect(uuid);
    };

    useEffect(() => {
        connected && setError('');
    }, [connected]);

    useEffect(
        () => () => {
            mounted.current = false;
            connectionGeneration.current += 1;
            tokenUpdateGeneration.current = -1;
        },
        []
    );

    useEffect(() => {
        return () => {
            instance && instance.close();
        };
    }, [instance]);

    useEffect(() => {
        // If there is already an instance or there is no server, just exit out of this process
        // since we don't need to make a new connection.
        if (instance || !uuid) {
            return;
        }

        connect(uuid);
    }, [uuid]);

    return error ? (
        <CSSTransition timeout={150} in appear classNames={'fade'}>
            <div css={tw`bg-red-500 py-2`}>
                <ContentContainer css={tw`flex items-center justify-center`}>
                    {error === 'connecting' ? (
                        <>
                            <Spinner size={'small'} />
                            <p css={tw`ml-2 text-sm text-red-100`}>
                                We&apos;re having some trouble connecting to your server, please wait...
                            </p>
                        </>
                    ) : (
                        <div css={tw`flex flex-wrap items-center justify-center gap-3 text-center`}>
                            <p css={tw`text-sm text-white`}>{error}</p>
                            <button
                                type={'button'}
                                css={tw`rounded border border-red-200/40 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600`}
                                onClick={retry}
                            >
                                Retry connection
                            </button>
                        </div>
                    )}
                </ContentContainer>
            </div>
        </CSSTransition>
    ) : null;
};
