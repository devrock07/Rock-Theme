import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRightIcon,
    BoxesIcon,
    CheckCircle2Icon,
    GaugeIcon,
    PaletteIcon,
    ShieldCheckIcon,
    SmartphoneIcon,
    TerminalIcon,
} from 'lucide-react';

import { CopyCommand } from '@/components/copy-command';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { PanelScreenshot, ThemePreview } from '@/components/theme-preview';
import { buttonVariants } from '@/components/ui/button';
import { releaseUrl } from '@/lib/docs';
import { withBasePath } from '@/lib/site';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Rockdactyl — Pterodactyl, refined.',
    description:
        'A polished, responsive, operator-configurable interface distribution for Pterodactyl Panel.',
};

const features = [
    {
        icon: PaletteIcon,
        eyebrow: 'Theme Studio',
        title: 'Brand the whole panel.',
        body: 'Identity, logo, favicons, dashboard artwork, login media, console media, glass, radius, and motion—all from Admin Settings.',
    },
    {
        icon: GaugeIcon,
        eyebrow: 'Telemetry',
        title: 'Operational context built in.',
        body: 'Live resource charts, one-hour and 24-hour views, seven-day retention, persistent notifications, and public incidents.',
    },
    {
        icon: SmartphoneIcon,
        eyebrow: 'Adaptive UI',
        title: 'Desktop and mobile agree.',
        body: 'Viewport-safe menus and dialogs, touch-sized actions, a compact header, bottom navigation, and reduced-motion support.',
    },
    {
        icon: ShieldCheckIcon,
        eyebrow: 'Delivery',
        title: 'A release you can recover.',
        body: 'Checksums, archive validation, manager snapshots, restore, reproducible releases, and upstream compatibility automation.',
    },
] as const;

