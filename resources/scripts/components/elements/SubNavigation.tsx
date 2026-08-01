import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full shadow overflow-x-auto`};
    border-bottom: 1px solid rgba(255, 255, 255, 0.075);
    background: linear-gradient(90deg, rgba(13, 11, 14, 0.94), rgba(34, 13, 18, 0.88), rgba(13, 11, 14, 0.94));
    backdrop-filter: blur(18px) saturate(1.25);

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 text-neutral-300 no-underline whitespace-nowrap transition-all duration-150`};

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                ${tw`text-neutral-100`};
                background: rgba(201, 79, 89, 0.07);
            }

            &:active,
            &.active {
                ${tw`text-neutral-100`};
                box-shadow: inset 0 -2px ${theme`colors.primary.600`.toString()};
                background: linear-gradient(180deg, rgba(201, 79, 89, 0.1), transparent);
            }
        }
    }
`;

export default SubNavigation;
