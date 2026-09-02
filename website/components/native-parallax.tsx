'use client';

import { useEffect } from 'react';

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export function NativeParallax() {
    useEffect(() => {
        const root = document.documentElement;
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        const reveals = Array.from(
            document.querySelectorAll<HTMLElement>('[data-reveal]'),
        );

        let frame = 0;

        const updatePageState = () => {
            frame = 0;
            const viewportHeight = window.innerHeight;
            const maxScroll = Math.max(
                document.documentElement.scrollHeight - viewportHeight,
                1,
            );
            const progress = clamp(window.scrollY / maxScroll, 0, 1);

            root.toggleAttribute('data-scrolled', window.scrollY > 24);
            root.style.setProperty('--scroll-progress', progress.toFixed(5));
        };

        const schedulePageState = () => {
            if (!frame && !document.hidden) {
                frame = window.requestAnimationFrame(updatePageState);
            }
        };

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    (entry.target as HTMLElement).dataset.revealState =
                        'visible';
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -7% 0px', threshold: 0.08 },
        );

        const configureMotion = () => {
            revealObserver.disconnect();

            if (reducedMotion.matches) {
                root.removeAttribute('data-motion-ready');
                for (const reveal of reveals) {
                    reveal.dataset.revealState = 'visible';
                }
                return;
            }

            root.setAttribute('data-motion-ready', 'true');
            for (const reveal of reveals) {
                if (reveal.dataset.revealState === 'visible') continue;
                reveal.dataset.revealState = 'pending';
                revealObserver.observe(reveal);
            }
        };

        const onVisibilityChange = () => {
            if (!document.hidden) schedulePageState();
        };

        configureMotion();
        updatePageState();

        window.addEventListener('scroll', schedulePageState, {
            passive: true,
        });
        window.addEventListener('resize', schedulePageState, {
            passive: true,
        });
        document.addEventListener('visibilitychange', onVisibilityChange);
        reducedMotion.addEventListener('change', configureMotion);

        return () => {
            window.removeEventListener('scroll', schedulePageState);
            window.removeEventListener('resize', schedulePageState);
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
            reducedMotion.removeEventListener('change', configureMotion);
            revealObserver.disconnect();
            if (frame) window.cancelAnimationFrame(frame);
            root.removeAttribute('data-motion-ready');
            root.removeAttribute('data-scrolled');
            root.style.removeProperty('--scroll-progress');
        };
    }, []);

    return <div className="scroll-progress" aria-hidden="true" />;
}
