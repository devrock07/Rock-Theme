import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRightIcon,
    CheckIcon,
    GaugeIcon,
    PaletteIcon,
    ShieldCheckIcon,
    SmartphoneIcon,
    TerminalIcon,
} from 'lucide-react';

import { CopyCommand } from '@/components/copy-command';
import { NativeParallax } from '@/components/native-parallax';
import { PanelScreenshot } from '@/components/panel-screenshot';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
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

const capabilities = [
    {
        icon: PaletteIcon,
        title: 'Designed as one system',
        body: 'Client pages, server controls, and administration share the same visual language.',
    },
    {
        icon: SmartphoneIcon,
        title: 'Built for every screen',
        body: 'Layouts, navigation, dialogs, and controls stay usable from desktop down to mobile.',
    },
    {
        icon: GaugeIcon,
        title: 'Controlled from the panel',
        body: 'Branding, dashboard media, motion, radius, and console styling live in Panel Settings.',
    },
] as const;

export default function Home() {
    return (
        <div className="site-shell relative isolate min-h-screen text-foreground">
            <SiteHeader />
            <NativeParallax />

            <main id="main-content">
                <section className="landing-hero">
                    <div className="hero-ambient" aria-hidden="true" />
                    <div className="hero-grid" aria-hidden="true" />

                    <div className="mx-auto max-w-[1220px] px-5 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-20">
                        <div
                            className="relative z-10 mx-auto max-w-[860px] text-center"
                            data-reveal="true"
                        >
                            <Link
                                href={releaseUrl}
                                className="release-link"
                                aria-label="View Rockdactyl 2.1.1 release notes"
                            >
                                <span className="release-dot" />
                                Rockdactyl 2.1.1
                                <span
                                    className="release-separator"
                                    aria-hidden="true"
                                >
                                    ·
                                </span>
                                <span className="release-compat">
                                    Pterodactyl 1.15.1
                                </span>
                                <ArrowRightIcon className="size-3.5" />
                            </Link>

                            <h1 className="hero-title mt-7 text-balance text-[clamp(3.5rem,8vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
                                Your panel,
                                <span className="hero-title-accent block">
                                    properly refined.
                                </span>
                            </h1>
                            <p className="mx-auto mt-7 max-w-[620px] text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                                A complete interface mod that makes Pterodactyl
                                feel focused, responsive, and unmistakably
                                yours.
                            </p>
                            <div className="mt-9 flex flex-wrap justify-center gap-3">
                                <Link
                                    className={cn(
                                        buttonVariants({ size: 'lg' }),
                                        'h-11 rounded-xl bg-primary px-5 shadow-[0_16px_45px_rgba(212,38,67,.22)] hover:bg-primary/90',
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
                                        'h-11 rounded-xl border-white/10 bg-white/[0.025] px-5 hover:bg-white/[0.055]',
                                    )}
                                    href="/docs"
                                >
                                    Read the docs
                                </Link>
                            </div>
                        </div>

                        <div
                            className="hero-window relative z-10 mx-auto mt-12 max-w-[1120px] sm:mt-14"
                            data-reveal="true"
                        >
                            <div
                                className="hero-window-glow"
                                aria-hidden="true"
                            />
                            <PanelScreenshot
                                src="/screenshots/dashboard-crimson.webp"
                                alt="The real Rockdactyl dashboard showing server cards and panel navigation"
                                label="Rockdactyl dashboard"
                                className="hero-dashboard"
                                priority
                            />
                        </div>
                    </div>
                </section>

                <section id="screens" className="product-story section-line">
                    <div className="mx-auto max-w-[1220px] px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
                        <div className="story-heading" data-reveal="true">
                            <p className="section-kicker">The real interface</p>
                            <h2 className="mt-4 max-w-[760px] text-balance text-[clamp(2.6rem,5.5vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
                                Clear where it matters.
                                <span className="block text-white/40">
                                    Quiet everywhere else.
                                </span>
                            </h2>
                            <p className="mt-6 max-w-[58ch] text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                                Every image below is captured from Rockdactyl
                                itself—no generated dashboards and no decorative
                                mock data.
                            </p>
                        </div>

                        <article
                            className="story-panel story-console mt-14 lg:mt-20"
                            data-reveal="true"
                        >
                            <div className="story-copy">
                                <span className="story-icon">
                                    <TerminalIcon className="size-5" />
                                </span>
                                <p className="section-kicker mt-7">
                                    Server console
                                </p>
                                <h3 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                                    Your server stays the focus.
                                </h3>
                                <p className="mt-4 max-w-[42ch] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                                    Output, power controls, navigation, and live
                                    resource data share one calm workspace
                                    without fighting for attention.
                                </p>
                                <ul className="story-list mt-7">
                                    <StoryPoint text="Readable terminal output" />
                                    <StoryPoint text="Compact server navigation" />
                                    <StoryPoint text="Responsive resource cards" />
                                </ul>
                            </div>
                            <div className="story-media">
                                <PanelScreenshot
                                    src="/screenshots/console.webp"
                                    alt="Rockdactyl server console with resource telemetry"
                                    label="Server console"
                                    className="story-screen"
                                />
                            </div>
                        </article>

                        <div className="surface-grid mt-5 lg:mt-6">
                            <article
                                className="mobile-surface"
                                data-reveal="true"
                            >
                                <div className="surface-copy">
                                    <span className="story-icon">
                                        <SmartphoneIcon className="size-5" />
                                    </span>
                                    <p className="section-kicker mt-6">
                                        Mobile ready
                                    </p>
                                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
                                        The full panel, in your hand.
                                    </h3>
                                    <p className="mt-4 max-w-[40ch] text-sm leading-6 text-muted-foreground">
                                        Navigation and server controls are
                                        rebuilt for narrow screens instead of
                                        simply squeezed into them.
                                    </p>
                                </div>
                                <div className="phone-stage">
                                    <figure className="phone-frame">
                                        <div
                                            className="phone-island"
                                            aria-hidden="true"
                                        />
                                        <Image
                                            src={withBasePath(
                                                '/screenshots/mobile-dashboard.webp',
                                            )}
                                            alt="Rockdactyl dashboard at a mobile viewport"
                                            width={390}
                                            height={844}
                                            sizes="(max-width: 768px) 260px, 300px"
                                            className="phone-image"
                                        />
                                    </figure>
                                </div>
                            </article>

                            <article
                                className="status-surface"
                                data-reveal="true"
                            >
                                <div className="surface-copy">
                                    <span className="story-icon">
                                        <ShieldCheckIcon className="size-5" />
                                    </span>
                                    <p className="section-kicker mt-6">
                                        Public status
                                    </p>
                                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
                                        A status page people can actually read.
                                    </h3>
                                </div>
                                <div className="status-media">
                                    <PanelScreenshot
                                        src="/screenshots/status.webp"
                                        alt="Rockdactyl public status page"
                                        label="Public status"
                                        className="story-screen"
                                    />
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                <section id="features" className="capability-band section-line">
                    <div className="mx-auto max-w-[1220px] px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
                        <div className="capability-heading" data-reveal="true">
                            <div>
                                <p className="section-kicker">
                                    More than a coat of paint
                                </p>
                                <h2 className="mt-4 max-w-[650px] text-balance text-[clamp(2.4rem,4.5vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
                                    One design language across the panel.
                                </h2>
                            </div>
                            <p className="max-w-[48ch] text-base leading-7 text-muted-foreground lg:pt-7">
                                Rockdactyl handles the surfaces people use
                                daily, including the awkward states and compact
                                screens that most visual themes ignore.
                            </p>
                        </div>

                        <div className="capability-grid mt-10">
                            {capabilities.map(({ icon: Icon, title, body }) => (
                                <article
                                    key={title}
                                    className="capability-item"
                                    data-reveal="true"
                                >
                                    <span className="capability-icon">
                                        <Icon className="size-4.5" />
                                    </span>
                                    <div>
                                        <h3 className="text-base font-semibold tracking-[-0.025em]">
                                            {title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {body}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="install" className="install-section section-line">
                    <div className="mx-auto max-w-[1220px] px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
                        <div className="install-card" data-reveal="true">
                            <div className="install-copy">
                                <p className="section-kicker">
                                    Guided installation
                                </p>
                                <h2 className="mt-4 max-w-[560px] text-balance text-[clamp(2.5rem,5vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
                                    Upgrade the interface.
                                    <span className="block text-primary">
                                        Keep a safe way back.
                                    </span>
                                </h2>
                                <p className="mt-6 max-w-[52ch] text-base leading-7 text-muted-foreground">
                                    The manager verifies the release, creates a
                                    rollback snapshot, and applies Rockdactyl
                                    through a guided terminal flow.
                                </p>
                                <Link
                                    href="/docs/installation"
                                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-primary"
                                >
                                    Open the installation guide
                                    <ArrowRightIcon className="size-4" />
                                </Link>
                            </div>

                            <div className="install-terminal">
                                <div className="terminal-bar">
                                    <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-white/45">
                                        <span className="size-1.5 rounded-full bg-emerald-300" />
                                        Installer · Linux
                                    </span>
                                    <CopyCommand value={installCommand} />
                                </div>
                                <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-[12px] leading-7 text-[#ffabb8] sm:p-6 sm:text-[13px]">
                                    <code>{installCommand}</code>
                                </pre>
                                <div className="terminal-footer">
                                    <span>Verified release</span>
                                    <span>Rollback snapshot</span>
                                    <span>Guided restore</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}

function StoryPoint({ text }: { text: string }) {
    return (
        <li>
            <CheckIcon className="size-3.5 text-primary" />
            <span>{text}</span>
        </li>
    );
}
