import React, { useEffect, useMemo, useRef, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import tw from 'twin.macro';
import styled, { css } from 'styled-components/macro';
import { breakpoint } from '@/theme';
import Fade from '@/components/elements/Fade';
import { createPortal } from 'react-dom';

export interface RequiredModalProps {
    visible: boolean;
    onDismissed: () => void;
    appear?: boolean;
    top?: boolean;
}

export interface ModalProps extends RequiredModalProps {
    dismissable?: boolean;
    closeOnEscape?: boolean;
    closeOnBackground?: boolean;
    showSpinnerOverlay?: boolean;
    ariaLabel?: string;
}

export const ModalMask = styled.div`
    ${tw`fixed overflow-auto flex w-full inset-0`};
    z-index: 900;
    background: rgba(3, 3, 4, 0.78);
    backdrop-filter: blur(12px) saturate(0.9);
`;

const ModalContainer = styled.div<{ alignTop?: boolean }>`
    max-width: 95%;
    max-height: calc(100vh - 2rem);
    max-height: calc(100dvh - 2rem);
    ${breakpoint('md')`max-width: 75%`};
    ${breakpoint('lg')`max-width: 50%`};

    ${tw`relative flex flex-col w-full m-auto`};
    ${(props) =>
        props.alignTop &&
        css`
            margin-top: 20%;
            ${breakpoint('md')`margin-top: 10%`};
        `};

    margin-bottom: auto;

    & > .modal-surface {
        position: relative;
        overflow-x: hidden;
        color: var(--shell-text);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.055),
            color-mix(in srgb, var(--shell-panel-strong) 97%, transparent) 45%,
            rgba(var(--shell-accent-rgb), 0.11)
        );
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.075), 0 32px 90px rgba(0, 0, 0, 0.55);
    }

    & > .modal-surface::before {
        position: absolute;
        top: 0;
        right: 12%;
        left: 12%;
        height: 1px;
        content: '';
        pointer-events: none;
        background: linear-gradient(90deg, transparent, rgba(var(--shell-accent-rgb), 0.72), transparent);
    }

    & > .close-icon {
        ${tw`absolute right-0 p-2 text-white cursor-pointer opacity-50 transition-all duration-150 ease-linear hover:opacity-100`};
        top: -3rem;
        display: inline-flex;
        width: 2.75rem;
        height: 2.75rem;
        align-items: center;
        justify-content: center;
        border: 0;
        background: transparent;

        &:hover {
            ${tw`transform rotate-90`}
        }

        & > svg {
            ${tw`w-6 h-6`};
        }
    }
`;

const Modal: React.FC<ModalProps> = ({
    visible,
    appear,
    dismissable,
    showSpinnerOverlay,
    top = true,
    closeOnBackground = true,
    closeOnEscape = true,
    ariaLabel = 'Dialog',
    onDismissed,
    children,
}) => {
    const [render, setRender] = useState(visible);
    const container = useRef<HTMLDivElement>(null);
    // Capture this before a visible modal is committed. React applies autoFocus
    // during the commit itself, so reading activeElement from the focus effect
    // would otherwise remember an input inside the dialog instead of the
    // control that launched it.
    const previousFocus = useRef<HTMLElement | null>(
        visible && document.activeElement instanceof HTMLElement ? document.activeElement : null
    );
    const previousVisible = useRef(visible);

    const isDismissable = useMemo(() => {
        return (dismissable ?? true) && !showSpinnerOverlay;
    }, [dismissable, showSpinnerOverlay]);

    useEffect(() => {
        if (!render || !isDismissable || !closeOnEscape) return;

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setRender(false);
            }
        };

        window.addEventListener('keydown', handler);
        return () => {
            window.removeEventListener('keydown', handler);
        };
    }, [isDismissable, closeOnEscape, render]);

    useEffect(() => {
        if (visible && !previousVisible.current) {
            previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }

        previousVisible.current = visible;
        setRender(visible);
    }, [visible]);

    useEffect(() => {
        if (!render) return;

        const modal = container.current;
        const firstTarget =
            modal?.querySelector<HTMLElement>('[autofocus]') ||
            modal?.querySelector<HTMLElement>(
                '.modal-surface input:not([disabled]), .modal-surface select:not([disabled]), .modal-surface textarea:not([disabled]), .modal-surface button:not([disabled]), .modal-surface a[href]'
            ) ||
            modal?.querySelector<HTMLElement>('.close-icon') ||
            modal;
        firstTarget?.focus();

        const trapFocus = (event: KeyboardEvent) => {
            if (event.key !== 'Tab' || !modal) return;

            const focusable = Array.from(
                modal.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            );
            if (!focusable.length) {
                event.preventDefault();
                modal.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!modal.contains(document.activeElement)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            } else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', trapFocus);
        return () => {
            document.removeEventListener('keydown', trapFocus);
            previousFocus.current?.focus();
        };
    }, [render]);

    return (
        <Fade in={render} timeout={150} appear={appear ?? false} unmountOnExit onExited={() => onDismissed()}>
            <ModalMask
                onClick={(e) => e.stopPropagation()}
                onContextMenu={(e) => e.stopPropagation()}
                onMouseDown={(e) => {
                    if (isDismissable && closeOnBackground) {
                        e.stopPropagation();
                        if (e.target === e.currentTarget) {
                            setRender(false);
                        }
                    }
                }}
            >
                <ModalContainer
                    ref={container}
                    alignTop={top}
                    role={'dialog'}
                    aria-modal={'true'}
                    aria-label={ariaLabel}
                    tabIndex={-1}
                >
                    {isDismissable && (
                        <button
                            type={'button'}
                            className={'close-icon'}
                            onClick={() => setRender(false)}
                            aria-label={'Close dialog'}
                        >
                            <svg
                                xmlns={'http://www.w3.org/2000/svg'}
                                fill={'none'}
                                viewBox={'0 0 24 24'}
                                stroke={'currentColor'}
                            >
                                <path
                                    strokeLinecap={'round'}
                                    strokeLinejoin={'round'}
                                    strokeWidth={'2'}
                                    d={'M6 18L18 6M6 6l12 12'}
                                />
                            </svg>
                        </button>
                    )}
                    {showSpinnerOverlay && (
                        <Fade timeout={150} appear in>
                            <div
                                css={tw`absolute w-full h-full rounded flex items-center justify-center`}
                                style={{ background: 'hsla(211, 10%, 53%, 0.35)', zIndex: 9999 }}
                            >
                                <Spinner />
                            </div>
                        </Fade>
                    )}
                    <div
                        className={'modal-surface'}
                        css={tw`bg-neutral-800 p-3 sm:p-4 md:p-6 rounded shadow-md overflow-y-scroll transition-all duration-150`}
                    >
                        {children}
                    </div>
                </ModalContainer>
            </ModalMask>
        </Fade>
    );
};

const PortaledModal: React.FC<ModalProps> = ({ children, ...props }) => {
    const element = useRef(document.getElementById('modal-portal') || document.body);

    return createPortal(<Modal {...props}>{children}</Modal>, element.current);
};

export default PortaledModal;
