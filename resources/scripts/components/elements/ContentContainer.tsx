import styled from 'styled-components/macro';
import tw from 'twin.macro';

const ContentContainer = styled.div`
    ${tw`mt-4 mx-4`};

    @media (min-width: 641px) and (max-width: 1150px) {
        margin-left: 1.25rem;
        margin-right: 1.25rem;
    }

    @media (min-width: 1151px) {
        margin-left: calc(var(--sidebar-size) + 2rem);
        margin-right: 2rem;
    }
`;
ContentContainer.displayName = 'ContentContainer';
ContentContainer.defaultProps = {
    className: 'content-container',
};

export default ContentContainer;
