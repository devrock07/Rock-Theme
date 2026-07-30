import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './reactbits-suite.css';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    glowColor?: string;
    particleCount?: number;
    enableStars?: boolean;
    enableTilt?: boolean;
    enableMagnetism?: boolean;
    clickEffect?: boolean;
};

export const MagicBentoCard: React.FC<CardProps> = ({
    children,
    className = '',
    glowColor = '201, 79, 89',
    particleCount = 7,
    enableStars = true,
    enableTilt = true,
    enableMagnetism = true,
    clickEffect = true,
    onPointerMove,
    onPointerEnter,
    onPointerLeave,
    onClick,
    ...props
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const particles = useRef<HTMLSpanElement[]>([]);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        const mobile = window.matchMedia('(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)');
        const update = () => setDisabled(mobile.matches);
        update();
        mobile.addEventListener?.('change', update);
        return () => mobile.removeEventListener?.('change', update);
    }, []);

    const clearParticles = (immediate = false) => {
        particles.current.forEach((particle) => {
            gsap.killTweensOf(particle);
            if (immediate) {
                particle.remove();
            } else {
                gsap.to(particle, {
                    opacity: 0,
                    scale: 0,
                    duration: 0.22,
                    onComplete: () => particle.remove(),
                });
            }
        });
        particles.current = [];
    };

    const handlePointerEnter: React.PointerEventHandler<HTMLDivElement> = (event) => {
        const element = ref.current;
        if (element && !disabled && enableStars && !particles.current.length) {
            const bounds = element.getBoundingClientRect();
            particles.current = Array.from({ length: particleCount }, (_, index) => {
                const particle = document.createElement('span');
                particle.className = 'magic-bento-particle';
                particle.style.setProperty('--particle-color', glowColor);
                particle.style.left = `${12 + Math.random() * Math.max(1, bounds.width - 24)}px`;
                particle.style.top = `${12 + Math.random() * Math.max(1, bounds.height - 24)}px`;
                element.appendChild(particle);
                gsap.fromTo(
                    particle,
                    { opacity: 0, scale: 0 },
                    {
                        opacity: 0.72,
                        scale: 1,
                        duration: 0.35,
                        delay: index * 0.045,
                        ease: 'back.out(1.7)',
                    }
                );
                gsap.to(particle, {
                    x: (Math.random() - 0.5) * 34,
                    y: (Math.random() - 0.5) * 34,
                    opacity: 0.24,
                    duration: 1.8 + Math.random(),
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                });
                return particle;
            });
        }
        onPointerEnter?.(event);
    };

    const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
        const element = ref.current;
        if (element) {
            const bounds = element.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            const normalizedX = x / bounds.width - 0.5;
            const normalizedY = y / bounds.height - 0.5;
            element.style.setProperty('--magic-x', `${x}px`);
            element.style.setProperty('--magic-y', `${y}px`);
            element.style.setProperty('--magic-color', glowColor);

            if (!disabled && (enableTilt || enableMagnetism)) {
                gsap.to(element, {
                    rotateX: enableTilt ? normalizedY * -2.5 : 0,
                    rotateY: enableTilt ? normalizedX * 2.5 : 0,
                    x: enableMagnetism ? normalizedX * 3 : 0,
                    y: enableMagnetism ? normalizedY * 3 : 0,
                    transformPerspective: 900,
                    duration: 0.28,
                    ease: 'power2.out',
                    overwrite: true,
                });
            }
        }
        onPointerMove?.(event);
    };

    const handlePointerLeave: React.PointerEventHandler<HTMLDivElement> = (event) => {
        clearParticles();
        if (ref.current && !disabled) {
            gsap.to(ref.current, {
                rotateX: 0,
                rotateY: 0,
                x: 0,
                y: 0,
                duration: 0.4,
                ease: 'power3.out',
                overwrite: true,
            });
        }
        onPointerLeave?.(event);
    };

    const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
        const element = ref.current;
        if (element && clickEffect && !disabled) {
            const bounds = element.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'magic-bento-ripple';
            ripple.style.setProperty('--particle-color', glowColor);
            ripple.style.left = `${event.clientX - bounds.left}px`;
            ripple.style.top = `${event.clientY - bounds.top}px`;
            element.appendChild(ripple);
            gsap.fromTo(
                ripple,
                { opacity: 0.52, scale: 0 },
                { opacity: 0, scale: 1, duration: 0.65, ease: 'power2.out', onComplete: () => ripple.remove() }
            );
        }
        onClick?.(event);
    };

    useEffect(
        () => () => {
            clearParticles(true);
            if (ref.current) gsap.killTweensOf(ref.current);
        },
        []
    );

    return (
        <div
            ref={ref}
            className={`magic-bento-card ${className}`}
            onPointerEnter={handlePointerEnter}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
            {...props}
        >
            {children}
        </div>
    );
};

export const MagicBentoGrid: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    onPointerMove,
    ...props
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
        if (ref.current) {
            const bounds = ref.current.getBoundingClientRect();
            ref.current.style.setProperty('--bento-grid-x', `${event.clientX - bounds.left}px`);
            ref.current.style.setProperty('--bento-grid-y', `${event.clientY - bounds.top}px`);
        }
        onPointerMove?.(event);
    };

    return (
        <div ref={ref} className={`magic-bento-grid ${className}`} onPointerMove={handlePointerMove} {...props}>
            {children}
        </div>
    );
};
