import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const playwrightPath = process.env.PW_PATH;
if (!playwrightPath) throw new Error('Set PW_PATH to the local Playwright package directory.');
const { chromium } = require(playwrightPath);

const root = path.resolve(import.meta.dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'themes-extra.js'), 'utf8'), sandbox);

const allKeys = ['celadon', 'inkPlum', 'mossGarden', 'study', 'dusk', 'morningPaper', 'seaSalt', 'obsidianDawn', 'snowNight'];
const keys = (process.env.THEME_KEYS || allKeys.join(',')).split(',').filter(Boolean);
const columns = Number(process.env.THEME_COLUMNS || Math.min(3, keys.length));
const inlineAssetUrls = value => typeof value === 'string'
  ? value.replaceAll(/url\("([^"]+)"\)/g, (match, assetPath) => {
      if (!assetPath.startsWith('assets/')) return match;
      const file = path.join(root, assetPath);
      const mime = path.extname(file) === '.webp' ? 'image/webp' : 'image/png';
      return `url("data:${mime};base64,${fs.readFileSync(file).toString('base64')}")`;
    })
  : value;
keys.forEach(key => {
  const skin = sandbox.window.THEMES[key]?.skin;
  if (!skin) return;
  Object.values(skin).forEach(section => {
    Object.entries(section || {}).forEach(([property, value]) => {
      section[property] = inlineAssetUrls(value);
    });
  });
});
const sourceStyles = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map(match => match[1])
  .join('\n');
const cssText = sourceStyles
  .replaceAll(/html\[data-diary-theme="([^"]+)"\]/g, '.theme-screen-$1')
  .replaceAll('html[data-diary-theme]', '.phone');
const cssName = key => key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
const styleToCss = style => Object.entries(style || {}).map(([key, value]) => `${cssName(key)}:${value}`).join(';');
const themeVars = skin => [
  ['--theme-screen-image', skin.screen?.backgroundImage || 'none'],
  ['--theme-screen-position', skin.screen?.backgroundPosition || 'center'],
  ['--theme-screen-size', skin.screen?.backgroundSize || 'auto'],
  ['--theme-screen-repeat', skin.screen?.backgroundRepeat || 'repeat'],
  ['--theme-poem-image', skin.poemCard?.backgroundImage || 'none'],
  ['--theme-poem-position', skin.poemCard?.backgroundPosition || 'center'],
  ['--theme-poem-size', skin.poemCard?.backgroundSize || 'auto'],
  ['--theme-poem-repeat', skin.poemCard?.backgroundRepeat || 'repeat'],
  ['--theme-panel-image', skin.panel?.backgroundImage || 'none'],
  ['--theme-panel-position', skin.panel?.backgroundPosition || 'center'],
  ['--theme-panel-size', skin.panel?.backgroundSize || 'auto'],
  ['--theme-panel-repeat', skin.panel?.backgroundRepeat || 'repeat'],
].map(([key, value]) => `${key}:${value}`).join(';');

