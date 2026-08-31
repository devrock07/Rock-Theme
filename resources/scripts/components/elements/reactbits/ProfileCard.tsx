import React, { useRef } from 'react';
import Avatar from '@/components/Avatar';
import FluidGlass from '@/components/elements/reactbits/FluidGlass';
import useReducedMotion from '@/plugins/useReducedMotion';
import './reactbits-suite.css';

type Props = {
    name: string;
    title: string;
    handle: string;
    status: string;
    detail?: string;
    actionText?: string;
    onActionClick?: () => void;
};

export default ({ name, title, handle, status, detail, actionText = 'API keys', onActionClick }: Props) => {
    const ref = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();

    const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
        if (reducedMotion || !ref.current || window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
        const bounds = ref.current.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        ref.current.style.setProperty('--profile-rx', `${y * -2.8}deg`);
        ref.current.style.setProperty('--profile-ry', `${x * 2.8}deg`);
        ref.current.style.setProperty('--profile-x', `${(x + 0.5) * 100}%`);
        ref.current.style.setProperty('--profile-y', `${(y + 0.5) * 100}%`);
    };

    const resetTilt = () => {
        ref.current?.style.setProperty('--profile-rx', '0deg');
        ref.current?.style.setProperty('--profile-ry', '0deg');
    };

    return (
        <div ref={ref} className={'rb-profile-shell'} onPointerMove={onPointerMove} onPointerLeave={resetTilt}>
            <FluidGlass className={'rb-profile-card'} intensity={'strong'}>
                <div className={'rb-profile-grid'} aria-hidden={'true'} />
                <div className={'rb-profile-avatar'}>
                    <Avatar.User size={94} />
                </div>
                <div className={'rb-profile-copy'}>
                    <span className={'rb-profile-kicker'}>{title}</span>
                    <h1>{name}</h1>
                    <p>@{handle}</p>
                    {!!detail && <span className={'rb-profile-detail'}>{detail}</span>}
                </div>
                <div className={'rb-profile-actions'}>
                    <span className={'rb-profile-status'}>
                        <i /> {status}
                    </span>
                    {!!onActionClick && (
                        <button type={'button'} onClick={onActionClick}>
                            {actionText}
                        </button>
                    )}
                </div>
            </FluidGlass>
        </div>
    );
};
