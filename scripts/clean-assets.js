'use strict';

const fs = require('fs');
const path = require('path');

const assetsRoot = path.resolve(__dirname, '..', 'public', 'assets');
const removableExtensions = new Set(['.js', '.map', '.json']);

const cleanDirectory = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            cleanDirectory(target);
        } else if (entry.isFile() && removableExtensions.has(path.extname(entry.name))) {
            fs.unlinkSync(target);
        }
    }
};

if (fs.existsSync(assetsRoot)) {
    cleanDirectory(assetsRoot);
}
