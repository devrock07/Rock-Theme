import Image from 'next/image';

import { withBasePath } from '@/lib/site';

export function PanelScreenshot({
    src,
    alt,
    label,
    className = '',
    priority = false,
}: {
    src: string;
    alt: string;
    label: string;
    className?: string;
    priority?: boolean;
}) {
    return (
        <figure
            className={`screen-shell relative overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#080607] p-1.5 ${className}`}
        >
            <div
                className="flex h-8 items-center gap-1.5 px-2"
                aria-hidden="true"
            >
                <span className="size-2 rounded-full bg-primary/80" />
                <span className="size-2 rounded-full bg-white/16" />
                <span className="size-2 rounded-full bg-white/10" />
                <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                    {label}
                </span>
            </div>
            <Image
                src={withBasePath(src)}
                alt={alt}
                width={1440}
                height={900}
                sizes="(max-width: 1024px) 100vw, 760px"
                priority={priority}
                loading={priority ? undefined : 'lazy'}
                decoding="async"
                className="aspect-[16/9] w-full rounded-[16px] border border-white/[0.06] object-cover object-top"
            />
        </figure>
    );
}
