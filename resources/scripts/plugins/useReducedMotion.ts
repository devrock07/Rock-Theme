import { useEffect, useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export default (): boolean => {
    const motionEnabled = useStoreState(
        (state: ApplicationStore) => state.settings.data?.branding.motionEnabled ?? true
    );
    const [systemReduced, setSystemReduced] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(reducedMotionQuery).matches
    );

    useEffect(() => {
        const media = window.matchMedia(reducedMotionQuery);
        const update = () => setSystemReduced(media.matches);

        update();
        media.addEventListener?.('change', update);
        return () => media.removeEventListener?.('change', update);
    }, []);

    return !motionEnabled || systemReduced;
};
