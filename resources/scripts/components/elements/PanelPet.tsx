import React, { useEffect, useRef } from 'react';
import styled from 'styled-components/macro';

const Pet = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 85;
    width: 68px;
    height: 82px;
    pointer-events: none;
    transform: translate3d(var(--pet-x, calc(100vw - 96px)), var(--pet-y, calc(100vh - 112px)), 0);
    transition: transform var(--pet-duration, 6s) cubic-bezier(0.42, 0, 0.35, 1);
    filter: drop-shadow(0 12px 16px rgba(0, 0, 0, 0.34));
    contain: layout style;

    .pet-shadow {
        position: absolute;
        bottom: 0;
        left: 13px;
        width: 42px;
        height: 8px;
        border-radius: 50%;
        background: rgba(201, 79, 89, 0.24);
        filter: blur(5px);
        animation: pet-shadow 1.05s ease-in-out infinite alternate;
    }

    .pet-shell {
        position: absolute;
        inset: 0;
        transform-origin: center;
        transition: transform 180ms ease;
    }

    &[data-facing='left'] .pet-shell {
        transform: scaleX(-1);
    }

    .pet-antenna {
        position: absolute;
        top: 1px;
        left: 32px;
        width: 2px;
        height: 11px;
        border-radius: 2px;
        background: linear-gradient(#f6a1a7, #8f2631);
    }

    .pet-antenna::before {
        position: absolute;
        top: -3px;
        left: -3px;
        width: 8px;
        height: 8px;
        content: '';
        border-radius: 50%;
        background: #f08a90;
        box-shadow: 0 0 13px rgba(240, 138, 144, 0.78);
        animation: pet-signal 1.8s ease-in-out infinite;
    }

    .pet-ear {
        position: absolute;
        top: 24px;
        width: 8px;
        height: 19px;
        border: 1px solid rgba(240, 138, 144, 0.5);
        background: #551923;
    }

    .pet-ear.left {
        left: 3px;
        border-radius: 7px 2px 2px 7px;
    }

    .pet-ear.right {
        right: 3px;
        border-radius: 2px 7px 7px 2px;
    }

    .pet-head {
        position: absolute;
        top: 12px;
        left: 8px;
        width: 52px;
        height: 42px;
        overflow: hidden;
        border: 1px solid rgba(255, 175, 182, 0.72);
        border-radius: 16px 16px 13px 13px;
        background: linear-gradient(145deg, #d95c66, #7c202c 55%, #3b1118);
        box-shadow: inset 0 1px 0 rgba(255, 224, 226, 0.32), 0 0 24px rgba(201, 79, 89, 0.22);
    }

    .pet-head::after {
        position: absolute;
        top: -15px;
        left: 4px;
        width: 22px;
        height: 64px;
        content: '';
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.13), transparent);
        transform: rotate(24deg);
    }

    .pet-screen {
        position: absolute;
        inset: 7px 6px 8px;
        overflow: hidden;
        border: 1px solid rgba(255, 173, 180, 0.28);
        border-radius: 10px;
        background: radial-gradient(circle at 50% 24%, #32131a, #09090b 72%);
        box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.72);
    }

    .pet-eye {
        position: absolute;
        top: 11px;
        width: 8px;
        height: 5px;
        border-radius: 4px;
        background: #ff9ba3;
        box-shadow: 0 0 9px rgba(255, 122, 135, 0.9);
        animation: pet-blink 4.8s infinite;
    }

    .pet-eye.left {
        left: 9px;
    }

    .pet-eye.right {
        right: 9px;
    }

    .pet-mouth {
        position: absolute;
        bottom: 7px;
        left: 50%;
        width: 13px;
        height: 5px;
        border-right: 2px solid #f08a90;
        border-bottom: 2px solid #f08a90;
        border-left: 2px solid #f08a90;
        border-radius: 0 0 7px 7px;
        transform: translateX(-50%);
        opacity: 0.82;
    }

    .pet-body {
        position: absolute;
        top: 52px;
        left: 18px;
        width: 32px;
        height: 21px;
        border: 1px solid rgba(240, 138, 144, 0.52);
        border-radius: 8px 8px 12px 12px;
        background: linear-gradient(145deg, #8f2631, #3a1118);
        box-shadow: inset 0 1px 0 rgba(255, 218, 221, 0.18);
    }

    .pet-body::before {
        position: absolute;
        top: 6px;
        left: 12px;
        width: 6px;
        height: 6px;
        content: '';
        border-radius: 50%;
        background: #f08a90;
        box-shadow: 0 0 10px rgba(240, 138, 144, 0.66);
    }

    .pet-foot {
        position: absolute;
        top: 70px;
        width: 18px;
        height: 7px;
        border: 1px solid rgba(240, 138, 144, 0.42);
        border-radius: 6px 6px 9px 9px;
        background: #3b1118;
    }

    .pet-foot.left {
        left: 12px;
    }

    .pet-foot.right {
        right: 12px;
    }

    &.is-moving .pet-shell {
        animation: pet-walk 0.58s ease-in-out infinite alternate;
    }

    &.is-moving .pet-foot.left {
        animation: pet-step 0.58s ease-in-out infinite alternate;
    }

    &.is-moving .pet-foot.right {
        animation: pet-step 0.58s ease-in-out infinite alternate-reverse;
    }

    @keyframes pet-walk {
        from {
            margin-top: 0;
        }
        to {
            margin-top: -3px;
        }
    }

    @keyframes pet-step {
        from {
            transform: translateY(0);
        }
        to {
            transform: translateY(-3px);
        }
    }

    @keyframes pet-blink {
        0%,
        45%,
        49%,
        100% {
            transform: scaleY(1);
        }
        47% {
            transform: scaleY(0.12);
        }
    }

    @keyframes pet-signal {
        0%,
        100% {
            opacity: 0.65;
            transform: scale(0.85);
        }
        50% {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes pet-shadow {
        from {
            opacity: 0.48;
            transform: scaleX(0.86);
        }
        to {
            opacity: 0.8;
            transform: scaleX(1);
        }
    }

    @media (max-width: 640px) {
        width: 58px;
        height: 70px;
        transform: translate3d(var(--pet-x, calc(100vw - 74px)), var(--pet-y, calc(100vh - 92px)), 0) scale(0.84);
        transform-origin: top left;
    }

    @media (prefers-reduced-motion: reduce) {
        right: 18px;
        bottom: 18px;
        top: auto;
        left: auto;
        transform: none;
        transition: none;

        .pet-shell,
        .pet-foot,
        .pet-eye,
        .pet-antenna::before,
        .pet-shadow {
            animation: none !important;
        }
    }
`;

export default () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotion.matches) return;

        let timer = 0;
        let movementTimer = 0;
        let lastX = Math.max(16, window.innerWidth - 100);

        const move = (immediate = false) => {
            const maxX = Math.max(18, window.innerWidth - 88);
            const minY = Math.max(82, window.innerHeight * 0.58);
            const maxY = Math.max(minY, window.innerHeight - 108);
            const nextX = 18 + Math.random() * Math.max(0, maxX - 18);
            const nextY = minY + Math.random() * Math.max(0, maxY - minY);
            const duration = immediate ? 0 : 4800 + Math.random() * 3600;

            element.dataset.facing = nextX < lastX ? 'left' : 'right';
            element.style.setProperty('--pet-duration', `${duration}ms`);
            element.style.setProperty('--pet-x', `${Math.round(nextX)}px`);
            element.style.setProperty('--pet-y', `${Math.round(nextY)}px`);
            element.classList.toggle('is-moving', !immediate);
            lastX = nextX;

            window.clearTimeout(movementTimer);
            movementTimer = window.setTimeout(() => element.classList.remove('is-moving'), duration);
            window.clearTimeout(timer);
            timer = window.setTimeout(() => move(), duration + 1200 + Math.random() * 2200);
        };

        move(true);
        timer = window.setTimeout(() => move(), 900);
        const handleResize = () => move(true);
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(movementTimer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Pet ref={ref} aria-hidden={'true'} data-facing={'left'}>
            <span className={'pet-shadow'} />
            <span className={'pet-shell'}>
                <span className={'pet-antenna'} />
                <span className={'pet-ear left'} />
                <span className={'pet-ear right'} />
                <span className={'pet-head'}>
                    <span className={'pet-screen'}>
                        <span className={'pet-eye left'} />
                        <span className={'pet-eye right'} />
                        <span className={'pet-mouth'} />
                    </span>
                </span>
                <span className={'pet-body'} />
                <span className={'pet-foot left'} />
                <span className={'pet-foot right'} />
            </span>
        </Pet>
    );
};
