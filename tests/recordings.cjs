const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.micStops = 0; window.micRequests = 0; window.rejectMic = false;
      Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: async () => {
        window.micRequests++;
        if (window.rejectMic) throw new Error('Denied');
        return { getTracks: () => [{ stop: () => window.micStops++ }] };
      } } });
      window.MediaRecorder = class {
        constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; }
        start() { this.state = 'recording'; }
        stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob(['mock audio']) }); this.onstop(); }
      };
      HTMLMediaElement.prototype.play = async function () { window.lastPlayed = this.src; };
    });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    assert.equal(await page.evaluate(() => micRequests), 0);
    await page.click('#parent-open');
    await page.click('#record-start');
    await page.click('#record-stop');
    assert.equal(await page.evaluate(() => micStops), 1);
    await page.waitForFunction(() => !document.querySelector('#record-save').disabled);
    await page.click('#record-save');
    await page.waitForFunction(() => document.querySelector('#record-status').textContent.includes('saved on'));
    await page.click('#parent-close');
    assert.equal(await page.locator('#cat-daddy').isVisible(), true);
    await page.click('#cat-daddy');
    assert.match(await page.evaluate(() => lastPlayed), /^blob:/);
    await page.reload();
    await page.waitForFunction(() => !document.querySelector('#cat-daddy').hidden);
    await page.click('#parent-open');
    await page.selectOption('#record-grade', '3');
    assert.equal(await page.locator('#record-delete').isDisabled(), true);
    await page.click('#record-start');
    await page.click('#parent-close');
    await page.waitForFunction(() => micStops === 1);
    assert.equal(await page.evaluate(() => micStops), 1);
    await page.click('#parent-open');
    await page.evaluate(() => { window.rejectMic = true; });
    await page.click('#record-start');
    await page.waitForFunction(() => document.querySelector('#record-status').textContent.includes('denied'));
    await page.selectOption('#record-grade', '1');
    await page.click('#record-delete');
    await page.waitForFunction(() => document.querySelector('#record-status').textContent.includes('deleted'));
    await page.click('#parent-close');
    assert.equal(await page.locator('#cat-daddy').isVisible(), false);
    await page.reload();
    await page.click('#parent-open');
    assert.equal(await page.locator('#record-delete').isDisabled(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log('PASS: microphone opt-in, recording lifecycle, preview, save, reload, grade separation, playback, cancellation, denied permission, deletion, and mobile width. Audio APIs mocked; real microphone listening requires device testing.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
