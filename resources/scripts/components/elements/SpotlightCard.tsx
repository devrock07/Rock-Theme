import React, { useRef } from 'react';

/*
 * Pointer spotlight interaction adapted from React Bits by David Haz.
 * Licensed under MIT + Commons Clause. See THIRD_PARTY_NOTICES.md.
 */
interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    spotlightColor?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
    children,
    className = '',
    spotlightColor = 'rgba(var(--shell-accent-rgb), 0.12)',
    onMouseMove,
    ...props
}) => {
    const card = useRef<HTMLDivElement>(null);

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
        if (card.current) {
            const rect = card.current.getBoundingClientRect();
            card.current.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
            card.current.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
            card.current.style.setProperty('--spotlight-color', spotlightColor);
        }
        onMouseMove?.(event);
    };

    return (
        <div ref={card} className={`spotlight-card ${className}`} onMouseMove={handleMouseMove} {...props}>
            {children}
        </div>
    );
};

export default SpotlightCard;
