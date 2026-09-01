import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Rock Theme — Pterodactyl, refined.',
    description:
        'A polished, responsive theme and release system for Pterodactyl Panel.',
    keywords: [
        'Pterodactyl',
        'Pterodactyl theme',
        'game server panel',
        'Rock Theme',
    ],
    authors: [{ name: 'DevRock', url: 'https://github.com/devrock07' }],
    creator: 'DevRock',
    openGraph: {
        type: 'website',
        title: 'Rock Theme — Pterodactyl, refined.',
        description:
            'A polished, responsive, operator-configurable interface distribution for Pterodactyl Panel.',
        images: [
            {
                url: 'https://raw.githubusercontent.com/devrock07/Rock-Theme/main/website/public/screenshots/dashboard-crimson.webp',
                width: 1268,
                height: 713,
                alt: 'The real Rock Theme dashboard running locally in Crimson Red.',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Rock Theme — Pterodactyl, refined.',
        description:
            'A polished, responsive interface distribution for Pterodactyl Panel.',
        images: [
            'https://raw.githubusercontent.com/devrock07/Rock-Theme/main/website/public/screenshots/dashboard-crimson.webp',
        ],
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
