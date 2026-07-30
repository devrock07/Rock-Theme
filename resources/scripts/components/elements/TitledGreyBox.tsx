import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';
import styled from 'styled-components/macro';
import FluidGlass from '@/components/elements/reactbits/FluidGlass';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const Shell = styled(FluidGlass)`
    overflow: hidden;
    border-color: rgba(255, 255, 255, 0.085);
    border-radius: 11px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(13, 12, 14, 0.93) 46%, rgba(70, 14, 22, 0.1));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 18px 48px rgba(0, 0, 0, 0.14);

    .box-heading {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.065);
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.022), rgba(201, 79, 89, 0.04));
    }

    .box-heading p {
        color: #aaa6af;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.64rem;
        font-weight: 650;
        letter-spacing: 0.11em;
    }

    .box-heading svg {
        color: var(--shell-accent-bright);
    }

    .box-body {
        padding: 1rem;
    }
`;

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <Shell className={className}>
        <div className={'box-heading'}>
            {typeof title === 'string' ? (
                <p css={tw`text-sm uppercase`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-neutral-300`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div className={'box-body'}>{children}</div>
    </Shell>
);

export default memo(TitledGreyBox, isEqual);
