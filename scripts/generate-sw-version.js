// scripts/generate-sw-version.js
const fs = require('fs');
const path = require('path');

const version = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 12);
fs.writeFileSync(path.resolve(__dirname, '../src/swVersion.js'), `export const SW_VERSION = 'v${version}';\n`);
fs.writeFileSync(path.resolve(__dirname, '../src/cacheVersion.js'), `export const CACHE_VERSION = 'v${version}';\n`);
console.log(`Generated version files: v${version}`);
