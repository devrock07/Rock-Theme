import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRightIcon,
    BoxesIcon,
    GaugeIcon,
    PaletteIcon,
    ShieldCheckIcon,
    SmartphoneIcon,
    TerminalIcon,
} from 'lucide-react';

import { CopyCommand } from '@/components/copy-command';
import { NativeParallax } from '@/components/native-parallax';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { PanelScreenshot } from '@/components/panel-screenshot';
import { buttonVariants } from '@/components/ui/button';
import { releaseUrl } from '@/lib/docs';
import { withBasePath } from '@/lib/site';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Rockdactyl — Pterodactyl, refined.',
    description: 'A polished, responsive UI mod for Pterodactyl Panel.',
};

const installCommand = `curl -fsSL https://raw.githubusercontent.com/devrock07/Rockdactyl/main/install.sh \\
  -o /tmp/rockdactyl-install.sh
sudo bash /tmp/rockdactyl-install.sh install`;

export default function Home() {
    return (
        <div className="site-shell relative isolate min-h-screen text-foreground">
            <SiteHeader />
            <NativeParallax />
            <div
                className="site-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1100px]"
                aria-hidden="true"
            />

            <main id="main-content">
                <section className="hero-stage relative mx-auto grid min-h-[calc(100vh-64px)] max-w-[1280px] items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
                    <div
                        className="hero-glow parallax-layer pointer-events-none absolute -left-56 top-0 -z-10 h-[560px] w-[560px] rounded-full"
                        data-parallax="-12"
                        aria-hidden="true"
                    />
                    <div
                        className="hero-watermark pointer-events-none absolute right-[-0.04em] top-1/2 -z-10 -translate-y-1/2 select-none"
                        aria-hidden="true"
                    >
                        R
                    </div>
                    <div className="hero-copy-panel relative z-20 max-w-[650px] lg:col-span-6 lg:col-start-1 lg:row-start-1">
                        <Link
                            href={releaseUrl}
                            aria-label="View the Rockdactyl 2.1.1 release notes"
                            className="release-pill mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/[0.07] px-3.5 py-2 text-primary transition-colors hover:border-primary/35 hover:bg-primary/[0.1]"
                        >
                            <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.75)]" />
                            <span className="font-pixel text-[11px] font-semibold tracking-[0.08em]">
                                ROCKDACTYL 2.1.1
                            </span>
                            <span className="hidden h-3 w-px bg-white/15 sm:block" />
                            <span className="hidden font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground sm:block">
                                Pterodactyl 1.15.1
                            </span>
                        </Link>
                        <h1 className="hero-copy max-w-[760px] text-balance text-[clamp(3.55rem,7.4vw,7rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                            Pterodactyl,
                            <span className="block bg-gradient-to-r from-[#ff9aaa] via-[#f24963] to-[#9f1029] bg-clip-text text-transparent">
                                refined.
                            </span>
                        </h1>
                        <p className="mt-7 max-w-[540px] text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                            A polished, responsive interface mod for every part
                            of your Pterodactyl panel.
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <Link
                                className={cn(
                                    buttonVariants({ size: 'lg' }),
                                    'h-11 rounded-xl bg-primary px-5 shadow-[0_14px_40px_color-mix(in_oklch,var(--primary)_22%,transparent)] hover:bg-primary/90',
                                )}
                                href="/docs/installation"
                            >
                                Install Rockdactyl
                                <ArrowRightIcon />
                            </Link>
                            <Link
                                className={cn(
                                    buttonVariants({
                                        variant: 'outline',
                                        size: 'lg',
                                    }),
                                    'h-11 rounded-xl border-white/10 bg-white/[0.025] px-5',
                                )}
                                href="/docs"
                            >
                                Read the docs
                            </Link>
                        </div>
                    </div>

                    <div
                        className="parallax-layer relative z-10 w-full lg:col-span-8 lg:col-start-5 lg:row-start-1"
                        data-parallax="22"
                    >
                        <div className="hero-product-stage relative mx-auto w-full max-w-[850px]">
                            <div className="hero-screen-plane relative">
                                <PanelScreenshot
                                    src="/screenshots/dashboard-crimson.webp"
                                    alt="Rockdactyl dashboard running locally"
                                    label="Live dashboard"
                                    className="hero-screen"
                                    priority
                                />
                            </div>
                            <div
                                className="hero-mobile-float parallax-layer absolute -bottom-20 -right-5 z-30 hidden w-[168px] xl:block"
                                data-parallax="-14"
                            >
                                <div className="overflow-hidden rounded-[25px] border border-white/[0.14] bg-[#080607] p-1.5 shadow-[0_28px_80px_rgba(0,0,0,.62)]">
                                    <div className="mx-auto mb-1.5 h-3 w-14 rounded-full bg-white/[0.07]" />
                                    <Image
                                        src={withBasePath(
                                            '/screenshots/mobile-dashboard.webp',
                                        )}
                                        alt="Rockdactyl mobile dashboard"
                                        width={390}
                                        height={844}
                                        sizes="168px"
                                        className="aspect-[9/18] w-full rounded-[19px] border border-white/[0.06] object-cover object-top"
                                        priority
                                    />
                                </div>
                            </div>
                            <div
                                className="absolute -bottom-12 left-[12%] right-[12%] -z-10 h-28 rounded-full bg-primary/20 blur-3xl"
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                </section>

                <section
                    id="screens"
                    className="showcase-section section-seam bg-[#0b0809]/45"
                >
                    <div className="mx-auto max-w-[1260px] px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
                        <SectionIntro
                            index="01"
                            eyebrow="Real panel UI"
                            title="Pterodactyl, redesigned end to end."
                            body="Dashboard, console, mobile, and status views—captured from the running mod, never mocked up."
                        />

                        <div className="showcase-meta mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-y border-white/[0.07] py-4 font-mono text-[9px] font-medium uppercase tracking-[0.17em] text-muted-foreground">
                            <span className="inline-flex items-center gap-2 text-foreground/85">
                                <span className="size-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(242,73,99,.7)]" />
                                Real panel captures
                            </span>
                            <span>Client + Admin</span>
                            <span>Desktop + Mobile</span>
                            <span className="sm:ml-auto">No mockups</span>
                        </div>

                        <div className="showcase-bento mt-6">
                            <div
                                className="showcase-tile showcase-dashboard"
                                data-reveal="true"
                            >
                                <SurfaceHeader
                                    icon={PaletteIcon}
                                    index="01"
                                    label="Dashboard"
                                    title="Your servers, at a glance."
                                />
                                <div
                                    className="parallax-layer showcase-media"
                                    data-parallax="10"
                                >
                                    <PanelScreenshot
                                        src="/screenshots/dashboard-crimson.webp"
                                        alt="Rockdactyl dashboard"
                                        label="Dashboard"
                                        className="showcase-screen"
                                    />
                                </div>
                            </div>

                            <div
                                className="showcase-tile showcase-mobile"
                                data-reveal="true"
                            >
                                <SurfaceHeader
                                    icon={SmartphoneIcon}
                                    index="02"
                                    label="Responsive"
                                    title="Full control at any size."
                                />
                                <div
                                    className="parallax-layer showcase-phone-wrap"
                                    data-parallax="-14"
                                >
                                    <figure className="mobile-shot mx-auto w-full max-w-[285px] overflow-hidden rounded-[30px] border border-white/[0.13] bg-[#080607] p-2">
                                        <div
                                            className="mx-auto mb-2 h-4 w-20 rounded-full bg-white/[0.065]"
                                            aria-hidden="true"
                                        />
                                        <Image
                                            src={withBasePath(
                                                '/screenshots/mobile-dashboard.webp',
                                            )}
                                            alt="Rockdactyl dashboard at a mobile viewport"
                                            width={390}
                                            height={844}
                                            sizes="285px"
                                            className="aspect-[9/18] w-full rounded-[23px] border border-white/[0.06] object-cover object-top"
                                        />
                                    </figure>
                                </div>
                            </div>

                            <div
                                id="features"
                                className="showcase-tile showcase-brand"
                                data-reveal="true"
                            >
                                <div className="relative z-10 max-w-sm">
                                    <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-[#ff9aaa]">
                                        <PaletteIcon className="size-5" />
                                    </span>
                                    <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.18em] text-[#ff9aaa]">
                                        Admin controlled
                                    </p>
                                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                                        Your identity, not ours.
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-white/60">
                                        Set your logo, dashboard media, radius,
                                        glass, motion, and console background
                                        from Panel Settings.
                                    </p>
                                </div>
                                <div className="brand-orbit" aria-hidden="true">
                                    <span>LOGO</span>
                                    <span>MEDIA</span>
                                    <span>MOTION</span>
                                </div>
                            </div>

                            <div
                                className="showcase-tile showcase-telemetry"
                                data-reveal="true"
                            >
                                <div className="relative z-10">
                                    <span className="grid size-11 place-items-center rounded-xl border border-primary/15 bg-primary/[0.065] text-primary">
                                        <GaugeIcon className="size-5" />
                                    </span>
                                    <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                                        Telemetry
                                    </p>
                                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                                        Resource history, without the clutter.
                                    </h3>
                                    <div
                                        className="telemetry-signal mt-7"
                                        aria-hidden="true"
                                    >
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                    <div className="mt-3 flex justify-between font-mono text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
                                        <span>1 hour</span>
                                        <span>24 hours</span>
                                        <span>7 days</span>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="showcase-tile showcase-console"
                                data-reveal="true"
                            >
                                <SurfaceHeader
                                    icon={TerminalIcon}
                                    index="03"
                                    label="Console"
                                    title="Clear output. Focused controls."
                                />
                                <div
                                    className="parallax-layer showcase-media"
                                    data-parallax="8"
                                >
                                    <PanelScreenshot
                                        src="/screenshots/console.webp"
                                        alt="Rockdactyl server console with resource telemetry"
                                        label="Server console"
                                        className="showcase-screen"
                                    />
                                </div>
                            </div>

                            <div
                                className="showcase-tile showcase-status"
                                data-reveal="true"
                            >
                                <SurfaceHeader
                                    icon={ShieldCheckIcon}
                                    index="04"
                                    label="Public status"
                                    title="Status without clutter."
                                />
                                <div
                                    className="parallax-layer showcase-media"
                                    data-parallax="-8"
                                >
                                    <PanelScreenshot
                                        src="/screenshots/status.webp"
                                        alt="Rockdactyl public status page"
                                        label="Public status"
                                        className="showcase-screen"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="install" className="install-band section-seam">
                    <div
                        className="install-wordmark pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none"
                        aria-hidden="true"
                    >
                        INSTALL
                    </div>
                    <div className="relative mx-auto grid max-w-[1260px] items-center gap-12 px-5 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-32">
                        <div className="relative z-10" data-reveal="true">
                            <p className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff9aaa]">
                                <span className="h-px w-7 bg-[#ff6b82]" />
                                UI mod for Pterodactyl
                            </p>
                            <h2 className="mt-5 max-w-[650px] text-balance text-[clamp(3rem,6.2vw,6.2rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                                Install the interface.
                                <span className="block text-[#ff7f93]">
                                    Keep the way back.
                                </span>
                            </h2>
                            <p className="mt-6 max-w-[52ch] text-base leading-7 text-white/60">
                                One manager installs Rockdactyl, verifies the
                                package, and preserves a rollback snapshot.
                            </p>
                            <Link
                                href="/docs/installation"
                                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#ff9aaa]"
                            >
                                Installation guide
                                <ArrowRightIcon className="size-4" />
                            </Link>
                        </div>
                        <div
                            className="parallax-layer install-terminal-plane relative z-10 min-w-0"
                            data-parallax="14"
                        >
                            <div
                                className="overflow-hidden rounded-[22px] border border-white/[0.12] bg-[#070506]"
                                data-reveal="true"
                            >
                                <div className="flex h-12 items-center border-b border-white/[0.075] px-4">
                                    <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">
                                        <span className="size-1.5 rounded-full bg-emerald-300" />
                                        Install · Linux
                                    </span>
                                    <span className="ml-auto">
                                        <CopyCommand value={installCommand} />
                                    </span>
                                </div>
                                <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-[12px] leading-7 text-[#ffabb8] sm:p-6 sm:text-[13px]">
                                    <code>{installCommand}</code>
                                </pre>
                                <div className="grid gap-2 border-t border-white/[0.075] p-4 sm:grid-cols-3">
                                    <InstallCheck
                                        icon={ShieldCheckIcon}
                                        text="Checksum"
                                    />
                                    <InstallCheck
                                        icon={BoxesIcon}
                                        text="Archive"
                                    />
                                    <InstallCheck
                                        icon={GaugeIcon}
                                        text="Snapshot"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    className="section-seam relative mx-auto max-w-[1220px] overflow-hidden px-5 py-28 text-center sm:px-6 lg:px-8 lg:py-36"
                    data-reveal="true"
                >
                    <div
                        className="parallax-layer pointer-events-none absolute inset-0 -z-10"
                        data-parallax="-10"
                        aria-hidden="true"
                    >
                        <div className="hero-glow absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                    </div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                        Open source · fully yours
                    </p>
                    <h2 className="mx-auto mt-5 max-w-4xl text-balance text-[clamp(2.7rem,6vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                        Give your panel the interface it deserves.
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
                        Shape it from Panel Settings, use it across every
                        surface, and keep the whole experience unmistakably
                        yours.
                    </p>
                    <div className="mt-9 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/docs"
                            className={cn(
                                buttonVariants({ size: 'lg' }),
                                'h-11 rounded-xl px-5',
                            )}
                        >
                            Explore documentation <ArrowRightIcon />
                        </Link>
                        <a
                            href="https://github.com/devrock07/Rockdactyl"
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                                buttonVariants({
                                    variant: 'outline',
                                    size: 'lg',
                                }),
                                'h-11 rounded-xl border-white/10 bg-white/[0.025] px-5',
                            )}
                        >
                            View source
                        </a>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}

