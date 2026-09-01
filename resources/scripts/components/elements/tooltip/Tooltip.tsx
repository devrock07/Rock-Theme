import React, { cloneElement, useRef, useState } from 'react';
import {
    arrow,
    autoUpdate,
    flip,
    offset,
    Placement,
    shift,
    Side,
    useClick,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useRole,
} from '@floating-ui/react-dom-interactions';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';
import { createPortal } from 'react-dom';
import useReducedMotion from '@/plugins/useReducedMotion';

type Interaction = 'hover' | 'click' | 'focus';

interface Props {
    rest?: number;
    delay?: number | Partial<{ open: number; close: number }>;
    content: string | React.ReactChild;
    disabled?: boolean;
    arrow?: boolean;
    interactions?: Interaction[];
    placement?: Placement;
    className?: string;
    children: React.ReactElement;
}

const arrowSides: Record<Side, string> = {
    top: 'bottom-[-6px] left-0',
    bottom: 'top-[-6px] left-0',
    right: 'top-0 left-[-6px]',
    left: 'top-0 right-[-6px]',
};

export default ({ children, ...props }: Props) => {
    const arrowEl = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const reducedMotion = useReducedMotion();

    const { x, y, reference, floating, middlewareData, strategy, context, placement } = useFloating({
        open,
        strategy: 'fixed',
        placement: props.placement || 'top',
        middleware: [
            offset(props.arrow ? 10 : 6),
            flip(),
            shift({ padding: 6 }),
            arrow({ element: arrowEl, padding: 6 }),
        ],
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
    });

    const interactions = props.interactions || ['hover', 'focus'];
    const { getReferenceProps, getFloatingProps } = useInteractions([
        useHover(context, {
            restMs: props.rest ?? 30,
            delay: props.delay ?? 0,
            enabled: interactions.includes('hover'),
        }),
        useFocus(context, { enabled: interactions.includes('focus') }),
        useClick(context, { enabled: interactions.includes('click') }),
        useRole(context, { role: 'tooltip' }),
        useDismiss(context),
    ]);

    const side = arrowSides[placement.split('-')[0] as Side];
    const { x: ax, y: ay } = middlewareData.arrow || {};

    if (props.disabled) {
        return children;
    }

    const floatingNode = (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: 2 }}
                    transition={{ duration: reducedMotion ? 0 : 0.1 }}
                    {...getFloatingProps({
                        ref: floating,
                        className:
                            'bg-gray-900 text-sm text-gray-200 px-3 py-2 rounded pointer-events-none max-w-[min(24rem,calc(100vw-0.75rem))]',
                        style: {
                            position: strategy,
                            top: `${y ?? 0}px`,
                            left: `${x ?? 0}px`,
                            zIndex: 20010,
                        },
                    })}
                >
                    {props.content}
                    {props.arrow && (
                        <div
                            ref={arrowEl}
                            style={{
                                transform: `translate(${Math.round(ax || 0)}px, ${Math.round(
                                    ay || 0
                                )}px) rotate(45deg)`,
                            }}
                            className={classNames('absolute bg-gray-900 w-3 h-3', side)}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {cloneElement(children, getReferenceProps({ ref: reference, ...children.props }))}
            {typeof document === 'undefined'
                ? floatingNode
                : createPortal(floatingNode, document.getElementById('modal-portal') || document.body)}
        </>
    );
};
