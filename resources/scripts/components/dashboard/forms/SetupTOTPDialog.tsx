import React, { useContext, useEffect, useState } from 'react';
import { Dialog, DialogWrapperContext } from '@/components/elements/dialog';
import getTwoFactorTokenData, { TwoFactorTokenData } from '@/api/account/getTwoFactorTokenData';
import { useFlashKey } from '@/plugins/useFlash';
import tw from 'twin.macro';
import QRCode from 'qrcode.react';
import { Button } from '@/components/elements/button/index';
import Spinner from '@/components/elements/Spinner';
import { Input } from '@/components/elements/inputs';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import enableAccountTwoFactor from '@/api/account/enableAccountTwoFactor';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import asDialog from '@/hoc/asDialog';

interface Props {
    onTokens: (tokens: string[]) => void;
}

const ConfigureTwoFactorForm = ({ onTokens }: Props) => {
    const [submitting, setSubmitting] = useState(false);
    const [value, setValue] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState<TwoFactorTokenData | null>(null);
    const [tokenLoading, setTokenLoading] = useState(true);
    const [tokenFailed, setTokenFailed] = useState(false);
    const { clearAndAddHttpError } = useFlashKey('account:two-step');
    const updateUserData = useStoreActions((actions: Actions<ApplicationStore>) => actions.user.updateUserData);

    const { close, setProps } = useContext(DialogWrapperContext);

    const loadToken = () => {
        setTokenLoading(true);
        setTokenFailed(false);
        clearAndAddHttpError();

        getTwoFactorTokenData()
            .then(setToken)
            .catch((error) => {
                setTokenFailed(true);
                clearAndAddHttpError(error);
            })
            .finally(() => setTokenLoading(false));
    };

    useEffect(() => {
        loadToken();
    }, []);

    useEffect(() => {
        setProps((state) => ({ ...state, preventExternalClose: submitting }));
    }, [submitting]);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        let recoveryTokens: string[] | undefined;

        e.preventDefault();
        e.stopPropagation();

        if (submitting) return;

        setSubmitting(true);
        clearAndAddHttpError();
        enableAccountTwoFactor(value, password)
            .then((tokens) => {
                updateUserData({ useTotp: true });
                recoveryTokens = tokens;
            })
            .catch((error) => clearAndAddHttpError(error))
            .finally(() => setSubmitting(false))
            .then(() => recoveryTokens && onTokens(recoveryTokens));
    };

    return (
        <form id={'enable-totp-form'} onSubmit={submit}>
            <FlashMessageRender byKey={'account:two-step'} className={'mt-4'} />
            <div className={'flex items-center justify-center w-56 h-56 p-2 bg-gray-50 shadow mx-auto mt-6'}>
                {tokenLoading ? (
                    <Spinner />
                ) : token ? (
                    <QRCode renderAs={'svg'} value={token.image_url_data} css={tw`w-full h-full shadow-none`} />
                ) : (
                    <div css={tw`px-4 text-center`}>
                        <p css={tw`text-sm text-neutral-700 mb-3`}>The QR code could not be loaded.</p>
                        <Button.Text type={'button'} onClick={loadToken}>
                            Retry
                        </Button.Text>
                    </div>
                )}
            </div>
            <CopyOnClick text={token?.secret}>
                <p className={'font-mono text-sm text-gray-100 text-center mt-2'}>
                    {token?.secret.match(/.{1,4}/g)?.join(' ') || (tokenLoading ? 'Loading...' : 'Unavailable')}
                </p>
            </CopyOnClick>
            <p id={'totp-code-description'} className={'mt-6'}>
                Scan the QR code above using the two-step authentication app of your choice. Then, enter the 6-digit
                code generated into the field below.
            </p>
            <Input.Text
                aria-labelledby={'totp-code-description'}
                variant={Input.Text.Variants.Loose}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
                className={'mt-3'}
                placeholder={'000000'}
                type={'text'}
                inputMode={'numeric'}
                autoComplete={'one-time-code'}
                pattern={'\\d{6}'}
            />
            <label htmlFor={'totp-password'} className={'block mt-3'}>
                Account Password
            </label>
            <Input.Text
                variant={Input.Text.Variants.Loose}
                className={'mt-1'}
                type={'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)}
            />
            <Dialog.Footer>
                <Button.Text onClick={close}>Cancel</Button.Text>
                <Tooltip
                    disabled={password.length > 0 && value.length === 6}
                    content={
                        !token
                            ? tokenFailed
                                ? 'The QR code could not be loaded. Retry before continuing.'
                                : 'Waiting for QR code to load...'
                            : 'You must enter the 6-digit code and your password to continue.'
                    }
                    delay={100}
                >
                    <Button
                        disabled={!token || value.length !== 6 || !password.length}
                        type={'submit'}
                        form={'enable-totp-form'}
                    >
                        Enable
                    </Button>
                </Tooltip>
            </Dialog.Footer>
        </form>
    );
};

export default asDialog({
    title: 'Enable Two-Step Verification',
    description:
        "Help protect your account from unauthorized access. You'll be prompted for a verification code each time you sign in.",
})(ConfigureTwoFactorForm);
