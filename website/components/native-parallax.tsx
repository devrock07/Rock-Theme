'use client';

import { useEffect } from 'react';

type MotionLayer = {
    element: HTMLElement;
    depthY: number;
    depthX: number;
    depthScale: number;
    top: number;
    height: number;
    currentY: number;
    targetY: number;
    currentX: number;
    targetX: number;
    currentScale: number;
    targetScale: number;
    active: boolean;
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export function NativeParallax() {
    useEffect(() => {
        const root = document.documentElement;
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        const desktopMotion = window.matchMedia(
            '(min-width: 1024px) and (pointer: fine)',
        );
        const layers: MotionLayer[] = Array.from(
            document.querySelectorAll<HTMLElement>('[data-parallax]'),
        ).map((element) => ({
            element,
            depthY: Number(element.dataset.parallax ?? 0),
            depthX: Number(element.dataset.parallaxX ?? 0),
            depthScale: Number(element.dataset.parallaxScale ?? 0),
            top: 0,
            height: 0,
            currentY: 0,
            targetY: 0,
            currentX: 0,
            targetX: 0,
            currentScale: 1,
            targetScale: 1,
            active: false,
        }));
        const reveals = Array.from(
            document.querySelectorAll<HTMLElement>('[data-reveal]'),
        );

        let frame = 0;
        let measureFrame = 0;
        let progressCurrent = 0;
        let progressTarget = 0;

        const parallaxEnabled = () =>
            !reducedMotion.matches && desktopMotion.matches;

        const updateTargets = () => {
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const maxScroll = Math.max(
                document.documentElement.scrollHeight - viewportHeight,
                1,
            );

            progressTarget = clamp(scrollY / maxScroll, 0, 1);
            root.toggleAttribute('data-scrolled', scrollY > 24);

            if (!parallaxEnabled()) return;

            const viewportCenter = scrollY + viewportHeight / 2;
            for (const layer of layers) {
                if (!layer.active) continue;
                const layerCenter = layer.top + layer.height / 2;
                const travel = Math.max((viewportHeight + layer.height) / 2, 1);
                const position = clamp(
                    (viewportCenter - layerCenter) / travel,
                    -1,
                    1,
                );
                layer.targetY = position * layer.depthY;
                layer.targetX = position * layer.depthX;
                layer.targetScale = 1 + position * layer.depthScale;
            }
        };

        const tick = () => {
            frame = 0;
            if (document.hidden || reducedMotion.matches) return;

            let unsettled = false;
            const progressDelta = progressTarget - progressCurrent;
            if (Math.abs(progressDelta) > 0.0001) {
                progressCurrent += progressDelta * 0.16;
                unsettled = true;
            } else {
                progressCurrent = progressTarget;
            }
            root.style.setProperty(
                '--scroll-progress',
                progressCurrent.toFixed(5),
            );

            if (parallaxEnabled()) {
                for (const layer of layers) {
                    if (!layer.active) continue;
                    const deltaY = layer.targetY - layer.currentY;
                    const deltaX = layer.targetX - layer.currentX;
                    const deltaScale = layer.targetScale - layer.currentScale;
                    if (
                        Math.abs(deltaY) > 0.05 ||
                        Math.abs(deltaX) > 0.05 ||
                        Math.abs(deltaScale) > 0.0002
                    ) {
                        layer.currentY += deltaY * 0.14;
                        layer.currentX += deltaX * 0.14;
                        layer.currentScale += deltaScale * 0.14;
                        unsettled = true;
                    } else {
                        layer.currentY = layer.targetY;
                        layer.currentX = layer.targetX;
                        layer.currentScale = layer.targetScale;
                    }
                    layer.element.style.setProperty(
                        '--parallax-y',
                        `${layer.currentY.toFixed(2)}px`,
                    );
                    layer.element.style.setProperty(
                        '--parallax-x',
                        `${layer.currentX.toFixed(2)}px`,
                    );
                    layer.element.style.setProperty(
                        '--parallax-scale',
                        layer.currentScale.toFixed(5),
                    );
                }
            }

            if (unsettled) frame = window.requestAnimationFrame(tick);
        };

        const schedule = () => {
            if (!frame && !document.hidden) {
                frame = window.requestAnimationFrame(tick);
            }
        };

        const measure = () => {
            measureFrame = 0;
            for (const layer of layers) {
                const rect = layer.element.getBoundingClientRect();
                layer.top = rect.top + window.scrollY - layer.currentY;
                layer.height = rect.height;
            }
            updateTargets();
            schedule();
        };

        const scheduleMeasure = () => {
            if (!measureFrame) {
                measureFrame = window.requestAnimationFrame(measure);
            }
        };

        const onScroll = () => {
            updateTargets();
            schedule();
        };

        const resetParallax = () => {
            for (const layer of layers) {
                layer.currentY = 0;
                layer.targetY = 0;
                layer.currentX = 0;
                layer.targetX = 0;
                layer.currentScale = 1;
                layer.targetScale = 1;
                layer.element.style.removeProperty('--parallax-y');
                layer.element.style.removeProperty('--parallax-x');
                layer.element.style.removeProperty('--parallax-scale');
                layer.element.removeAttribute('data-parallax-active');
            }
            scheduleMeasure();
        };

        const onMotionPreferenceChange = () => {
            if (reducedMotion.matches) {
                root.removeAttribute('data-motion-ready');
                root.style.removeProperty('--scroll-progress');
                for (const reveal of reveals) {
                    reveal.dataset.revealState = 'visible';
                }
            } else {
                root.setAttribute('data-motion-ready', 'true');
            }
            resetParallax();
            for (const layer of layers) {
                layer.element.toggleAttribute(
                    'data-parallax-active',
                    layer.active && parallaxEnabled(),
                );
            }
            updateTargets();
            schedule();
        };

        const layerObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const layer = layers.find(
                        ({ element }) => element === entry.target,
                    );
                    if (!layer) continue;
                    layer.active = entry.isIntersecting;
                    layer.element.toggleAttribute(
                        'data-parallax-active',
                        entry.isIntersecting && parallaxEnabled(),
                    );
                }
                updateTargets();
                schedule();
            },
            { rootMargin: '20% 0px' },
        );

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    (entry.target as HTMLElement).dataset.revealState =
                        'visible';
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
        );

        const resizeObserver = new ResizeObserver(scheduleMeasure);

        if (!reducedMotion.matches) {
            root.setAttribute('data-motion-ready', 'true');
            for (const reveal of reveals) {
                reveal.dataset.revealState = 'pending';
                revealObserver.observe(reveal);
            }
        } else {
            for (const reveal of reveals) {
                reveal.dataset.revealState = 'visible';
            }
        }

        for (const layer of layers) {
            layerObserver.observe(layer.element);
            resizeObserver.observe(layer.element);
        }
        resizeObserver.observe(document.body);

        progressCurrent = clamp(
            window.scrollY /
                Math.max(
                    document.documentElement.scrollHeight - window.innerHeight,
                    1,
                ),
            0,
            1,
        );
        progressTarget = progressCurrent;
        root.style.setProperty('--scroll-progress', progressCurrent.toFixed(5));
        measure();

        const onVisibilityChange = () => {
            if (!document.hidden) {
                scheduleMeasure();
                schedule();
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', scheduleMeasure, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);
        reducedMotion.addEventListener('change', onMotionPreferenceChange);
        desktopMotion.addEventListener('change', onMotionPreferenceChange);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', scheduleMeasure);
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
            reducedMotion.removeEventListener(
                'change',
                onMotionPreferenceChange,
            );
            desktopMotion.removeEventListener(
                'change',
                onMotionPreferenceChange,
            );
            layerObserver.disconnect();
            revealObserver.disconnect();
            resizeObserver.disconnect();
            if (frame) window.cancelAnimationFrame(frame);
            if (measureFrame) window.cancelAnimationFrame(measureFrame);
            root.removeAttribute('data-motion-ready');
            root.removeAttribute('data-scrolled');
            root.style.removeProperty('--scroll-progress');
            for (const layer of layers) {
                layer.element.style.removeProperty('--parallax-y');
                layer.element.style.removeProperty('--parallax-x');
                layer.element.style.removeProperty('--parallax-scale');
                layer.element.removeAttribute('data-parallax-active');
            }
        };
    }, []);

    return <div className="scroll-progress" aria-hidden="true" />;
}
