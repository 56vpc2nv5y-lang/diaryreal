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

const keys = ['celadon', 'inkPlum', 'mossGarden', 'study', 'morningPaper', 'obsidianDawn', 'dusk', 'seaSalt', 'snowNight'];
const groups = [['清 雅', keys.slice(0, 3)], ['温 暖', keys.slice(3, 6)], ['轻 盈', keys.slice(6)]];
const cssName = key => key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
const styleToCss = style => Object.entries(style || {}).map(([key, value]) => `${cssName(key)}:${value}`).join(';');
const styles = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map(match => match[1]).join('\n');

const preview = key => {
  const theme = sandbox.window.THEMES[key];
  const skin = theme.skin;
  return `<button class="preview-button">
    <div class="theme-card-preview theme-preview-${key}" style="${styleToCss(skin.preview)};background-color:${theme.paper};border:1px solid ${theme.line}">
      <div class="preview-top"><span><i style="background:${theme.accent}"></i><i style="background:${theme.paper}"></i><i style="background:${theme.seal}"></i></span><small>今日</small></div>
      <div class="theme-poem-card theme-preview-poem-card" style="${styleToCss(skin.poemCard)}"><b style="font-family:${theme.fontSerif};color:${theme.text}">诗</b><i style="background:${theme.accent}"></i><em style="border-color:${theme.line}"></em></div>
      <div class="preview-nav" style="${styleToCss(skin.nav)}"><i></i><i></i><strong style="${styleToCss(skin.primary)}"></strong><i></i><i></i></div>
    </div><span style="color:${theme.text}">${theme.name}</span>
  </button>`;
};

const settingPanel = (title, rows) => `<section class="settings-section"><h3>${title}</h3><div class="theme-settings-panel">${rows.map(row => `<p>${row}<span>›</span></p>`).join('')}</div></section>`;
const themeGroups = groups.map(([label, group]) => `<div><h4>${label}</h4><div class="theme-picker-grid">${group.map(preview).join('')}</div></div>`).join('');
const html = `<!doctype html><meta charset="utf-8"><base href="${pathToFileURL(`${root}${path.sep}`).href}">
<link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai&family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;500;600&family=ZCOOL+XiaoWei&display=swap" rel="stylesheet">
<style>${styles}
body{overflow:auto!important;background:#e8e3ed!important}.app-screen{width:100vw;height:1100px;background:#e8e3ed}.app-scroll{position:absolute;inset:0 0 0 112px;overflow:visible}.app-tabbar{display:flex;position:absolute}.app-tab-item{display:flex;flex-direction:column;align-items:center;justify-content:center}.settings-page{padding-top:0}.settings-header h1{margin:0;font-size:34px}.account{padding:20px 24px;border-radius:16px;background:#faf7fb;border:1px solid #d8cfdf}.settings-section h3{font-size:11px;letter-spacing:4px;color:#988ca2;margin:0 0 9px}.theme-settings-panel{background:#faf7fb;border-radius:16px;overflow:hidden;border:1px solid #d8cfdf}.theme-settings-panel p{margin:0;padding:16px 18px;border-bottom:1px solid #e2dce6}.theme-settings-panel p span{float:right}.theme-settings-panel p:last-child{border:0}.settings-theme-section .theme-settings-panel{padding:16px}.settings-theme-section h4{font-size:11px;letter-spacing:3px;color:#988ca2;margin:12px 8px 0}.theme-picker-grid{align-items:start!important}.preview-button{border:0;background:transparent;display:flex;flex-direction:column;gap:8px;align-items:center;align-self:start;justify-content:flex-start;height:auto;font:14px "Noto Serif SC",serif}.theme-card-preview{width:100%;min-height:0!important;aspect-ratio:1.55/1!important;padding:10px;display:flex;flex-direction:column;gap:7px;overflow:hidden}.preview-top{display:flex;justify-content:space-between;font-size:9px}.preview-top span{display:flex;gap:4px}.preview-top i{width:7px;height:7px;border-radius:50%;border:1px solid #bbb}.theme-preview-poem-card{min-height:68px;display:flex;flex-direction:column;align-items:center;justify-content:center}.theme-preview-poem-card b{font-size:19px;font-weight:400}.theme-preview-poem-card i{width:18px;height:1px;margin-top:6px}.theme-preview-poem-card em{width:62%;border-top:1px solid;margin-top:7px}.preview-nav{height:10px;display:flex;justify-content:space-around}.preview-nav i{width:3px;height:3px;border-radius:50%;background:#999}.preview-nav strong{width:10px;height:10px;display:block}
</style>
<div class="app-screen"><div class="app-scroll"><main class="settings-page">
  <header class="settings-header"><small>SETTINGS</small><h1>我</h1></header>
  <div class="settings-account-wrap"><div class="account">邮　jingyi021@e.ntu.edu.sg<br><small>已写 7 篇 · 邮箱账户已绑定</small></div></div>
  <section class="settings-section settings-theme-section"><h3>主 题 皮 肤</h3><div class="theme-settings-panel"><p>推荐搭配：雾紫留白 · 小薇体</p>${themeGroups}</div></section>
  ${settingPanel('写 作 与 生 诗', ['每日提醒　22:00', '自动记录位置', '日记生诗', '保存被否决的诗'])}
  ${settingPanel('导 入 与 导 出', ['导入过去日记', '导出与分享', '数据备份'])}
  ${settingPanel('云 同 步', ['Firestore　已同步', '跨设备同步　邮箱账户已启用'])}
  ${settingPanel('数 据', ['清除所有数据', '退出'])}
  <div class="settings-version">版本 2026.06.15-r50</div>
</main></div>
<nav class="app-tabbar">
  <button class="app-tab-item"><span>⌂</span><small>今日</small></button>
  <button class="app-tab-item"><span>▢</span><small>藏册</small></button>
  <button class="app-tab-item app-tab-primary"><span>签</span></button>
  <button class="app-tab-item"><span>◌</span><small>问</small></button>
  <button class="app-tab-item app-tab-active"><span>♙</span><small>我</small></button>
</nav></div>`;

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => { document.documentElement.dataset.diaryTheme = 'dusk'; });
await page.evaluate(() => document.fonts?.ready);
const navLayout = await page.evaluate(() => {
  const nav = document.querySelector('.app-tabbar').getBoundingClientRect();
  const items = [...document.querySelectorAll('.app-tabbar .app-tab-item')].map(item => item.getBoundingClientRect().toJSON());
  return { nav: nav.toJSON(), items };
});
if (
  Math.abs(navLayout.nav.width - 72) > 1 ||
  Math.abs((navLayout.nav.top + navLayout.nav.height / 2) - 550) > 2 ||
  navLayout.nav.left < 24 ||
  navLayout.items.length !== 5 ||
  navLayout.items.some(item => item.top < 0 || item.bottom > 1100)
) {
  throw new Error(`Desktop navigation is misaligned: ${JSON.stringify(navLayout)}`);
}
await page.screenshot({ path: path.join(root, 'output', 'playwright', 'r50-settings-floating-nav.png'), fullPage: true });
await browser.close();
