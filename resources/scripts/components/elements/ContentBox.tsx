import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';
import FluidGlass from '@/components/elements/reactbits/FluidGlass';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && <h2 css={tw`text-neutral-300 mb-3 px-1 text-xl`}>{title}</h2>}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4`} />
        )}
        <FluidGlass className={'content-box-glass'} css={[tw`p-4 rounded relative`, !!borderColor && tw`border-t-4`]}>
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </FluidGlass>
    </div>
);

export default ContentBox;
