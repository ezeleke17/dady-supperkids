const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const prefix = '/daddys-super-kids/';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
(async () => {
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://test.invalid').pathname);
      assert(pathname.startsWith(prefix));
      const relative = pathname.slice(prefix.length) || 'index.html';
      const target = path.resolve(root, relative);
      assert(target.startsWith(root + path.sep));
      const bytes = await fs.readFile(target);
      res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'text/plain' });
      res.end(bytes);
    } catch (_) { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const base = `http://127.0.0.1:${server.address().port}${prefix}`;
    const page = await browser.newPage({ hasTouch: true, isMobile: true });
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(`HTTP ${response.status()}: ${response.url()}`); });
    page.on('request', request => { if (!request.url().startsWith(base) && !request.url().startsWith('blob:')) failures.push('Unexpected external runtime request'); });
    await page.goto(base);
    assert.equal(await page.title(), 'Daddy’s Super Kids game');
    const refs = await page.locator('script[src], link[href]').evaluateAll(elements => elements.map(el => el.getAttribute('src') || el.getAttribute('href')));
    for (const ref of refs) {
      assert(!/^(?:\/|[a-z]+:)/i.test(ref), `Asset is not relative: ${ref}`);
      assert.equal((await page.request.get(new URL(ref, base).href)).status(), 200, ref);
    }
    const manifest = await (await page.request.get(base + 'manifest.webmanifest')).json();
    assert.equal(new URL(manifest.start_url, base).href, base + 'index.html');
    assert.equal(new URL(manifest.scope, base).href, base);
    for (const icon of [...manifest.icons, { src: './assets/apple-touch-icon.png', sizes: '180x180' }, { src: './assets/favicon-32.png', sizes: '32x32' }]) {
      assert(icon.src.startsWith('./assets/'));
      const response = await page.request.get(new URL(icon.src, base).href);
      assert.equal(response.status(), 200);
      const dimensions = await page.evaluate(async src => {
        const image = new Image(); image.src = src; await image.decode();
        return `${image.naturalWidth}x${image.naturalHeight}`;
      }, icon.src);
      assert.equal(dimensions, icon.sizes);
    }
    for (const [width, height] of [[375, 812], [768, 1024], [1024, 768], [800, 1280], [1280, 800]]) {
      await page.setViewportSize({ width, height });
      await page.goto(base);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Home overflows at ${width}`);
      for (const game of ['math', 'spelling', 'reading', 'memory']) {
        await page.locator(`[data-game="${game}"]`).tap();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${game} overflows at ${width}`);
        const targets = page.locator(game === 'memory' ? '.memory-card-button' : '.answer');
        for (const target of await targets.all()) {
          const box = await target.boundingBox();
          assert(box.width >= 44 && box.height >= 44, `${game} small touch target at ${width}`);
        }
        await page.locator('.brand').tap();
      }
      await page.locator('#parent-open').tap();
      assert(await page.locator('#record-start').isVisible());
      assert(await page.evaluate(() => {
        const dialog = document.querySelector('#settings');
        return dialog.scrollWidth <= dialog.clientWidth + 1;
      }), `Settings overflow at ${width}`);
      await page.locator('#parent-close').tap();
    }
    await page.setViewportSize({ width: 768, height: 1024 });
    await fs.mkdir(path.join(root, 'test-results'), { recursive: true });
    await page.screenshot({ path: path.join(root, 'test-results/publishing-tablet.png'), fullPage: true });
    await page.reload();
    assert(await page.locator('#grade-select').isVisible());
    assert.deepEqual(failures, []);
    console.log('PASS: repository-subpath hosting, relative assets, PNG dimensions, manifest scope, no external runtime requests or browser errors, refresh, five touch viewports, all game layouts, settings, and 44px answer/card targets. Real iPad/Android audio still requires device testing.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exit(1); });
