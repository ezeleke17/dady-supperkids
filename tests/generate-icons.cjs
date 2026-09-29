// Optional asset maintenance tool; never runs in the published game.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const assets = path.resolve(__dirname, '../assets');
  const svg = await fs.readFile(path.join(assets, 'favicon.svg'), 'utf8');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    for (const [name, size, maskable] of [
      ['favicon-32.png', 32], ['apple-touch-icon.png', 180],
      ['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512, true]
    ]) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(`<style>html,body{margin:0;background:#40745b}svg{display:block;width:100vw;height:100vh}</style>${maskable ? svg.replace('rx="112"', 'rx="0"') : svg}`);
      await page.screenshot({ path: path.join(assets, name) });
    }
    console.log('Generated five PNG app icons from the local SVG.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
