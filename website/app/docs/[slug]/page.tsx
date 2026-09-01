import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocumentationPage } from '@/components/doc-page';
import { docs } from '@/lib/docs';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return Object.keys(docs)
        .filter((slug) => slug !== 'overview')
        .map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const doc = docs[slug];
    if (!doc) return {};
    return { title: `${doc.title} — Rockdactyl`, description: doc.description };
}

export default async function DocsPage({ params }: PageProps) {
    const { slug } = await params;
    const doc = docs[slug];
    if (!doc || slug === 'overview') notFound();
    return <DocumentationPage doc={doc} />;
}
