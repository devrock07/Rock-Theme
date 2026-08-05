import React from 'react';
import BoringAvatar, { AvatarProps } from 'boring-avatars';
import { useStoreState } from '@/state/hooks';

const crimsonPalette = ['#541019', '#8c202c', '#c94f59', '#e47a79', '#f0b0a5'];
const bluePalette = ['#0b2147', '#1d4b91', '#5b8cff', '#88adff', '#c3d5ff'];

type Props = Omit<AvatarProps, 'colors'>;

const _Avatar = ({ variant = 'beam', ...props }: AvatarProps) => {
    const blue = useStoreState((state) => state.settings.data?.branding.themePreset === 'blue');

    return <BoringAvatar colors={blue ? bluePalette : crimsonPalette} variant={variant} {...props} />;
};

const _UserAvatar = ({ variant = 'beam', ...props }: Omit<Props, 'name'>) => {
    const uuid = useStoreState((state) => state.user.data?.uuid);
    const blue = useStoreState((state) => state.settings.data?.branding.themePreset === 'blue');

    return (
        <BoringAvatar
            colors={blue ? bluePalette : crimsonPalette}
            name={uuid || 'system'}
            variant={variant}
            {...props}
        />
    );
};

_Avatar.displayName = 'Avatar';
_UserAvatar.displayName = 'Avatar.User';

const Avatar = Object.assign(_Avatar, {
    User: _UserAvatar,
});

export default Avatar;
