import getServer, { Server } from '@/api/server/getServer';
import { action, Action, computed, Computed, createContextStore, thunk, Thunk } from 'easy-peasy';
import socket, { SocketStore } from './socket';
import files, { ServerFileStore } from '@/state/server/files';
import subusers, { ServerSubuserStore } from '@/state/server/subusers';
import { composeWithDevTools } from 'redux-devtools-extension';
import schedules, { ServerScheduleStore } from '@/state/server/schedules';
import databases, { ServerDatabaseStore } from '@/state/server/databases';
import isEqual from 'react-fast-compare';

export type ServerStatus = 'offline' | 'starting' | 'stopping' | 'running' | null;

interface ServerDataStore {
    data?: Server;
    requestedServerId?: string;
    requestSequence: number;
    inConflictState: Computed<ServerDataStore, boolean>;
    isInstalling: Computed<ServerDataStore, boolean>;
    permissions: string[];

    getServer: Thunk<ServerDataStore, string, Record<string, unknown>, ServerStore, Promise<void>>;
    beginServerRequest: Action<ServerDataStore, string>;
    setServer: Action<ServerDataStore, Server>;
    setServerFromState: Action<ServerDataStore, (s: Server) => Server>;
    setPermissions: Action<ServerDataStore, string[]>;
}

const server: ServerDataStore = {
    permissions: [],
    requestSequence: 0,

    inConflictState: computed((state) => {
        if (!state.data) {
            return false;
        }

        return state.data.status !== null || state.data.isTransferring || state.data.isNodeUnderMaintenance;
    }),

    isInstalling: computed((state) => {
        return state.data?.status === 'installing' || state.data?.status === 'install_failed';
    }),

    getServer: thunk(async (actions, payload, { getState }) => {
        actions.beginServerRequest(payload);
        const requestSequence = getState().requestSequence;
        const [server, permissions] = await getServer(payload);

        if (getState().requestedServerId !== payload || getState().requestSequence !== requestSequence) return;

        actions.setServer(server);
        actions.setPermissions(permissions);
    }),

    beginServerRequest: action((state, payload) => {
        state.requestedServerId = payload;
        state.requestSequence += 1;
    }),

    setServer: action((state, payload) => {
        if (!isEqual(payload, state.data)) {
            state.data = payload;
        }
    }),

    setServerFromState: action((state, payload) => {
        const output = payload(state.data!);
        if (!isEqual(output, state.data)) {
            state.data = output;
        }
    }),

    setPermissions: action((state, payload) => {
        if (!isEqual(payload, state.permissions)) {
            state.permissions = payload;
        }
    }),
};

interface ServerStatusStore {
    value: ServerStatus;
    setServerStatus: Action<ServerStatusStore, ServerStatus>;
}

const status: ServerStatusStore = {
    value: null,
    setServerStatus: action((state, payload) => {
        state.value = payload;
    }),
};

export interface ServerStore {
    server: ServerDataStore;
    subusers: ServerSubuserStore;
    databases: ServerDatabaseStore;
    files: ServerFileStore;
    schedules: ServerScheduleStore;
    socket: SocketStore;
    status: ServerStatusStore;
    clearServerState: Action<ServerStore>;
}

export const ServerContext = createContextStore<ServerStore>(
    {
        server,
        socket,
        status,
        databases,
        files,
        subusers,
        schedules,
        clearServerState: action((state) => {
            state.server.data = undefined;
            state.server.requestedServerId = undefined;
            state.server.requestSequence += 1;
            state.server.permissions = [];
            state.databases.data = [];
            state.subusers.data = [];
            state.files.directory = '/';
            state.files.selectedFiles = [];
            Object.values(state.files.uploads).forEach((upload) => upload.abort.abort());
            state.files.uploads = {};
            state.schedules.data = [];
            state.status.value = null;

            if (state.socket.instance) {
                state.socket.instance.removeAllListeners();
                state.socket.instance.close();
            }

            state.socket.instance = null;
            state.socket.connected = false;
        }),
    },
    {
        compose: composeWithDevTools({
            name: 'ServerStore',
            trace: true,
        }),
    }
);
