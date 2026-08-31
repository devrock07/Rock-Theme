import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { randomInt } from '@/helpers';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';

const Track = styled.div`
    ${tw`fixed top-0 left-0 w-full pointer-events-none`};
    z-index: 20000;
    height: 2px;
`;

const BarFill = styled.div`
    ${tw`h-full`};
    position: absolute;
    top: 0;
    left: 0;
    transition: width 250ms ease-in-out;
    margin-top: 0 !important;
    background: var(--shell-accent);
    box-shadow: 0 -2px 10px 2px rgba(var(--shell-accent-rgb), 0.72);
`;

type Timer = ReturnType<typeof setTimeout>;

export default () => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const timeout = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [visible, setVisible] = useState(false);
    const progress = useStoreState((state) => state.progress.progress);
    const continuous = useStoreState((state) => state.progress.continuous);
    const setProgress = useStoreActions((actions) => actions.progress.setProgress);

    useEffect(() => {
        return () => {
            timeout.current && clearTimeout(timeout.current);
            interval.current && clearInterval(interval.current);
        };
    }, []);

    useEffect(() => {
        setVisible(progress !== undefined && progress > 0);

        if (progress === 100) {
            timeout.current && clearTimeout(timeout.current);
            timeout.current = setTimeout(() => setProgress(undefined), 500);
        } else if (timeout.current) {
            clearTimeout(timeout.current);
        }

        return () => timeout.current && clearTimeout(timeout.current);
    }, [progress]);

    useEffect(() => {
        if (continuous && (!progress || progress === 0)) {
            setProgress(randomInt(20, 30));
        }
    }, [continuous]);

    useEffect(() => {
        interval.current && clearTimeout(interval.current);
        if (!continuous || !progress || progress >= 90) return;

        interval.current = setTimeout(() => setProgress(Math.min(90, progress + randomInt(1, 5))), 500);

        return () => interval.current && clearTimeout(interval.current);
    }, [progress, continuous]);

    return (
        <Track aria-hidden={'true'}>
            <CSSTransition timeout={150} appear in={visible} unmountOnExit classNames={'fade'}>
                <BarFill style={{ width: progress === undefined ? '100%' : `${progress}%` }} />
            </CSSTransition>
        </Track>
    );
};