const decor = key => `
  <div class="theme-decor theme-decor-${key}">
    <svg class="theme-decor-svg decor-celadon" viewBox="0 0 390 844"><path d="M286 30c44 16 72 50 85 99M303 29c-22 37-24 78-5 119M326 43c-8 28-5 57 11 85M13 680c35-24 67-21 96 7s61 31 95 3 69-28 109 1 57 23 79 8"/><circle cx="334" cy="96" r="34"/><circle cx="334" cy="96" r="24"/></svg>
    <svg class="theme-decor-svg decor-inkPlum" viewBox="0 0 390 844"><path d="M405 72c-86 7-119 47-165 90-41 38-90 45-151 75M312 113c-6 42-31 73-67 98M245 160c-35-11-71-7-108 13M362 88c-7 22-2 43 14 63"/><g><circle cx="238" cy="164" r="4"/><circle cx="245" cy="161" r="4"/><circle cx="244" cy="169" r="4"/><circle cx="236" cy="171" r="4"/><circle cx="134" cy="173" r="3.5"/><circle cx="141" cy="170" r="3.5"/><circle cx="140" cy="177" r="3.5"/><circle cx="133" cy="180" r="3.5"/></g></svg>
    <svg class="theme-decor-svg decor-mossGarden" viewBox="0 0 390 844"><path d="M350 17c-10 70-5 144 21 226M311 31c10 76 23 132 52 191M358 74l-49-26m55 58 33-34m-28 70-52-20m59 56 30-25M-24 723c49-45 103-48 153-17s91 31 138 1 92-29 149 4"/></svg>
    <svg class="theme-decor-svg decor-study" viewBox="0 0 390 844"><path d="M42 72h85M42 80h65M42 88h76M267 734h79M280 742h66M310 39v81M290 61h40M299 61c0-17 22-17 22 0v31c0 12-22 12-22 0zM15 663c64 12 115 12 175 0s119-12 185 0"/></svg>
    <svg class="theme-decor-svg decor-dusk" viewBox="0 0 390 844"><path d="M-21 159c58-32 112-27 162 5s102 38 168 7 100-29 126-9M-40 183c60-28 115-20 164 10s103 34 169 4 103-25 139-5M302 54a46 46 0 1 0 38 74 39 39 0 1 1-38-74z"/><circle cx="72" cy="116" r="2"/><circle cx="111" cy="87" r="1.4"/></svg>
    <svg class="theme-decor-svg decor-morningPaper" viewBox="0 0 390 844"><path d="M20 52h350M20 57h350M20 182h350M20 187h350M20 681h350M20 686h350M48 82h128M48 91h92M48 100h108M218 82h126M218 91h102M218 100h116M56 713h278M56 721h278M56 729h278"/></svg>
    <svg class="theme-decor-svg decor-seaSalt" viewBox="0 0 390 844"><path d="M-28 670c77-43 139 28 216-4s135 20 230-8M-30 695c78-38 139 24 216-3s137 17 232-7M-31 718c78-32 143 21 220-2s137 15 231-5M291 94c12-12 24-12 36 0 12-12 24-12 36 0M29 207c9-9 18-9 27 0 9-9 18-9 27 0"/></svg>
    <svg class="theme-decor-svg decor-obsidianDawn" viewBox="0 0 390 844"><circle cx="322" cy="104" r="34"/><circle cx="322" cy="104" r="21"/><path d="M322 54V34M322 174v-20M272 104h-20M392 104h-20M26 715h338M26 724h338"/></svg>
    <svg class="theme-decor-svg decor-snowNight" viewBox="0 0 390 844"><circle cx="318" cy="105" r="48"/><circle cx="337" cy="88" r="48"/><path d="M72 161v54m-24-41 48 28m-48 0 48-28M310 271v38m-17-29 34 20m-34 0 34-20M-15 690c75-38 132 20 207-5s135 16 214-8M-18 718c78-31 138 17 212-4s135 13 215-7"/></svg>
    <span class="theme-decor-mark mark-a"></span><span class="theme-decor-mark mark-b"></span><span class="theme-decor-mark mark-c"></span>
  </div>`;

const cardArt = (key, kind = 'poem') => `<div class="theme-card-art theme-card-art-${key} theme-card-art-${kind}">
  <svg viewBox="0 0 360 240" preserveAspectRatio="none">
    <path class="art-line art-line-a" d="M-12 205c69-34 121 25 191-3s124 21 196-5"/><path class="art-line art-line-b" d="M-15 220c70-29 126 21 196-3s124 17 194-4"/>
    <path class="art-branch" d="M372 21c-68 5-91 38-129 68-34 27-71 32-118 56M285 61c-4 31-20 52-45 70M239 92c-24-8-47-5-72 7"/>
    <path class="art-leaf-stem" d="M361 238c-22-69-46-116-96-177M321 173l-43-9m58 38 27-34m-70-29-4-38m-4 59-42-17"/>
    <path class="art-book" d="M34 32h95v62H34zM47 46h67M47 58h54M47 70h61M129 32l15-12v62l-15 12"/>
    <path class="art-rays" d="M302 54v-25m0 108v-25m-54-29h25m58 0h25m-92-38 18 18m40 40 18 18m0-76-18 18m-40 40-18 18"/>
    <circle class="art-sun" cx="302" cy="83" r="22"/><circle class="art-sun" cx="302" cy="83" r="13"/><path class="art-moon" d="M303 38a42 42 0 1 0 36 64 35 35 0 1 1-36-64z"/>
    <path class="art-snow" d="M82 33v45M62 44l40 23M62 67l40-23"/><g class="art-blossoms"><circle cx="239" cy="92" r="4"/><circle cx="247" cy="89" r="4"/><circle cx="246" cy="97" r="4"/><circle cx="238" cy="99" r="4"/></g>
  </svg></div>`;

