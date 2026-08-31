import React from 'react';
import { createPortal } from 'react-dom';
import Spinner, { SpinnerSize } from '@/components/elements/Spinner';
import Fade from '@/components/elements/Fade';
import tw from 'twin.macro';

interface Props {
    visible: boolean;
    fixed?: boolean;
    size?: SpinnerSize;
    backgroundOpacity?: number;
}

const SpinnerOverlay: React.FC<Props> = ({ size, fixed = false, visible, backgroundOpacity, children }) => {
    const overlay = (
        <Fade timeout={150} in={visible} unmountOnExit>
            <div
                css={[tw`inset-0 flex items-center justify-center flex-col`, fixed ? tw`fixed` : tw`absolute rounded`]}
                style={{
                    zIndex: fixed ? 10000 : 40,
                    background: `rgba(0, 0, 0, ${backgroundOpacity ?? 0.45})`,
                }}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onContextMenu={(event) => event.stopPropagation()}
            >
                <Spinner size={size} />
                {children &&
                    (typeof children === 'string' ? <p css={tw`mt-4 text-neutral-400`}>{children}</p> : children)}
            </div>
        </Fade>
    );

    if (!fixed || typeof document === 'undefined') {
        return overlay;
    }

    return createPortal(overlay, document.getElementById('modal-portal') || document.body);
};

export default SpinnerOverlay;
