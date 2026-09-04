import Image from 'next/image';

import { withBasePath } from '@/lib/site';

const DEFAULT_SCREENSHOT_DIMENSIONS = { width: 1280, height: 720 };

const SCREENSHOT_DIMENSIONS: Readonly<
    Record<string, { width: number; height: number }>
> = {
    '/screenshots/console.webp': { width: 1268, height: 713 },
    '/screenshots/dashboard-crimson.webp': { width: 1268, height: 713 },
    '/screenshots/status.webp': { width: 1280, height: 720 },
};

export function PanelScreenshot({
    src,
    alt,
    label,
    className = '',
    priority = false,
}: {
    src: string;
    alt: string;
    label?: string;
    className?: string;
    priority?: boolean;
}) {
    const { width, height } =
        SCREENSHOT_DIMENSIONS[src] ?? DEFAULT_SCREENSHOT_DIMENSIONS;

    return (
        <figure
            className={`screen-shell relative overflow-hidden border bg-[#080607] ${className}`}
        >
            <Image
                src={withBasePath(src)}
                alt={alt}
                width={width}
                height={height}
                sizes="(max-width: 1024px) 100vw, 760px"
                priority={priority}
                loading={priority ? undefined : 'eager'}
                decoding="async"
                className="block h-auto w-full bg-[#080607]"
            />
            {label ? (
                <figcaption className="sr-only">{label}</figcaption>
            ) : null}
        </figure>
    );
}
