import { createRequire } from 'node:module';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playwrightPath = process.env.PW_PATH;
if (!playwrightPath) throw new Error('Set PW_PATH to the local Playwright package directory.');
const { chromium } = require(playwrightPath);

const root = path.resolve(import.meta.dirname, '..');
const baseUrl = process.env.APP_URL || 'http://127.0.0.1:4173';
const outputPath = path.resolve(root, 'output', 'playwright', process.env.OUTPUT_NAME || 'live-app.png');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};
const server = process.env.APP_URL ? null : http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, baseUrl).pathname);
  const requested = path.resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
  if (!requested.startsWith(root) || !fs.existsSync(requested) || fs.statSync(requested).isDirectory()) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(requested)] || 'application/octet-stream' });
  fs.createReadStream(requested).pipe(response);
});
if (server) await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5 });
const errors = [];

page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(9000);
await page.screenshot({ path: outputPath, fullPage: true });

console.log(JSON.stringify({
  url: page.url(),
  title: await page.title(),
  text: (await page.locator('body').innerText()).slice(0, 600),
  errors,
  screenshot: outputPath,
}, null, 2));

await browser.close();
if (server) await new Promise(resolve => server.close(resolve));
