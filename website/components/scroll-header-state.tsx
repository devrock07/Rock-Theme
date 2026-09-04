'use client';

import { useEffect } from 'react';

export function ScrollHeaderState() {
    useEffect(() => {
        const root = document.documentElement;
        let frame = 0;

        const update = () => {
            frame = 0;
            root.toggleAttribute('data-scrolled', window.scrollY > 24);
        };

        const schedule = () => {
            if (!frame && !document.hidden) {
                frame = window.requestAnimationFrame(update);
            }
        };

        const onVisibilityChange = () => {
            if (!document.hidden) schedule();
        };

        update();
        window.addEventListener('scroll', schedule, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.removeEventListener('scroll', schedule);
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
            if (frame) window.cancelAnimationFrame(frame);
            root.removeAttribute('data-scrolled');
        };
    }, []);

    return null;
}
