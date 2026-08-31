import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Spinner from '@/components/elements/Spinner';
import AddSubuserButton from '@/components/server/users/AddSubuserButton';
import UserRow from '@/components/server/users/UserRow';
import FlashMessageRender from '@/components/FlashMessageRender';
import getServerSubusers from '@/api/server/users/getServerSubusers';
import { httpErrorToHuman } from '@/api/http';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';

export default () => {
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [reload, setReload] = useState(0);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const subusers = ServerContext.useStoreState((state) => state.subusers.data);
    const setSubusers = ServerContext.useStoreActions((actions) => actions.subusers.setSubusers);

    const getPermissions = useStoreActions((actions: Actions<ApplicationStore>) => actions.permissions.getPermissions);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    useEffect(() => {
        let mounted = true;

        setLoading(true);
        setLoadFailed(false);
        clearFlashes('users');

        const requests = [
            getServerSubusers(uuid)
                .then((subusers) => {
                    if (mounted) setSubusers(subusers);
                })
                .catch((error) => {
                    if (!mounted) return;
                    console.error(error);
                    setLoadFailed(true);
                    addError({ key: 'users', message: httpErrorToHuman(error) });
                }),
            getPermissions().catch((error) => {
                if (!mounted) return;
                console.error(error);
                setLoadFailed(true);
                addError({ key: 'users', message: httpErrorToHuman(error) });
            }),
        ];

        Promise.all(requests).finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [uuid, reload]);

    if (!subusers.length && loading) {
        return <Spinner size={'large'} centered />;
    }

    return (
        <ServerContentBlock title={'Users'}>
            <FlashMessageRender byKey={'users'} css={tw`mb-4`} />
            {loadFailed && (
                <div css={tw`mb-4 flex justify-end`}>
                    <Button isSecondary onClick={() => setReload((value) => value + 1)}>
                        Retry
                    </Button>
                </div>
            )}
            {!subusers.length ? (
                <p css={tw`text-center text-sm text-neutral-300`}>It looks like you don&apos;t have any subusers.</p>
            ) : (
                subusers.map((subuser) => <UserRow key={subuser.uuid} subuser={subuser} />)
            )}
            <Can action={'user.create'}>
                <div css={tw`flex justify-end mt-6`}>
                    <AddSubuserButton />
                </div>
            </Can>
        </ServerContentBlock>
    );
};
