import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex no-underline text-neutral-200 items-center p-4 border transition-all duration-150 overflow-hidden`};
    position: relative;
    border-color: rgba(255, 255, 255, 0.075);
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.035), rgba(13, 12, 14, 0.91));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

    ${(props) =>
        props.$hoverable !== false &&
        `
            &:hover {
                border-color: rgba(var(--shell-accent-rgb), 0.25);
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.045), rgba(45, 11, 16, 0.5));
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 14px 38px rgba(0, 0, 0, 0.14);
                transform: translateY(-1px);
            }
        `};

    & .icon {
        ${tw`w-16 flex items-center justify-center p-3`};
        color: var(--shell-accent-bright);
        border: 1px solid rgba(var(--shell-accent-rgb), 0.13);
        border-radius: 14px;
        background: rgba(var(--shell-accent-rgb), 0.07);
    }
`;
