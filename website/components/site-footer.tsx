import Link from 'next/link';

import { BrandMark } from '@/components/site-header';

const footerLinks = [
    { href: '/docs', label: 'Docs', external: false },
    {
        href: 'https://github.com/devrock07/Rockdactyl',
        label: 'GitHub',
        external: true,
    },
    {
        href: 'https://github.com/devrock07/Rockdactyl/blob/main/LICENSE',
        label: 'License',
        external: true,
    },
] as const;

export function SiteFooter() {
    return (
        <footer className="border-t border-white/[0.075] bg-black/15">
            <div className="mx-auto max-w-[1220px] px-5 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/"
                        aria-label="Rockdactyl home"
                        className="inline-flex w-fit items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                        <BrandMark className="size-7 rounded-lg text-[13px]" />
                        <span className="text-sm font-semibold tracking-[-0.025em]">
                            Rockdactyl
                        </span>
                    </Link>

                    <nav aria-label="Footer navigation">
                        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                            {footerLinks.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        target={
                                            item.external ? '_blank' : undefined
                                        }
                                        rel={
                                            item.external
                                                ? 'noreferrer'
                                                : undefined
                                        }
                                        className="rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
                                    >
                                        {item.label}
                                        {item.external ? (
                                            <span className="sr-only">
                                                {' '}
                                                (opens in a new tab)
                                            </span>
                                        ) : null}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <p className="mt-6 border-t border-white/[0.06] pt-5 text-xs leading-5 text-muted-foreground">
                    Rockdactyl is an independent project and is not affiliated
                    with or endorsed by Pterodactyl.
                </p>
            </div>
        </footer>
    );
}
