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
const pendingWrites = new Map();

const replacePatternOnce = (contents, pattern, replacement, label) => {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const matches = [...contents.matchAll(new RegExp(pattern.source, flags))];
    if (matches.length !== 1) {
        throw new Error(`Expected exactly one ${label} field, found ${matches.length}.`);
    }

    return contents.replace(pattern, replacement);
};

const replaceLiteralOnce = (contents, current, replacement, label) => {
    const first = contents.indexOf(current);
    const second = first === -1 ? -1 : contents.indexOf(current, first + current.length);
    if (first === -1 || second !== -1) {
        throw new Error(`Expected exactly one ${label} line.`);
    }

    return `${contents.slice(0, first)}${replacement}${contents.slice(first + current.length)}`;
};

const update = (relativePath, transform) => {
    const filename = path.join(root, relativePath);
    const current = fs.readFileSync(filename, 'utf8');
    const next = transform(current);
    if (next === current)
        throw new Error(`${relativePath} did not change; its expected version marker may have moved.`);
    pendingWrites.set(filename, next);
};

update('config/app.php', (contents) =>
    replacePatternOnce(
        replacePatternOnce(contents, /('version'\s*=>\s*')[^']+(')/, `$1${upstreamVersion}$2`, 'Pterodactyl version'),
        /('fork-version'\s*=>\s*')[^']+(')/,
        `$1${themeVersion}$2`,
        'Rock Theme version'
    )
);

update('package.json', (contents) => {
    const manifest = JSON.parse(contents);
    manifest.version = themeVersion;
    manifest.description = `A responsive crimson interface for Pterodactyl Panel ${upstreamVersion}.`;
    return `${JSON.stringify(manifest, null, 4)}\n`;
});

update('README.md', (contents) => {
    const replacements = [
        [
            `Built by [DevRock](https://github.com/devrock07) for Pterodactyl \`${previousUpstreamVersion}\`.`,
            `Built by [DevRock](https://github.com/devrock07) for Pterodactyl \`${upstreamVersion}\`.`,
            'README compatibility summary',
        ],
        [
            `| Pterodactyl Panel | \`${previousUpstreamVersion}\`          |`,
            `| Pterodactyl Panel | \`${upstreamVersion}\`          |`,
            'README requirements row',
        ],
        [
            `Please reproduce theme issues on Pterodactyl \`${previousUpstreamVersion}\` and include the browser,`,
            `Please reproduce theme issues on Pterodactyl \`${upstreamVersion}\` and include the browser,`,
            'README issue template line',
        ],
    ];

    return replacements.reduce(
        (next, [current, replacement, label]) => replaceLiteralOnce(next, current, replacement, label),
        contents
    );
});
update('UPSTREAM_AUTOMATION.md', (contents) =>
    replaceLiteralOnce(
        contents,
        `\`${previousUpstreamTag}\` for a controlled retry.`,
        `\`${upstreamTag}\` for a controlled retry.`,
        'upstream automation example'
    )
);

pendingWrites.set(upstreamVersionFile, `${upstreamTag}\n`);
for (const [filename, contents] of pendingWrites) fs.writeFileSync(filename, contents);

console.log(`Prepared Rock Theme ${themeTag} for Pterodactyl ${upstreamTag}.`);
