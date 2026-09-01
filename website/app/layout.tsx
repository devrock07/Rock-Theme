import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { siteUrl } from '@/lib/site';

import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    metadataBase: new URL(`${siteUrl}/`),
    title: 'Rockdactyl — Pterodactyl, refined.',
    description:
        'A polished, responsive theme and release system for Pterodactyl Panel.',
    keywords: [
        'Pterodactyl',
        'Pterodactyl theme',
        'game server panel',
        'Rockdactyl',
    ],
    authors: [{ name: 'DevRock', url: 'https://github.com/devrock07' }],
    creator: 'DevRock',
    alternates: {
        canonical: `${siteUrl}/`,
    },
    openGraph: {
        url: `${siteUrl}/`,
        type: 'website',
        title: 'Rockdactyl — Pterodactyl, refined.',
        description:
            'A polished, responsive, operator-configurable interface distribution for Pterodactyl Panel.',
        images: [
            {
                url: `${siteUrl}/screenshots/dashboard-crimson.webp`,
                width: 1268,
                height: 713,
                alt: 'The real Rockdactyl dashboard running locally in Crimson Red.',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Rockdactyl — Pterodactyl, refined.',
        description:
            'A polished, responsive interface distribution for Pterodactyl Panel.',
        images: [`${siteUrl}/screenshots/dashboard-crimson.webp`],
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
