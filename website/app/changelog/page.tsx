import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRightIcon, CheckCircle2Icon } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Changelog — Rockdactyl',
    description: 'Release notes and compatibility information for Rockdactyl.',
};

const patchHighlights = [
    'Completed the Rockdactyl rebrand across the panel, installer, repository, documentation site, Wiki, roadmap, and release surfaces.',
    'Preserved legacy database, runtime, backup, and container identifiers so existing installations update without migration work.',
    'Added the documentation site and package manifests to automatic release-version synchronization.',
    'Updated signals and avatar dependencies after frontend, security, backend, and multi-architecture validation.',
] as const;

const v210Highlights = [
    'Persistent notification read and clear state, mobile positioning, modal focus, file and backup menus, uploads, and stale server navigation were corrected.',
    'Crimson Red and Midnight Blue now share complete parity across charts, dialogs, login, admin, and responsive layouts.',
    'Press and pop motion was removed while keyboard focus and desktop-only hover feedback remain clear.',
    'Deployment-driven responsive checks now cover phone, tablet, desktop, and ultrawide viewports.',
    'Installation now uses staged deployment, checksummed rollback snapshots, tag-bound provenance, archive traversal protection, and safe maintenance recovery.',
    'Production assets and release archives are reproducible, with expanded source, checksum, installer, container, and upstream regression coverage.',
] as const;

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            <div
                className="site-grid pointer-events-none fixed inset-0 -z-10"
                aria-hidden="true"
            />
            <main
                id="main-content"
                className="mx-auto max-w-[980px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
            >
                <header className="border-b border-white/[0.075] pb-12">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                        Project history
                    </p>
                    <h1 className="mt-4 text-[clamp(3rem,8vw,6.7rem)] font-semibold leading-[0.9] tracking-[-0.075em]">
                        Changelog.
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
                        Release notes are kept short here. GitHub remains the
                        source of truth for assets, checksums, commits, and
                        compare links.
                    </p>
                </header>

                <article className="py-12">
                    <div className="grid gap-8 md:grid-cols-[160px_1fr]">
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                01 Sep 2026
                            </p>
                            <span className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 font-mono text-[10px] font-semibold text-primary">
                                v2.1.1
                            </span>
                        </div>
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                                Rockdactyl identity and release consistency
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
                                One name across every release surface.
                            </h2>
                            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                                This compatibility-safe patch completes the
                                public Rockdactyl rename and closes the last
                                automated version-sync gap.
                            </p>
                            <ul className="mt-7 space-y-4">
                                {patchHighlights.map((item) => (
                                    <li
                                        key={item}
                                        className="flex gap-3 text-sm leading-6 text-muted-foreground"
                                    >
                                        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:grid-cols-4">
                                <ReleaseFact label="Panel" value="1.15.1" />
                                <ReleaseFact label="PHP" value="8.2 / 8.3" />
                                <ReleaseFact label="Node" value="22+" />
                                <ReleaseFact label="Upgrade" value="In place" />
                            </div>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href="https://github.com/devrock07/Rockdactyl/releases/tag/v2.1.1"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                        buttonVariants({ size: 'lg' }),
                                        'h-10 rounded-xl px-4',
                                    )}
                                >
                                    Release assets <ArrowUpRightIcon />
                                </a>
                                <a
                                    href="https://github.com/devrock07/Rockdactyl/compare/v2.1.0...v2.1.1"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                        buttonVariants({
                                            variant: 'outline',
                                            size: 'lg',
                                        }),
                                        'h-10 rounded-xl border-white/10 bg-white/[0.025] px-4',
                                    )}
                                >
                                    Full diff
                                </a>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="border-t border-white/[0.075] py-12">
                    <div className="grid gap-8 md:grid-cols-[160px_1fr]">
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                01 Sep 2026
                            </p>
                            <span className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 font-mono text-[10px] font-semibold text-primary">
                                v2.1.0
                            </span>
                        </div>
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                                Reliability and release engineering
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
                                A stable base for Pterodactyl 1.15.1.
                            </h2>
                            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                                This release closes the remaining interaction,
                                persistence, responsive, and delivery gaps
                                before the documentation launch.
                            </p>
                            <ul className="mt-7 space-y-4">
                                {v210Highlights.map((item) => (
                                    <li
                                        key={item}
                                        className="flex gap-3 text-sm leading-6 text-muted-foreground"
                                    >
                                        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:grid-cols-4">
                                <ReleaseFact label="Panel" value="1.15.1" />
                                <ReleaseFact label="PHP" value="8.2 / 8.3" />
                                <ReleaseFact label="Node" value="22+" />
                                <ReleaseFact label="Archive" value="SHA-256" />
                            </div>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href="https://github.com/devrock07/Rockdactyl/releases/tag/v2.1.0"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                        buttonVariants({ size: 'lg' }),
                                        'h-10 rounded-xl px-4',
                                    )}
                                >
                                    Release assets <ArrowUpRightIcon />
                                </a>
                                <a
                                    href="https://github.com/devrock07/Rockdactyl/compare/v2.0.3...v2.1.0"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                        buttonVariants({
                                            variant: 'outline',
                                            size: 'lg',
                                        }),
                                        'h-10 rounded-xl border-white/10 bg-white/[0.025] px-4',
                                    )}
                                >
                                    Full diff
                                </a>
                            </div>
                        </div>
                    </div>
                </article>

                <div className="border-t border-white/[0.075] pt-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        Need an older build or its checksum?
                    </p>
                    <Link
                        href="https://github.com/devrock07/Rockdactyl/releases"
                        className="mt-2 inline-block text-sm font-semibold text-primary hover:text-primary/80"
                    >
                        Browse every GitHub release →
                    </Link>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}

function ReleaseFact({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-2 text-sm font-semibold">{value}</p>
        </div>
    );
}
