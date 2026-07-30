import React from 'react';
import classNames from 'classnames';
import styles from '@/components/server/console/style.module.css';
import { MagicBentoCard } from '@/components/elements/reactbits/MagicBento';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
    tone?: 'rose' | 'crimson' | 'ember';
}

export default ({ title, legend, children, tone = 'rose' }: ChartBlockProps) => (
    <MagicBentoCard
        className={classNames(styles.chart_container, styles[`chart_tone_${tone}`], 'group')}
        glowColor={tone === 'rose' ? '240, 138, 144' : tone === 'crimson' ? '201, 79, 89' : '217, 96, 105'}
        particleCount={4}
        enableMagnetism={false}
        clickEffect={false}
    >
        <div className={styles.chart_surface}>
            <span className={styles.chart_grid_plane} aria-hidden={'true'} />
            <div className={styles.chart_header}>
                <div className={'flex min-w-0 items-center'}>
                    <span className={styles.chart_live_dot} aria-hidden={'true'} />
                    <h3
                        className={
                            'truncate font-header font-medium text-gray-100 transition-colors duration-100 group-hover:text-gray-50'
                        }
                    >
                        {title}
                    </h3>
                </div>
                {legend && <div className={'flex flex-shrink-0 items-center text-sm'}>{legend}</div>}
            </div>
            <div className={styles.chart_canvas}>{children}</div>
            <span className={styles.chart_base} aria-hidden={'true'} />
        </div>
    </MagicBentoCard>
);
