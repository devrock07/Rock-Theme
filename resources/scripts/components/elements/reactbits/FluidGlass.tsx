import React, { useRef } from 'react';
import useReducedMotion from '@/plugins/useReducedMotion';
import './reactbits-suite.css';

type Props = React.HTMLAttributes<HTMLDivElement> & {
    intensity?: 'soft' | 'strong';
};

export default ({ children, className = '', intensity = 'soft', onPointerMove, ...props }: Props) => {
    const ref = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();

    const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
        if (ref.current && !reducedMotion) {
            const bounds = ref.current.getBoundingClientRect();
            ref.current.style.setProperty('--glass-x', `${event.clientX - bounds.left}px`);
            ref.current.style.setProperty('--glass-y', `${event.clientY - bounds.top}px`);
        }
        onPointerMove?.(event);
    };

    return (
        <div
            ref={ref}
            className={`rb-fluid-glass rb-fluid-glass-${intensity} ${className}`}
            onPointerMove={handlePointerMove}
            {...props}
        >
            {!reducedMotion && <span className={'rb-fluid-caustic'} aria-hidden={'true'} />}
            <div className={'rb-fluid-content'}>{children}</div>
        </div>
    );
};
