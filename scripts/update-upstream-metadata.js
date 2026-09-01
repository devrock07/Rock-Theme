#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const versionPattern = /^v(\d+)\.(\d+)\.(\d+)$/;

const synchronizedVersionFiles = [
    { path: 'README.md', theme: true, upstream: true },
    { path: 'docs/README.md', theme: true, upstream: true },
    { path: 'docs/INSTALLATION.md', theme: true, upstream: true },
    { path: 'docs/UPGRADING.md', theme: true, upstream: true },
    { path: 'SECURITY.md', upstream: true },
    { path: '.github/ISSUE_TEMPLATE/1-bug-report.yml', theme: true, upstream: true },
    { path: '.github/ISSUE_TEMPLATE/2-feature-request.yml', upstream: true },
    { path: '.github/ISSUE_TEMPLATE/3-installation-help.yml', theme: true, upstream: true },
    { path: '.github/docker/README.md', theme: true },
    { path: '.github/workflows/upstream-autopilot.yaml', upstream: true },
    { path: 'docker-compose.example.yml', theme: true },
    { path: 'UPSTREAM_AUTOMATION.md', upstream: true },
];

const replacePatternOnce = (contents, pattern, replacement, label) => {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const matches = [...contents.matchAll(new RegExp(pattern.source, flags))];
    if (matches.length !== 1) {
        throw new Error(`Expected exactly one ${label} field, found ${matches.length}.`);
    }

    return contents.replace(pattern, replacement);
};

const replaceVersionReferences = (contents, current, replacement, label) => {
    const matches = contents.split(current).length - 1;
    if (matches < 1) {
        throw new Error(`Expected at least one ${label} reference.`);
    }

    return contents.split(current).join(replacement);
};

const updateUpstreamMetadata = (root, upstreamTag, themeTag) => {
    if (!versionPattern.test(upstreamTag || '') || !versionPattern.test(themeTag || '')) {
        throw new Error('Usage: node scripts/update-upstream-metadata.js v<panel-version> v<theme-version>');
    }

    const upstreamVersionFile = path.join(root, '.rock', 'upstream-version');
    const packageFile = path.join(root, 'package.json');
    const previousUpstreamVersion = fs.readFileSync(upstreamVersionFile, 'utf8').trim().replace(/^v/, '');
    const manifest = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const previousThemeVersion = manifest.version;
    const upstreamVersion = upstreamTag.replace(/^v/, '');
    const themeVersion = themeTag.replace(/^v/, '');
    const upstreamChanged = previousUpstreamVersion !== upstreamVersion;
    const themeChanged = previousThemeVersion !== themeVersion;
    const pendingWrites = new Map();

    if (!versionPattern.test(`v${previousUpstreamVersion}`) || !versionPattern.test(`v${previousThemeVersion}`)) {
        throw new Error('The current panel or Rock Theme version is not valid semantic version metadata.');
    }
    if (!upstreamChanged && !themeChanged) {
        throw new Error('The requested panel and Rock Theme versions are already current.');
    }

    const update = (relativePath, transform) => {
        const filename = path.join(root, relativePath);
        const current = fs.readFileSync(filename, 'utf8');
        const next = transform(current);
        if (next === current) {
            throw new Error(`${relativePath} did not change; its expected version marker may have moved.`);
        }
        pendingWrites.set(filename, next);
    };

    update('config/app.php', (contents) =>
        replacePatternOnce(
            replacePatternOnce(
                contents,
                /('version'\s*=>\s*')[^']+(')/,
                `$1${upstreamVersion}$2`,
                'Pterodactyl version'
            ),
            /('fork-version'\s*=>\s*')[^']+(')/,
            `$1${themeVersion}$2`,
            'Rock Theme version'
        )
    );

    update('package.json', (contents) => {
        const packageManifest = JSON.parse(contents);
        packageManifest.version = themeVersion;
        packageManifest.description = `A responsive Crimson Red and Midnight Blue interface for Pterodactyl Panel ${upstreamVersion}.`;
        return `${JSON.stringify(packageManifest, null, 4)}\n`;
    });

    for (const file of synchronizedVersionFiles) {
        if ((!file.theme || !themeChanged) && (!file.upstream || !upstreamChanged)) continue;

        update(file.path, (contents) => {
            let next = contents;
            if (file.theme && themeChanged) {
                next = replaceVersionReferences(
                    next,
                    previousThemeVersion,
                    themeVersion,
                    `${file.path} Rock Theme version`
                );
            }
            if (file.upstream && upstreamChanged) {
                next = replaceVersionReferences(
                    next,
                    previousUpstreamVersion,
                    upstreamVersion,
                    `${file.path} Pterodactyl version`
                );
            }
            return next;
        });
    }

    if (upstreamChanged) pendingWrites.set(upstreamVersionFile, `${upstreamTag}\n`);
    for (const [filename, contents] of pendingWrites) fs.writeFileSync(filename, contents);

    return { upstreamTag, themeTag };
};

const main = () => {
    const [, , upstreamTag, themeTag] = process.argv;
    try {
        const result = updateUpstreamMetadata(path.resolve(__dirname, '..'), upstreamTag, themeTag);
        console.log(`Prepared Rock Theme ${result.themeTag} for Pterodactyl ${result.upstreamTag}.`);
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
};

if (require.main === module) main();

module.exports = { synchronizedVersionFiles, updateUpstreamMetadata };
