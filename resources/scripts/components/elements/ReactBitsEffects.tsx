import React, { useEffect, useRef } from 'react';
import './react-bits-effects.css';

/*
 * Lightweight adaptations of React Bits interaction patterns by David Haz:
 * SplitText, ShinyText, SpotlightCard, Magnet, BorderGlow, and ClickSpark.
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

interface Spark {
    x: number;
    y: number;
    angle: number;
    started: number;
}

export const ClickSpark: React.FC = ({ children }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sparks = useRef<Spark[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let animationFrame = 0;
        const resize = () => {
            const ratio = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * ratio;
            canvas.height = window.innerHeight * ratio;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
        };
        const draw = (now: number) => {
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            sparks.current = sparks.current.filter((spark) => {
                const progress = (now - spark.started) / 440;
                if (progress >= 1) return false;
                const eased = progress * (2 - progress);
                const distance = eased * 24;
                const length = 8 * (1 - eased);
                const x = spark.x + distance * Math.cos(spark.angle);
                const y = spark.y + distance * Math.sin(spark.angle);
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x + length * Math.cos(spark.angle), y + length * Math.sin(spark.angle));
                context.strokeStyle = `rgba(240, 138, 144, ${1 - progress})`;
                context.lineWidth = 1.5;
                context.stroke();
                return true;
            });
            animationFrame = requestAnimationFrame(draw);
        };
        resize();
        window.addEventListener('resize', resize);
        animationFrame = requestAnimationFrame(draw);
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    const onClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
        if (!(event.target as HTMLElement).closest('a, button, [role="button"]')) return;
        for (let index = 0; index < 8; index++) {
            sparks.current.push({
                x: event.clientX,
                y: event.clientY,
                angle: (Math.PI * 2 * index) / 8,
                started: performance.now(),
            });
        }
    };

    return (
        <div className={'rb-click-spark-root'} onClick={onClick}>
            <canvas ref={canvasRef} className={'rb-click-spark-canvas'} aria-hidden={'true'} />
            {children}
        </div>
    );
};
