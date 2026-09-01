import Link from 'next/link';

import { BrandMark } from '@/components/site-header';

export function SiteFooter() {
    return (
        <footer className="border-t border-white/[0.075] bg-black/15">
            <div className="mx-auto grid max-w-[1220px] gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1.3fr_repeat(3,1fr)] lg:px-8">
                <div className="max-w-sm">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <BrandMark />
                        <span className="font-semibold">Rockdactyl</span>
                    </Link>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        A polished, responsive UI mod for Pterodactyl Panel.
                    </p>
                </div>
                <FooterGroup
                    title="Project"
                    links={[
                        ['Documentation', '/docs'],
                        ['Changelog', '/changelog'],
                        [
                            'Releases',
                            'https://github.com/devrock07/Rockdactyl/releases',
                        ],
                    ]}
                />
                <FooterGroup
                    title="Community"
                    links={[
                        [
                            'Issues',
                            'https://github.com/devrock07/Rockdactyl/issues',
                        ],
                        [
                            'Discussions',
                            'https://github.com/devrock07/Rockdactyl/discussions',
                        ],
                        [
                            'Contributing',
                            'https://github.com/devrock07/Rockdactyl/blob/main/.github/CONTRIBUTING.md',
                        ],
                    ]}
                />
                <FooterGroup
                    title="Trust"
                    links={[
                        [
                            'Security',
                            'https://github.com/devrock07/Rockdactyl/security/policy',
                        ],
                        [
                            'License',
                            'https://github.com/devrock07/Rockdactyl/blob/main/LICENSE',
                        ],
                        [
                            'Attribution',
                            'https://github.com/devrock07/Rockdactyl/blob/main/THIRD_PARTY_NOTICES.md',
                        ],
                    ]}
                />
            </div>
            <div className="mx-auto flex max-w-[1220px] flex-col gap-2 border-t border-white/[0.06] px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <p>DevRock © 2022–2026</p>
                <p>Independent project. Not affiliated with Pterodactyl.</p>
            </div>
        </footer>
    );
}

function FooterGroup({
    title,
    links,
}: {
    title: string;
    links: ReadonlyArray<readonly [string, string]>;
}) {
    return (
        <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/80">
                {title}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {links.map(([label, href]) => (
                    <li key={href}>
                        <Link
                            className="transition-colors hover:text-foreground"
                            href={href}
                        >
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
