import React, { useContext } from 'react';
import { DialogContext } from './';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';

export default ({ children }: { children: React.ReactNode }) => {
    const { setFooter } = useContext(DialogContext);

    useDeepCompareEffect(() => {
        setFooter(
            <div
                className={
                    'flex flex-none flex-col-reverse gap-2 rounded-b bg-gray-700 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 [&>*]:w-full sm:[&>*]:w-auto'
                }
            >
                {children}
            </div>
        );
    }, [children]);

    return null;
};
