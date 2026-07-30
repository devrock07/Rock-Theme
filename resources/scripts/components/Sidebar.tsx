import React, { ReactNode } from 'react';
import '@/assets/css/sidebar.css';

type ParentProps = {
    children: ReactNode;
};

export default ({ children }: Omit<ParentProps, 'render'>) => {
    const close = () => document.getElementById('sidebar')?.classList.remove('active-nav');

    return (
        <>
            <div className='sidebar' id='sidebar'>
                {children}
            </div>
            <button
                type={'button'}
                className={'sidebar-scrim'}
                aria-label={'Close navigation'}
                tabIndex={-1}
                onClick={close}
            />
        </>
    );
};
