import { spawnSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

const script = path.resolve(__dirname, '..', 'scripts', 'copy-compiled-assets.js');
const sri = (contents: Buffer | string): string =>
    `sha384-${crypto.createHash('sha384').update(contents).digest('base64')}`;

describe('copy-compiled-assets', () => {
    let workspace: string;
    let source: string;
    let destination: string;

    beforeEach(() => {
        workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'rock-theme-assets-'));
        source = path.join(workspace, 'source');
        destination = path.join(workspace, 'destination');
        fs.mkdirSync(source);
        fs.mkdirSync(destination);
    });

    afterEach(() => {
        fs.rmSync(workspace, { force: true, recursive: true });
    });

    const run = () =>
        spawnSync(process.execPath, [script, source, destination], {
            encoding: 'utf8',
        });

    const manifest = (value: Record<string, unknown>) => {
        fs.writeFileSync(path.join(source, 'manifest.json'), `${JSON.stringify(value)}\n`);
    };

    it('copies validated assets and atomically replaces existing regular outputs', () => {
        const javascript = 'console.log("rock");\n';
        const font = Buffer.from('font-data');
        fs.mkdirSync(path.join(source, 'chunks'));
        fs.writeFileSync(path.join(source, 'chunks', 'app.js'), javascript);
        fs.writeFileSync(path.join(source, 'font.woff2'), font);
        fs.writeFileSync(path.join(destination, 'manifest.json'), '{}\n');
        fs.mkdirSync(path.join(destination, 'chunks'));
        fs.writeFileSync(path.join(destination, 'chunks', 'app.js'), 'old\n');
        manifest({
            'app.js': { integrity: sri(javascript), src: '/assets/chunks/app.js' },
            'font.woff2': { integrity: '', src: '/assets/font.woff2' },
        });

        const result = run();

        expect(result.status).toBe(0);
        expect(fs.readFileSync(path.join(destination, 'chunks', 'app.js'), 'utf8')).toBe(javascript);
        expect(fs.readFileSync(path.join(destination, 'font.woff2'))).toEqual(font);
        expect(fs.readFileSync(path.join(destination, 'manifest.json'), 'utf8')).toContain('/assets/chunks/app.js');
        expect(fs.readdirSync(path.join(destination, 'chunks')).some((entry) => entry.includes('.tmp-'))).toBe(false);
    });

    it('rejects executable assets without valid matching SHA-384 integrity', () => {
        fs.writeFileSync(path.join(source, 'app.js'), 'console.log("rock");\n');
        manifest({ 'app.js': { integrity: '', src: '/assets/app.js' } });

        const missing = run();
        expect(missing.status).not.toBe(0);
        expect(missing.stderr).toContain('missing SHA-384 integrity');

        manifest({ 'app.js': { integrity: sri('different'), src: '/assets/app.js' } });
        const mismatched = run();
        expect(mismatched.status).not.toBe(0);
        expect(mismatched.stderr).toContain('integrity does not match');
    });

    it('rejects URL-encoded and reserved asset paths', () => {
        fs.writeFileSync(path.join(source, 'encoded%2fasset.js'), 'safe');
        manifest({
            'app.js': { integrity: sri('safe'), src: '/assets/encoded%2fasset.js' },
        });

        const result = run();

        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('Unsafe compiled asset path');
    });

    it('rejects source paths that traverse an intermediate symbolic link', () => {
        const outside = path.join(workspace, 'outside');
        fs.mkdirSync(outside);
        const javascript = 'console.log("outside");\n';
        fs.writeFileSync(path.join(outside, 'app.js'), javascript);
        fs.symlinkSync(outside, path.join(source, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
        manifest({
            'app.js': { integrity: sri(javascript), src: '/assets/linked/app.js' },
        });

        const result = run();

        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('traverses a symbolic link');
    });

    it('rejects hard-linked source assets', () => {
        const outside = path.join(workspace, 'outside.js');
        const javascript = 'console.log("hard-link");\n';
        fs.writeFileSync(outside, javascript);
        fs.linkSync(outside, path.join(source, 'app.js'));
        manifest({
            'app.js': { integrity: sri(javascript), src: '/assets/app.js' },
        });

        const result = run();

        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('must not be hard-linked');
    });

    it('rejects symbolic-link destinations', () => {
        fs.rmSync(destination, { recursive: true });
        const outside = path.join(workspace, 'outside-destination');
        fs.mkdirSync(outside);
        fs.symlinkSync(outside, destination, process.platform === 'win32' ? 'junction' : 'dir');
        const javascript = 'console.log("rock");\n';
        fs.writeFileSync(path.join(source, 'app.js'), javascript);
        manifest({
            'app.js': { integrity: sri(javascript), src: '/assets/app.js' },
        });

        const result = run();

        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('destination must be a real directory');
    });
});
