const fs = require('fs');
const path = require('path');

const version = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 12);

// React에서 import하는 버전
fs.writeFileSync(path.resolve(__dirname, '../src/swVersion.js'), `export const SW_VERSION = '${version}';\n`);
fs.writeFileSync(path.resolve(__dirname, '../src/cacheVersion.js'), `export const CACHE_VERSION = '${version}';\n`);

// 템플릿 -> 버전 파일로 치환
const templatePath = path.resolve(__dirname, '../public/service-worker.template.js');
const targetPath = path.resolve(__dirname, `../public/service-worker.${version}.js`);

let content = fs.readFileSync(templatePath, 'utf8');
content = content.replace(/__REPLACE_CACHE_VERSION__/g, version);

fs.writeFileSync(targetPath, content);

// console.log(`Generated service worker: service-worker.${version}.js`);
