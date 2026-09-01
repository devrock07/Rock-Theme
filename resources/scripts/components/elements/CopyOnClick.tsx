import React, { useEffect, useState } from 'react';
import Fade from '@/components/elements/Fade';
import Portal from '@/components/elements/Portal';
import copy from 'copy-to-clipboard';
import classNames from 'classnames';

interface CopyOnClickProps {
    text: string | number | null | undefined;
    showInNotification?: boolean;
    children: React.ReactNode;
}

interface ClickableChildProps {
    className?: string;
    onClick?: React.MouseEventHandler<HTMLElement>;
}

const CopyOnClick = ({ text, showInNotification = true, children }: CopyOnClickProps) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;

        const timeout = setTimeout(() => {
            setCopied(false);
        }, 2500);

        return () => {
            clearTimeout(timeout);
        };
    }, [copied]);

    if (!React.isValidElement(children)) {
        throw new Error('Component passed to <CopyOnClick/> must be a valid React element.');
    }

    const onlyChild = React.Children.only(children) as React.ReactElement<ClickableChildProps>;
    const child = !text
        ? onlyChild
        : React.cloneElement(onlyChild, {
              className: classNames(onlyChild.props.className || '', 'cursor-pointer'),
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                  copy(String(text));
                  setCopied(true);
                  if (typeof onlyChild.props.onClick === 'function') {
                      onlyChild.props.onClick(e);
                  }
              },
          });

    return (
        <>
            {copied && (
                <Portal>
                    <Fade in appear timeout={250} key={copied ? 'visible' : 'invisible'}>
                        <div
                            className={'fixed bottom-0 right-0 m-4'}
                            style={{ zIndex: 950, bottom: 'var(--rock-mobile-nav-clearance, 0px)' }}
                        >
                            <div className={'rounded-md py-3 px-4 text-gray-200 bg-neutral-600/95 shadow'}>
                                <p>
                                    {showInNotification
                                        ? `Copied "${String(text)}" to clipboard.`
                                        : 'Copied text to clipboard.'}
                                </p>
                            </div>
                        </div>
                    </Fade>
                </Portal>
            )}
            {child}
        </>
    );
};

export default CopyOnClick;