function SectionIntro({
    index,
    eyebrow,
    title,
    body,
}: {
    index?: string;
    eyebrow: string;
    title: string;
    body: string;
}) {
    return (
        <div className="section-intro relative max-w-3xl" data-reveal="true">
            {index ? (
                <span className="section-index" aria-hidden="true">
                    {index}
                </span>
            ) : null}
            <p className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                <span
                    className="h-px w-6 bg-gradient-to-r from-primary to-primary/10"
                    aria-hidden="true"
                />
                {eyebrow}
            </p>
            <h2 className="mt-4 text-balance text-[clamp(2.5rem,5vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
                {title}
            </h2>
            <p className="mt-5 max-w-[58ch] text-pretty text-base leading-7 text-muted-foreground">
                {body}
            </p>
        </div>
    );
}

function SurfaceHeader({
    icon: Icon,
    index,
    label,
    title,
}: {
    icon: typeof ShieldCheckIcon;
    index: string;
    label: string;
    title: string;
}) {
    return (
        <div className="surface-header relative z-10 flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/[0.065] text-primary">
                <Icon className="size-4.5" />
            </span>
            <div className="min-w-0">
                <p className="font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-primary/85">
                    {label}
                </p>
                <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
                    {title}
                </h3>
            </div>
            <span className="ml-auto font-mono text-[9px] tracking-[0.16em] text-white/25">
                / {index}
            </span>
        </div>
    );
}

function InstallCheck({
    icon: Icon,
    text,
}: {
    icon: typeof ShieldCheckIcon;
    text: string;
}) {
    return (
        <span className="flex items-center gap-2 rounded-lg bg-white/[0.025] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Icon className="size-3.5 text-emerald-300" />
            {text} verified
        </span>
    );
}
