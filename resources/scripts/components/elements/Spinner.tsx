import React, { Suspense } from 'react';
import styled, { css, keyframes } from 'styled-components/macro';
import tw from 'twin.macro';
import ErrorBoundary from '@/components/elements/ErrorBoundary';

export type SpinnerSize = 'small' | 'base' | 'large';

interface Props {
    size?: SpinnerSize;
    centered?: boolean;
    isBlue?: boolean;
}

interface SuspenseProps extends Props {
    resetKey?: React.Key;
}

interface Spinner extends React.FC<Props> {
    Size: Record<'SMALL' | 'BASE' | 'LARGE', SpinnerSize>;
    Suspense: React.FC<SuspenseProps>;
}

const spin = keyframes`
    to { transform: rotate(360deg); }
`;

// noinspection CssOverwrittenProperties
const SpinnerComponent = styled.div<Props>`
    ${tw`w-8 h-8 flex-none`};
    display: inline-block;
    box-sizing: border-box;
    aspect-ratio: 1 / 1;
    border-width: 3px;
    border-radius: 50%;
    animation: ${spin} 1s cubic-bezier(0.55, 0.25, 0.25, 0.7) infinite;

    ${(props) =>
        props.size === 'small'
            ? tw`w-4 h-4 border-2`
            : props.size === 'large'
            ? css`
                  ${tw`w-16 h-16`};
                  border-width: 6px;
              `
            : null};

    border-color: ${(props) => (!props.isBlue ? 'rgba(255, 255, 255, 0.16)' : 'rgba(var(--shell-accent-rgb), 0.2)')};
    border-top-color: ${(props) => (!props.isBlue ? 'rgb(255, 255, 255)' : 'var(--shell-accent-bright)')};
    box-shadow: 0 0 24px rgba(var(--shell-accent-rgb), 0.08);
`;

const Spinner: Spinner = ({ centered, ...props }) =>
    centered ? (
        <div css={[tw`flex justify-center items-center w-full min-w-0`, props.size === 'large' ? tw`my-20` : tw`my-6`]}>
            <SpinnerComponent role={'status'} aria-label={'Loading'} {...props} />
        </div>
    ) : (
        <SpinnerComponent role={'status'} aria-label={'Loading'} {...props} />
    );
Spinner.displayName = 'Spinner';

Spinner.Size = {
    SMALL: 'small',
    BASE: 'base',
    LARGE: 'large',
};

Spinner.Suspense = ({ children, centered = true, size = Spinner.Size.LARGE, resetKey, ...props }) => (
    <Suspense fallback={<Spinner centered={centered} size={size} {...props} />}>
        <ErrorBoundary resetKey={resetKey}>{children}</ErrorBoundary>
    </Suspense>
);
Spinner.Suspense.displayName = 'Spinner.Suspense';

export default Spinner;
