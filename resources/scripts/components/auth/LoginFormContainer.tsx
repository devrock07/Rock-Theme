import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${tw`w-full mx-auto px-4`};
    max-width: 920px;

    ${breakpoint('sm')`
        ${tw`px-8`}
    `};

    form {
        width: 100%;
    }

    .auth-shell {
        display: grid;
        width: 100%;
        grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
        min-height: 32rem;
        overflow: hidden;
        border: 1px solid var(--shell-border);
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(20, 17, 27, 0.88), rgba(9, 9, 11, 0.94));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 28px 90px rgba(0, 0, 0, 0.36);
        backdrop-filter: blur(24px) saturate(1.3);
    }

    .auth-brand {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2.25rem;
        overflow: hidden;
        border-right: 1px solid var(--shell-border);
        background: radial-gradient(circle at 70% 100%, rgba(153, 27, 39, 0.26), transparent 15rem),
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.065) 1px, transparent 0), #090909;
        background-size: auto, 24px 24px, auto;
    }

    .auth-mark {
        position: absolute;
        top: 2rem;
        left: 2rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: auto;
        height: auto;
        color: var(--shell-accent-bright);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.72rem;
        font-weight: 650;
        letter-spacing: 0.12em;
    }

    .auth-logo {
        width: 2rem;
        height: 2rem;
        border-radius: 7px;
        object-fit: contain;
    }

    .auth-brand-copy {
        position: relative;
        z-index: 1;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2.5rem;
    }

    .auth-form input {
        border-width: 1px;
        border-color: rgba(255, 255, 255, 0.12) !important;
        border-radius: 8px;
        background: #0b090a !important;
        color: #f4f3f7 !important;
        caret-color: var(--shell-accent-bright);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
    }

    .auth-form input:focus {
        border-color: rgba(201, 79, 89, 0.65) !important;
        box-shadow: 0 0 0 3px rgba(201, 79, 89, 0.1) !important;
    }

    .auth-form button[type='submit'] {
        border: 0;
        border-radius: 8px;
        background: linear-gradient(135deg, #d35a63, #ae3441);
        color: white;
        box-shadow: 0 12px 30px rgba(119, 24, 35, 0.24);
        text-transform: none;
        font-weight: 650;
        letter-spacing: 0;
        transition: transform 180ms ease, filter 180ms ease, box-shadow 180ms ease;
    }

    .auth-form button[type='submit']:hover,
    .auth-form button[type='submit']:focus {
        filter: brightness(1.08);
        box-shadow: 0 14px 34px rgba(119, 24, 35, 0.32);
        transform: translateY(-1px);
    }

    @media (max-width: 760px) {
        .auth-shell {
            grid-template-columns: 1fr;
        }

        .auth-brand {
            min-height: 12rem;
            justify-content: flex-end;
            padding: 5rem 1.5rem 1.5rem;
        }

        .auth-form {
            padding: 1.75rem 1.4rem 2rem;
        }
    }
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);

    return (
        <Container>
            <FlashMessageRender css={tw`mb-2 px-1`} />
            <Form {...props} ref={ref}>
                <div className={'auth-shell'}>
                    <div className={'auth-brand'}>
                        <span className={'auth-mark'}>
                            {branding.logo ? (
                                <img className={'auth-logo'} src={branding.logo} alt={''} aria-hidden={'true'} />
                            ) : (
                                <>
                                    {branding.mark} {name.toUpperCase()}
                                </>
                            )}
                        </span>
                        <div className={'auth-brand-copy'}>
                            <p css={tw`text-xs uppercase tracking-widest text-neutral-500 mb-4`}>{branding.owner}</p>
                            <h1 css={tw`text-4xl text-white leading-tight`}>Server control.</h1>
                        </div>
                    </div>
                    <div className={'auth-form'}>
                        {title && <h2 css={tw`text-2xl text-neutral-100 font-semibold mb-2`}>{title}</h2>}
                        <p css={tw`text-sm text-neutral-400 mb-7`}>Use your account.</p>
                        {props.children}
                    </div>
                </div>
            </Form>
            <p css={tw`text-center text-neutral-500 text-xs mt-4`}>
                {branding.owner} &copy; {branding.startYear} - {new Date().getFullYear()}
            </p>
        </Container>
    );
});
