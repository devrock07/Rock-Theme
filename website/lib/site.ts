const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const siteBasePath = configuredBasePath.replace(/\/$/, '');
export const siteUrl = 'https://devrock07.github.io/Rock-Theme';

export function withBasePath(path: string): string {
    if (!path.startsWith('/')) return path;
    return `${siteBasePath}${path}`;
}
