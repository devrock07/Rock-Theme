#!/usr/bin/env node

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const [, , sourceArgument, destinationArgument] = process.argv;
if (!sourceArgument || !destinationArgument) {
    console.error('Usage: node scripts/copy-compiled-assets.js <source> <destination>');
    process.exit(2);
}

const allowedExtensions = new Set([
    '.avif',
    '.css',
    '.gif',
    '.jpeg',
    '.jpg',
    '.js',
    '.png',
    '.svg',
    '.ttf',
    '.wasm',
    '.webp',
    '.woff',
    '.woff2',
]);
const integrityRequiredExtensions = new Set(['.css', '.js']);
const sourceInput = path.resolve(sourceArgument);
const destinationInput = path.resolve(destinationArgument);

const isWithin = (root, candidate) => {
    const relative = path.relative(root, candidate);
    return (
        relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`))
    );
};

const sourceInputStat = fs.lstatSync(sourceInput);
if (!sourceInputStat.isDirectory() || sourceInputStat.isSymbolicLink()) {
    throw new Error('The compiled asset source must be a real directory, not a symbolic link.');
}
const sourceRoot = fs.realpathSync(sourceInput);

const inspectSourceFile = (relative, label) => {
    let current = sourceRoot;
    const segments = relative.split('/');

    for (const [index, segment] of segments.entries()) {
        current = path.join(current, segment);
        const stat = fs.lstatSync(current);
        if (stat.isSymbolicLink()) {
            throw new Error(`${label} traverses a symbolic link: ${relative}`);
        }
        if (index < segments.length - 1 && !stat.isDirectory()) {
            throw new Error(`${label} has a non-directory path component: ${relative}`);
        }
        if (index === segments.length - 1 && !stat.isFile()) {
            throw new Error(`${label} is not a regular file: ${relative}`);
        }
    }

    const stat = fs.lstatSync(current);
    if (stat.nlink !== 1) {
        throw new Error(`${label} must not be hard-linked: ${relative}`);
    }

    const resolved = fs.realpathSync(current);
    if (!isWithin(sourceRoot, resolved)) {
        throw new Error(`${label} resolves outside the compiled asset source: ${relative}`);
    }

    return { file: current, resolved, stat };
};

const readSourceFile = (relative, label) => {
    const inspected = inspectSourceFile(relative, label);
    const noFollow = process.platform === 'win32' ? 0 : fs.constants.O_NOFOLLOW || 0;
    const descriptor = fs.openSync(inspected.file, fs.constants.O_RDONLY | noFollow);

    try {
        const openedStat = fs.fstatSync(descriptor);
        if (
            !openedStat.isFile() ||
            openedStat.nlink !== 1 ||
            openedStat.dev !== inspected.stat.dev ||
            openedStat.ino !== inspected.stat.ino
        ) {
            throw new Error(`${label} changed while it was being validated: ${relative}`);
        }

        const resolved = fs.realpathSync(inspected.file);
        if (!isWithin(sourceRoot, resolved) || resolved !== inspected.resolved) {
            throw new Error(`${label} changed location while it was being validated: ${relative}`);
        }

        return fs.readFileSync(descriptor);
    } finally {
        fs.closeSync(descriptor);
    }
};

const manifestBuffer = readSourceFile('manifest.json', 'Compiled asset manifest');
const manifest = JSON.parse(manifestBuffer.toString('utf8'));
if (!manifest || Array.isArray(manifest) || typeof manifest !== 'object') {
    throw new Error('The compiled asset manifest must be a JSON object.');
}

const assets = new Map();
for (const entry of Object.values(manifest)) {
    if (!entry || Array.isArray(entry) || typeof entry !== 'object' || typeof entry.src !== 'string') {
        throw new Error('The compiled asset manifest contains an invalid entry.');
    }

    const prefix = '/assets/';
    if (!entry.src.startsWith(prefix)) {
        throw new Error(`Compiled asset path is outside /assets: ${entry.src}`);
    }

    const relative = entry.src.slice(prefix.length);
    const extension = path.posix.extname(relative).toLowerCase();
    if (
        !relative ||
        relative.includes('\\') ||
        /[%?#\u0000-\u001f\u007f]/u.test(relative) ||
        path.posix.isAbsolute(relative) ||
        path.posix.normalize(relative) !== relative ||
        relative.split('/').some((segment) => !segment || segment === '.' || segment === '..') ||
        !allowedExtensions.has(extension)
    ) {
        throw new Error(`Unsafe compiled asset path: ${entry.src}`);
    }

    const integrity = entry.integrity == null ? '' : entry.integrity;
    if (typeof integrity !== 'string') {
        throw new Error(`Compiled asset integrity is invalid: ${entry.src}`);
    }
    if (integrityRequiredExtensions.has(extension) && !integrity) {
        throw new Error(`Compiled ${extension} asset is missing SHA-384 integrity: ${entry.src}`);
    }
    if (integrity && !/^sha384-[A-Za-z0-9+/]{64}$/.test(integrity)) {
        throw new Error(`Compiled asset integrity must be a single SHA-384 digest: ${entry.src}`);
    }

    const existing = assets.get(relative);
    if (existing && integrity && existing.integrity && integrity !== existing.integrity) {
        throw new Error(`Compiled asset has conflicting integrity values: ${entry.src}`);
    }
    assets.set(relative, { extension, integrity: integrity || (existing && existing.integrity) || '' });
}

if (fs.existsSync(destinationInput)) {
    const destinationStat = fs.lstatSync(destinationInput);
    if (!destinationStat.isDirectory() || destinationStat.isSymbolicLink()) {
        throw new Error('The compiled asset destination must be a real directory, not a symbolic link.');
    }
} else {
    fs.mkdirSync(destinationInput, { mode: 0o755, recursive: true });
}

const destinationRoot = fs.realpathSync(destinationInput);
if (isWithin(sourceRoot, destinationRoot) || isWithin(destinationRoot, sourceRoot)) {
    throw new Error('Compiled asset source and destination directories must not contain one another.');
}

const ensureDestinationDirectory = (relativeDirectory) => {
    let current = destinationRoot;
    if (!relativeDirectory || relativeDirectory === '.') {
        return current;
    }

    for (const segment of relativeDirectory.split('/')) {
        current = path.join(current, segment);
        if (fs.existsSync(current)) {
            const stat = fs.lstatSync(current);
            if (!stat.isDirectory() || stat.isSymbolicLink()) {
                throw new Error(`Compiled asset destination traverses an unsafe path: ${relativeDirectory}`);
            }
        } else {
            fs.mkdirSync(current, { mode: 0o755 });
        }

        if (!isWithin(destinationRoot, fs.realpathSync(current))) {
            throw new Error(`Compiled asset destination resolves outside its root: ${relativeDirectory}`);
        }
    }

    return current;
};

const writeDestinationFile = (relative, contents) => {
    const directory = ensureDestinationDirectory(path.posix.dirname(relative));
    const destination = path.join(directory, path.posix.basename(relative));
    if (fs.existsSync(destination)) {
        const existing = fs.lstatSync(destination);
        if (!existing.isFile() || existing.isSymbolicLink() || existing.nlink !== 1) {
            throw new Error(`Compiled asset destination is not a safe regular file: ${relative}`);
        }
    }

    const temporary = path.join(
        directory,
        `.${path.posix.basename(relative)}.tmp-${process.pid}-${crypto.randomBytes(8).toString('hex')}`
    );
    const descriptor = fs.openSync(temporary, 'wx', 0o644);
    try {
        fs.writeFileSync(descriptor, contents);
        fs.fsyncSync(descriptor);
    } finally {
        fs.closeSync(descriptor);
    }
    try {
        try {
            fs.renameSync(temporary, destination);
        } catch (error) {
            if (process.platform !== 'win32' || !fs.existsSync(destination)) {
                throw error;
            }
            const existing = fs.lstatSync(destination);
            if (!existing.isFile() || existing.isSymbolicLink() || existing.nlink !== 1) {
                throw new Error(`Compiled asset destination changed before replacement: ${relative}`);
            }
            fs.unlinkSync(destination);
            fs.renameSync(temporary, destination);
        }
    } finally {
        if (fs.existsSync(temporary)) {
            fs.unlinkSync(temporary);
        }
    }
};

for (const [relative, metadata] of [...assets.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const contents = readSourceFile(relative, 'Compiled asset');
    if (metadata.integrity) {
        const actual = `sha384-${crypto.createHash('sha384').update(contents).digest('base64')}`;
        if (actual !== metadata.integrity) {
            throw new Error(`Compiled asset SHA-384 integrity does not match its manifest entry: ${relative}`);
        }
    }
    writeDestinationFile(relative, contents);
}
writeDestinationFile('manifest.json', manifestBuffer);

console.log(`Validated ${assets.size} manifest-declared compiled assets.`);
