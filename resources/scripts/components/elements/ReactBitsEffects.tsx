import React, { useEffect, useRef } from 'react';
import './react-bits-effects.css';

/*
 * Lightweight adaptations of React Bits interaction patterns by David Haz:
 * SplitText, ShinyText, SpotlightCard, Magnet, and BorderGlow.
 * MIT + Commons Clause. See THIRD_PARTY_NOTICES.md.
 */

export const SplitText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
    <h1 className={`rb-split-text ${className}`} aria-label={text}>
        {text.split(' ').map((word, index) => (
            <span
                key={`${word}-${index}`}
                className={'rb-split-word'}
                style={{ animationDelay: `${100 + index * 72}ms` }}
                aria-hidden={'true'}
            >
                {word}&nbsp;
            </span>
        ))}
    </h1>
);

export const ShinyText: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => <span className={`rb-shiny-text ${className}`}>{children}</span>;

export const AmbientCursor: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        const motion = window.matchMedia(
            '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
        );
        if (!element || !motion.matches) return;

        let frame = 0;
        let x = window.innerWidth * 0.72;
        let y = window.innerHeight * 0.28;
        const render = () => {
            element.style.setProperty('--ambient-x', `${x}px`);
            element.style.setProperty('--ambient-y', `${y}px`);
            frame = 0;
        };
        const handlePointerMove = (event: PointerEvent) => {
            x = event.clientX;
            y = event.clientY;
            if (!frame) frame = window.requestAnimationFrame(render);
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, []);

    return <div ref={ref} className={'rb-ambient-cursor'} aria-hidden={'true'} />;
};

export const TiltSpotlight: React.FC<React.HTMLAttributes<HTMLDivElement> & { spotlightColor?: string }> = ({
    children,
    className = '',
    spotlightColor = 'rgba(201, 79, 89, 0.1)',
    onPointerMove,
    onPointerLeave,
    ...props
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
        if (ref.current) {
            const bounds = ref.current.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            const normalizedX = x / bounds.width - 0.5;
            const normalizedY = y / bounds.height - 0.5;

            ref.current.style.setProperty('--rb-depth-x', `${x}px`);
            ref.current.style.setProperty('--rb-depth-y', `${y}px`);
            ref.current.style.setProperty('--rb-tilt-x', `${normalizedY * -2}deg`);
            ref.current.style.setProperty('--rb-tilt-y', `${normalizedX * 2}deg`);
            ref.current.style.setProperty('--rb-depth-color', spotlightColor);
        }
        onPointerMove?.(event);
    };

    const handlePointerLeave: React.PointerEventHandler<HTMLDivElement> = (event) => {
        ref.current?.style.setProperty('--rb-tilt-x', '0deg');
        ref.current?.style.setProperty('--rb-tilt-y', '0deg');
        onPointerLeave?.(event);
    };

    return (
        <div
            ref={ref}
            className={`rb-depth-card ${className}`}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            {...props}
        >
            {children}
        </div>
    );
};

export const BorderGlow: React.FC<
    React.HTMLAttributes<HTMLDivElement> & { glowColor?: string; spotlightColor?: string }
> = ({
    children,
    className = '',
    glowColor = 'rgba(240, 138, 144, 0.95)',
    spotlightColor = 'rgba(201, 79, 89, 0.12)',
    onPointerMove,
    ...props
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
        if (ref.current) {
            const bounds = ref.current.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            const angle = Math.atan2(y - bounds.height / 2, x - bounds.width / 2) * (180 / Math.PI) + 90;
            ref.current.style.setProperty('--rb-glow-x', `${x}px`);
            ref.current.style.setProperty('--rb-glow-y', `${y}px`);
            ref.current.style.setProperty('--rb-glow-angle', `${angle}deg`);
            ref.current.style.setProperty('--rb-glow-color', glowColor);
            ref.current.style.setProperty('--rb-spotlight-color', spotlightColor);
        }
        onPointerMove?.(event);
    };

    return (
        <div ref={ref} className={`rb-border-glow ${className}`} onPointerMove={handlePointerMove} {...props}>
            <div className={'rb-border-content'}>{children}</div>
        </div>
    );
};
