#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const [, , upstreamTag, themeTag] = process.argv;
const versionPattern = /^v(\d+)\.(\d+)\.(\d+)$/;

if (!versionPattern.test(upstreamTag || '') || !versionPattern.test(themeTag || '')) {
    console.error('Usage: node scripts/update-upstream-metadata.js v<panel-version> v<theme-version>');
    process.exit(1);
}

const root = path.resolve(__dirname, '..');
const upstreamVersionFile = path.join(root, '.rock', 'upstream-version');
const previousUpstreamTag = fs.readFileSync(upstreamVersionFile, 'utf8').trim();
const previousUpstreamVersion = previousUpstreamTag.replace(/^v/, '');
const upstreamVersion = upstreamTag.replace(/^v/, '');
const themeVersion = themeTag.replace(/^v/, '');

const update = (relativePath, transform) => {
    const filename = path.join(root, relativePath);
    const current = fs.readFileSync(filename, 'utf8');
    const next = transform(current);
    if (next === current) return;
    fs.writeFileSync(filename, next);
};

update('config/app.php', (contents) =>
    contents
        .replace(/('version'\s*=>\s*')[^']+(')/, `$1${upstreamVersion}$2`)
        .replace(/('fork-version'\s*=>\s*')[^']+(')/, `$1${themeVersion}$2`)
);

update('package.json', (contents) => {
    const manifest = JSON.parse(contents);
    manifest.version = themeVersion;
    manifest.description = `A responsive crimson interface for Pterodactyl Panel ${upstreamVersion}.`;
    return `${JSON.stringify(manifest, null, 4)}\n`;
});

update('README.md', (contents) => contents.replaceAll(previousUpstreamVersion, upstreamVersion));
fs.writeFileSync(upstreamVersionFile, `${upstreamTag}\n`);

console.log(`Prepared Rock Theme ${themeTag} for Pterodactyl ${upstreamTag}.`);
