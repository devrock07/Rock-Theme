import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';

import { siteUrl } from '@/lib/site';

import './globals.css';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    display: 'swap',
});
const robotoMono = Roboto_Mono({
    variable: '--font-roboto-mono',
    subsets: ['latin'],
    display: 'swap',
});
export const metadata: Metadata = {
    metadataBase: new URL(`${siteUrl}/`),
    title: 'Rockdactyl — UI mod for Pterodactyl',
    description: 'A polished, responsive UI mod for Pterodactyl Panel.',
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
        title: 'Rockdactyl — UI mod for Pterodactyl',
        description: 'A polished, responsive UI mod for Pterodactyl Panel.',
        images: [
            {
                url: `${siteUrl}/screenshots/dashboard-crimson.webp`,
                width: 1268,
                height: 713,
                alt: 'The real Rockdactyl dashboard running locally.',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Rockdactyl — UI mod for Pterodactyl',
        description: 'A polished, responsive UI mod for Pterodactyl Panel.',
        images: [`${siteUrl}/screenshots/dashboard-crimson.webp`],
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="en"
            className={`dark ${inter.variable} ${robotoMono.variable}`}
        >
            <body className="antialiased">{children}</body>
        </html>
    );
}
