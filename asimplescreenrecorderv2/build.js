import * as esbuild from 'esbuild';
import fs from 'fs';

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy static files
const staticFiles = [
    'manifest.json',
    'options.html',
    'popup.html',
    'popup.js', // If we don't bundle popup.js
    'icons'
];

staticFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.cpSync(file, `dist/${file}`, { recursive: true });
    }
});

// Bundle options.js (entry point for auth/logic)
await esbuild.build({
    entryPoints: ['src/options.js'],
    bundle: true,
    outfile: 'dist/options.js',
    format: 'esm', // or 'iife' if we want to include it directly in script tag without type=module
    target: ['chrome100'],
    platform: 'browser',
});

// Copy bundled options.js to root so it works if user loads root folder
fs.copyFileSync('dist/options.js', 'options.js');

console.log('Build complete');
