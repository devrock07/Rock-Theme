import React, { useEffect, useState } from 'react';
import getServerDatabases from '@/api/server/databases/getServerDatabases';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import DatabaseRow from '@/components/server/databases/DatabaseRow';
import Spinner from '@/components/elements/Spinner';
import CreateDatabaseButton from '@/components/server/databases/CreateDatabaseButton';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useDeepMemoize } from '@/plugins/useDeepMemoize';
import { Button } from '@/components/elements/button/index';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const databaseLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.databases);

    const { addError, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [reload, setReload] = useState(0);

    const databases = useDeepMemoize(ServerContext.useStoreState((state) => state.databases.data));
    const setDatabases = ServerContext.useStoreActions((state) => state.databases.setDatabases);

    useEffect(() => {
        let active = true;

        setLoading(!databases.length);
        setLoadFailed(false);
        clearFlashes('databases');

        getServerDatabases(uuid)
            .then((databases) => active && setDatabases(databases))
            .catch((error) => {
                if (!active) return;
                console.error(error);
                setLoadFailed(true);
                addError({ key: 'databases', message: httpErrorToHuman(error) });
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [uuid, reload]);

    return (
        <ServerContentBlock title={'Databases'}>
            <FlashMessageRender byKey={'databases'} css={tw`mb-4`} />
            {loadFailed && (
                <div css={tw`mb-4 flex flex-wrap items-center justify-between gap-3`}>
                    <p css={tw`text-sm text-neutral-300`}>Databases could not be refreshed.</p>
                    <Button.Text disabled={loading} onClick={() => setReload((value) => value + 1)}>
                        Retry
                    </Button.Text>
                </div>
            )}
            {!databases.length && loading ? (
                <Spinner size={'large'} centered />
            ) : (
                <Fade timeout={150}>
                    <>
                        {databases.length > 0 ? (
                            databases.map((database, index) => (
                                <DatabaseRow
                                    key={database.id}
                                    database={database}
                                    className={index > 0 ? 'mt-1' : undefined}
                                />
                            ))
                        ) : !loadFailed ? (
                            <p css={tw`text-center text-sm text-neutral-300`}>
                                {databaseLimit > 0
                                    ? 'It looks like you have no databases.'
                                    : 'Databases cannot be created for this server.'}
                            </p>
                        ) : null}
                        <Can action={'database.create'}>
                            <div css={tw`mt-6 flex items-center justify-end`}>
                                {databaseLimit > 0 && databases.length > 0 && (
                                    <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0`}>
                                        {databases.length} of {databaseLimit} databases have been allocated to this
                                        server.
                                    </p>
                                )}
                                {!loadFailed && databaseLimit > 0 && databaseLimit !== databases.length && (
                                    <CreateDatabaseButton css={tw`flex justify-end mt-6`} />
                                )}
                            </div>
                        </Can>
                    </>
                </Fade>
            )}
        </ServerContentBlock>
    );
};
