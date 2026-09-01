import type { Metadata } from 'next';

import { DocumentationPage } from '@/components/doc-page';
import { docs } from '@/lib/docs';

export const metadata: Metadata = {
    title: 'Documentation — Rockdactyl',
    description:
        'Install, configure, operate, and develop Rockdactyl for Pterodactyl Panel.',
};

export default function DocsOverviewPage() {
    return <DocumentationPage doc={docs.overview} />;
}