const phone = key => {
  const theme = sandbox.window.THEMES[key];
  const skin = theme.skin;
  return `<section class="slot"><div class="phone theme-screen-${key}" style='background:${theme.bg};color:${theme.text};${styleToCss(skin.screen)};${themeVars(skin)}'>
    ${decor(key)}
    <main>
      <header class="theme-home-header"><div class="theme-home-heading"><div class="date theme-home-date">2026.06.14　周日　·　21:20 <span class="theme-home-weather">☼</span></div><div class="place theme-home-place">⌖ 越秀区 · 北京街道</div><div class="today theme-home-title">今日</div></div><div class="theme-home-actions"><div class="theme-header-mark theme-header-mark-${key}"><span>${theme.name}</span><small>${theme.description}</small></div><button class="theme-search-button"><span class="theme-journal-label">日记</span></button></div></header>
      <article class="poem theme-poem-card" style="background:${theme.paper};border-color:${theme.line};${styleToCss(skin.poemCard)}">
        ${cardArt(key)}
        <div class="theme-poem-topline"><div class="poem-tag theme-poem-tag">今 日 之 诗 · 七绝</div><div class="theme-poem-seal"><div class="seal theme-seal">诗<br>签</div></div></div>
        <h2 class="theme-poem-title">自 嘲</h2><i class="theme-poem-rule" style="background:${theme.accent}"></i>
        <div class="theme-poem-body"><div class="serif"><div>困眼敲屏意自闲，</div><div>忽闻叛者得恩纶。</div><div>南滨落魄如蕉弱，</div><div>万卷投书难择邻。</div><div>曾恨南洋成错路，</div><div>却因彼处遇机缘。</div><div>轻舟已过千重嶂，</div><div>笑看机缘巧作缘。</div></div></div>
        <small class="theme-poem-meta">越秀区 · 北京街道　15:49</small>
      </article>
      <div class="theme-home-quote"><article class="quote theme-quote-card" style="background:${theme.surface};border-color:${theme.line};${styleToCss(skin.panel)}">${cardArt(key, 'quote')}<b class="theme-home-quote-title">${['morningPaper','seaSalt','obsidianDawn','snowNight'].includes(key) ? 'AI 拾句' : '拾句'}</b><p class="theme-home-quote-text">“重要的是成为伟大，而不是显得伟大。”</p><em class="theme-home-quote-arrow">›</em></article></div>
    </main>
    <nav class="app-tabbar theme-tabbar-${key}" style="${styleToCss(skin.nav)}"><span class="app-tab-item" style="${styleToCss(skin.tabActive)}">⌂<small>今日</small></span><span class="app-tab-item">▢<small>藏册</small></span><strong class="app-tab-item app-tab-primary" style="${styleToCss(skin.primary)}">签</strong><span class="app-tab-item">◌<small>问</small></span><span class="app-tab-item">♙<small>我</small></span></nav>
  </div><h3>${theme.name}</h3></section>`;
};

const html = `<!doctype html><meta charset="utf-8"><base href="${pathToFileURL(`${root}${path.sep}`).href}"><style>${cssText}
body{margin:0;background:#e9e4dc;font-family:"Noto Serif SC","Songti SC",serif}.grid{display:grid;grid-template-columns:repeat(${columns},254px);gap:20px;padding:24px}.slot{width:254px;height:584px;position:relative}.phone{width:390px;height:844px;position:relative;overflow:hidden;transform:scale(.65);transform-origin:top left}.phone main{position:relative;z-index:3}.phone header{display:flex;justify-content:space-between;align-items:flex-start}.date{font-size:10px;opacity:.66}.place{font-size:9px;opacity:.55;margin-top:5px}.today{font-size:30px;font-weight:600}.theme-search-button{border:1px solid currentColor;background:transparent}.poem,.quote{position:relative;overflow:hidden;border:1px solid}.poem h2{text-align:center;margin:0}.poem i{display:block}.poem .theme-poem-body .serif{width:100%;text-align:center}.poem small{display:block;text-align:center;opacity:.58}.poem-tag{font-size:9px;letter-spacing:2px;opacity:.6}.seal{display:flex;align-items:center;justify-content:center;text-align:center}.quote{margin-top:14px}.quote em{position:absolute;font-style:normal;opacity:.6}.app-tabbar{position:absolute;z-index:4;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-around}.app-tab-item{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:15px}.app-tab-item small{font-size:9px;margin-top:2px}.app-tab-primary{display:grid;place-items:center;color:white;font-size:22px}h3{position:absolute;bottom:0;width:100%;text-align:center;font-size:13px;font-weight:500;margin:0}</style><div class="grid">${keys.map(phone).join('')}</div>`;

const outDir = path.join(root, 'output', 'playwright');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const rows = Math.ceil(keys.length / columns);
const page = await browser.newPage({
  viewport: { width: Math.max(840, columns * 274 + 48), height: Math.max(700, rows * 604 + 48) },
  deviceScaleFactor: 1.5,
});
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: path.join(outDir, process.env.OUTPUT_NAME || 'r44-themes-contact-sheet.png'), fullPage: true });
await browser.close();