const installCommand = `curl -fsSL https://raw.githubusercontent.com/devrock07/Rockdactyl/main/install.sh \\
  -o /tmp/rockdactyl-install.sh
sudo bash /tmp/rockdactyl-install.sh install`;

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            <div
                className="site-grid pointer-events-none fixed inset-0 -z-10"
                aria-hidden="true"
            />

            <main id="main-content">
                <section className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-[1220px] items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-24">
                    <div
                        className="hero-glow pointer-events-none absolute -left-56 top-0 -z-10 h-[560px] w-[560px] rounded-full"
                        aria-hidden="true"
                    />
                    <div className="max-w-[600px]">
                        <Link
                            href={releaseUrl}
                            className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-primary transition hover:border-primary/35 hover:bg-primary/[0.1]"
                        >
                            <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.75)]" />
                            v2.1.0 · Pterodactyl 1.15.1
                        </Link>
                        <h1 className="max-w-[720px] text-balance text-[clamp(3.35rem,7.2vw,6.7rem)] font-semibold leading-[0.87] tracking-[-0.078em]">
                            Pterodactyl,
                            <span className="block bg-gradient-to-r from-[#ff9aaa] via-[#f24963] to-[#9f1029] bg-clip-text text-transparent">
                                refined.
                            </span>
                        </h1>
                        <p className="mt-7 max-w-[540px] text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                            A complete panel distribution with a precise
                            interface, native operator controls, and a release
                            path built to be reversed.
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
                        <dl className="mt-12 grid max-w-lg grid-cols-3 gap-3 border-t border-white/8 pt-6">
                            <Metric label="Presets" value="2 finished" />
                            <Metric label="Telemetry" value="7 days" />
                            <Metric label="Containers" value="2 arches" />
                        </dl>
                    </div>

                    <div className="relative mx-auto w-full max-w-[760px] lg:translate-x-8">
                        <PanelScreenshot
                            src="/screenshots/dashboard-crimson.webp"
                            alt="Rockdactyl dashboard running locally in Crimson Red"
                            label="Local panel · Crimson"
                        />
                        <div
                            className="absolute -bottom-9 left-[10%] right-[10%] -z-10 h-20 rounded-full bg-primary/22 blur-3xl"
                            aria-hidden="true"
                        />
                    </div>
                </section>

                <section className="border-y border-white/[0.07] bg-black/15">
                    <div className="mx-auto grid max-w-[1220px] grid-cols-2 divide-x divide-white/[0.065] px-5 sm:px-6 md:grid-cols-4 lg:px-8">
                        <Proof label="Panel base" value="1.15.1" />
                        <Proof label="PHP" value="8.2 / 8.3" />
                        <Proof label="Containers" value="amd64 / arm64" />
                        <Proof label="Release" value="SHA-256 checksum" />
                    </div>
                </section>

                <section className="mx-auto max-w-[1220px] px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
                    <SectionIntro
                        eyebrow="One system"
                        title="Designed past the dashboard."
                        body="Rockdactyl carries the same visual, responsive, and interaction rules through the client, server, status, login, and administration interfaces."
                    />
                    <div className="mt-12 grid gap-4 md:grid-cols-2">
                        {features.map((feature, index) => (
                            <article
                                key={feature.title}
                                className={cn(
                                    'feature-card group relative overflow-hidden rounded-[24px] border border-white/[0.085] bg-white/[0.025] p-7 sm:p-8',
                                    index === 0 && 'md:row-span-1',
                                )}
                            >
                                <div className="mb-12 flex items-start justify-between">
                                    <span className="grid size-11 place-items-center rounded-xl border border-primary/18 bg-primary/[0.065] text-primary">
                                        <feature.icon className="size-5" />
                                    </span>
                                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                                        0{index + 1}
                                    </span>
                                </div>
                                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                                    {feature.eyebrow}
                                </p>
                                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                                    {feature.body}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="border-y border-white/[0.07] bg-[#0b0809]/80">
                    <div className="mx-auto grid max-w-[1220px] gap-14 px-5 py-24 sm:px-6 lg:grid-cols-[0.42fr_0.58fr] lg:px-8 lg:py-32">
                        <div className="lg:sticky lg:top-28 lg:self-start">
                            <SectionIntro
                                eyebrow="Two finished presets"
                                title="One interface. Two temperatures."
                                body="Crimson Red is the signature. Midnight Blue is the calm alternative. Both reach every panel surface and interaction state."
                            />
                            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                                {[
                                    'Client and admin share the preset',
                                    'Saved centrally in Panel Settings',
                                    'Reduced motion and mobile-safe behavior',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-3"
                                    >
                                        <CheckCircle2Icon className="size-4 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <ThemePreview />
                    </div>
                </section>

                <section className="mx-auto max-w-[1220px] px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
                    <SectionIntro
                        eyebrow="Real panel surfaces"
                        title="The details operators actually touch."
                        body="Console telemetry, theme controls, responsive navigation, file actions, and administration modals are designed and tested as part of the same release."
                    />
                    <div className="mt-12 grid gap-5 lg:grid-cols-2">
                        <PanelScreenshot
                            src="/screenshots/console.webp"
                            alt="Rockdactyl server console with resource telemetry"
                            label="Server console"
                        />
                        <PanelScreenshot
                            src="/screenshots/theme-studio.webp"
                            alt="Rockdactyl administration Theme Studio"
                            label="Admin · Theme Studio"
                        />
                        <div className="lg:col-span-2 grid gap-5 lg:grid-cols-[1fr_0.46fr]">
                            <PanelScreenshot
                                src="/screenshots/status.webp"
                                alt="Rockdactyl public status page"
                                label="Public status"
                            />
                            <figure className="mobile-shot mx-auto w-full max-w-[370px] overflow-hidden rounded-[30px] border border-white/[0.11] bg-[#080607] p-2 shadow-[0_30px_90px_rgba(0,0,0,.45)]">
                                <div
                                    className="mx-auto mb-2 h-5 w-24 rounded-full bg-white/[0.065]"
                                    aria-hidden="true"
                                />
                                <Image
                                    src={withBasePath(
                                        '/screenshots/mobile-dashboard.webp',
                                    )}
                                    alt="Rockdactyl dashboard at a mobile viewport"
                                    width={390}
                                    height={844}
                                    sizes="370px"
                                    className="aspect-[9/18] w-full rounded-[23px] border border-white/[0.06] object-cover object-top"
                                />
                            </figure>
                        </div>
                    </div>
                </section>

                <section className="border-y border-white/[0.07] bg-black/20">
                    <div className="mx-auto grid max-w-[1220px] gap-12 px-5 py-24 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-28">
                        <div>
                            <div className="mb-6 grid size-12 place-items-center rounded-2xl border border-primary/18 bg-primary/[0.07] text-primary">
                                <TerminalIcon className="size-5" />
                            </div>
                            <SectionIntro
                                eyebrow="Verified delivery"
                                title="Install it with a way back."
                                body="The manager verifies the release, snapshots the existing panel, applies the build, and keeps a restore path. Download first; inspect before running."
                            />
                            <Link
                                href="/docs/installation"
                                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                            >
                                Read the install guide{' '}
                                <ArrowRightIcon className="size-4" />
                            </Link>
                        </div>
                        <div className="overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#070506] shadow-2xl">
                            <div className="flex h-11 items-center border-b border-white/[0.065] px-4">
                                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    Install · Linux
                                </span>
                                <span className="ml-auto">
                                    <CopyCommand value={installCommand} />
                                </span>
                            </div>
                            <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-[13px] leading-7 text-[#f3b0ba]">
                                <code>{installCommand}</code>
                            </pre>
                            <div className="grid gap-2 border-t border-white/[0.065] p-4 sm:grid-cols-3">
                                <InstallCheck
                                    icon={ShieldCheckIcon}
                                    text="Checksum"
                                />
                                <InstallCheck icon={BoxesIcon} text="Archive" />
                                <InstallCheck
                                    icon={GaugeIcon}
                                    text="Snapshot"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative mx-auto max-w-[1220px] overflow-hidden px-5 py-28 text-center sm:px-6 lg:px-8 lg:py-36">
                    <div
                        className="hero-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                        aria-hidden="true"
                    />
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                        Open source · operator controlled
                    </p>
                    <h2 className="mx-auto mt-5 max-w-4xl text-balance text-[clamp(2.7rem,6vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.065em]">
                        A panel theme that behaves like a product.
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
                        Read the source, verify the release, configure the
                        interface, and keep your rollback path.
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

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.17em] text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-2 text-sm font-semibold">{value}</dd>
        </div>
    );
}

function Proof({ label, value }: { label: string; value: string }) {
    return (
        <div className="px-4 py-6 text-center sm:px-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-2 text-sm font-semibold">{value}</p>
        </div>
    );
}

function SectionIntro({
    eyebrow,
    title,
    body,
}: {
    eyebrow: string;
    title: string;
    body: string;
}) {
    return (
        <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                {eyebrow}
            </p>
            <h2 className="mt-4 text-balance text-[clamp(2.5rem,5vw,4.6rem)] font-semibold leading-[0.96] tracking-[-0.058em]">
                {title}
            </h2>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
                {body}
            </p>
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
