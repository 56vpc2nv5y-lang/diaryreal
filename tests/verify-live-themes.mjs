import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const playwrightPath = process.env.PW_PATH;
if (!playwrightPath) throw new Error('Set PW_PATH to the local Playwright package directory.');
const { chromium } = require(playwrightPath);

const themes = ['celadon', 'inkPlum', 'mossGarden', 'study', 'dusk', 'morningPaper', 'seaSalt', 'obsidianDawn', 'snowNight'];
const outDir = path.resolve(import.meta.dirname, '..', 'output', 'playwright', 'live-r42');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];

for (const theme of themes) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  await context.addInitScript(selectedTheme => {
    localStorage.setItem('diary-theme', selectedTheme);
  }, theme);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(`${theme}: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`${theme}: ${message.text()}`);
  });
  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: path.join(outDir, `${theme}.png`) });
  await context.close();
}

await browser.close();
console.log(`screenshots=${outDir}`);
console.log(`errors=${errors.length}`);
errors.slice(0, 20).forEach(error => console.log(error));
