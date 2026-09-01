import type { Metadata } from 'next';

import { DocumentationPage } from '@/components/doc-page';
import { docs } from '@/lib/docs';

export const metadata: Metadata = {
    title: 'Documentation — Rock Theme',
    description:
        'Install, configure, operate, and develop Rock Theme for Pterodactyl Panel.',
};

export default function DocsOverviewPage() {
    return <DocumentationPage doc={docs.overview} />;
}
