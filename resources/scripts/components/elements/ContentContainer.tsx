import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import tw from 'twin.macro';

const ContentContainer = styled.div`
    ${tw`mt-4`}
    ${tw`mx-4`};

    ${breakpoint('xl')`
        margin-left: calc(var(--sidebar-size) + 2rem);
        margin-right: 2rem;
    `};
`;
ContentContainer.displayName = 'ContentContainer';
ContentContainer.defaultProps = {
    className: 'content-container',
};

export default ContentContainer;
