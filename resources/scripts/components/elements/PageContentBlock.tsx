import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    const branding = useStoreState((state: ApplicationStore) => state.settings.data!.branding);

    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return (
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <>
                <ContentContainer
                    css={tw`my-4 sm:my-10`}
                    className={['content-container', 'rock-page', className].filter(Boolean).join(' ')}
                >
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                    {children}
                </ContentContainer>
                <ContentContainer css={tw`mb-4`} className={'content-container rock-footer'}>
                    <p css={tw`text-center text-neutral-500 text-xs`}>
                        {branding.url ? (
                            <a
                                rel={'noopener noreferrer'}
                                href={branding.url}
                                target={'_blank'}
                                css={tw`no-underline text-neutral-500 hover:text-neutral-300`}
                            >
                                {branding.owner}
                            </a>
                        ) : (
                            branding.owner
                        )}
                        &nbsp;&copy; {branding.startYear} - {new Date().getFullYear()}
                    </p>
                </ContentContainer>
            </>
        </CSSTransition>
    );
};

export default PageContentBlock;
