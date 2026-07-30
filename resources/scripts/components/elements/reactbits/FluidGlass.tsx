import React, { useRef } from 'react';
import './reactbits-suite.css';

type Props = React.HTMLAttributes<HTMLDivElement> & {
    intensity?: 'soft' | 'strong';
};

export default ({ children, className = '', intensity = 'soft', onPointerMove, ...props }: Props) => {
    const ref = useRef<HTMLDivElement>(null);

    const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
        if (ref.current) {
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
            <span className={'rb-fluid-caustic'} aria-hidden={'true'} />
            <div className={'rb-fluid-content'}>{children}</div>
        </div>
    );
};
