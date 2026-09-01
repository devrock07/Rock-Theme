'use client';

import Image from 'next/image';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withBasePath } from '@/lib/site';

export function ThemePreview() {
    return (
        <Tabs defaultValue="crimson" className="w-full">
            <TabsList className="mb-5 h-10 rounded-xl border border-white/8 bg-black/20 p-1">
                <TabsTrigger
                    value="crimson"
                    className="h-8 rounded-lg px-4 text-xs data-active:bg-[#45131c] data-active:text-[#ffacb8]"
                >
                    Crimson Red
                </TabsTrigger>
                <TabsTrigger
                    value="blue"
                    className="h-8 rounded-lg px-4 text-xs data-active:bg-[#112a45] data-active:text-[#9ed0ff]"
                >
                    Midnight Blue
                </TabsTrigger>
            </TabsList>
            <TabsContent value="crimson">
                <PanelScreenshot
                    src="/screenshots/dashboard-crimson.webp"
                    alt="Rock Theme dashboard using the Crimson Red preset"
                    label="Crimson Red"
                />
            </TabsContent>
            <TabsContent value="blue">
                <PanelScreenshot
                    src="/screenshots/dashboard-blue.webp"
                    alt="Rock Theme dashboard using the Midnight Blue preset"
                    label="Midnight Blue"
                />
            </TabsContent>
        </Tabs>
    );
}

export function PanelScreenshot({
    src,
    alt,
    label,
    className = '',
}: {
    src: string;
    alt: string;
    label: string;
    className?: string;
}) {
    return (
        <figure
            className={`screen-shell overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#080607] p-1.5 shadow-[0_30px_90px_rgba(0,0,0,.45)] ${className}`}
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
                className="aspect-[16/9] w-full rounded-[16px] border border-white/[0.06] object-cover object-top"
            />
        </figure>
    );
}
