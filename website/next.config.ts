import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
    agentRules: false,
    output: 'export',
    trailingSlash: true,
    basePath,
    assetPrefix: basePath || undefined,
    images: {
        unoptimized: true,
    },
    turbopack: {
        root: process.cwd(),
    },
};

export default nextConfig;
