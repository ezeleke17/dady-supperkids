const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.speechLog = [];
      window.cancellations = 0;
      window.testVoices = [{ lang: 'en-US', localService: false }, { lang: 'en-US', localService: true }];
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: function(text) { this.text = text; } });
      Object.defineProperty(window, 'speechSynthesis', { value: {
        getVoices: () => window.testVoices,
        cancel: () => window.cancellations++,
        speak: utterance => { window.speechLog.push({ text: utterance.text, local: utterance.voice.localService }); if (window.blockSpeech) utterance.onerror(); else utterance.onstart(); }
      }});
    });
    await page.clock.install();
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    assert.equal(await page.title(), 'Daddy’s Super Kids game');
    assert.equal(await page.evaluate(() => speechLog.length), 1);
    assert.match(await page.evaluate(() => speechLog[0].text), /Welcome to Daddy’s Super Kids game/);
    await page.evaluate(() => { window.blockSpeech = true; });
    await page.click('#hear-welcome');
    assert.match(await page.locator('#cat-voice-note').innerText(), /Tap Hear the welcome/);
    await page.evaluate(() => { window.blockSpeech = false; });
    await page.click('#hear-welcome');
    assert.match(await page.evaluate(() => speechLog.at(-1).text), /Welcome to Daddy’s Super Kids game/);
    assert.match(await page.locator('#cat-message').innerText(), /^Sarity,/);
    await page.locator('#cat-voice').click();
    assert.match(await page.evaluate(() => speechLog.at(-1).text), /^Sarithee,/);
    await page.selectOption('#grade-select', '3');
    assert.match(await page.locator('#cat-message').innerText(), /^Kiya,/);
    await page.locator('#cat-repeat').click();
    assert.match(await page.evaluate(() => speechLog.at(-1).text), /^Kia,/);
    await page.locator('[data-game="spelling"]').click();
    assert.match(await page.locator('#cat-message').innerText(), /^Kiya,/);
    const wrongWord = await page.evaluate(() => round.question.options.findIndex(a => a !== round.question.answer));
    await page.locator(`[data-answer-index="${wrongWord}"]`).click();
    assert.match(await page.evaluate(() => speechLog.at(-1).text), /^Kia,/);
    await page.locator('#back-home').click();
    await page.selectOption('#grade-select', '1');
    assert.equal(await page.locator('#cat-voice').getAttribute('aria-pressed'), 'true');
    await page.locator('#cat-boost').click();
    assert.match(await page.locator('#cat-message').innerText(), /proud of you/);
    assert(await page.evaluate(() => speechLog.every(entry => entry.local)));
    await page.locator('[data-game="math"]').click();
    // Let the click's browser scroll events settle before advancing the idle clock.
    await new Promise(resolve => setTimeout(resolve, 250));
    await page.clock.fastForward(74000);
    assert.doesNotMatch(await page.locator('#cat-message').innerText(), /Thinking time/);
    await page.clock.fastForward(1500);
    assert.match(await page.locator('#cat-message').innerText(), /Thinking time/);
    const spoken = await page.evaluate(() => speechLog.length);
    await page.clock.fastForward(150000);
    assert.equal(await page.evaluate(() => speechLog.length), spoken, 'No repeated idle nudges');
    const wrong = await page.evaluate(() => round.question.options.findIndex(a => a !== round.question.answer));
    await page.locator(`[data-answer-index="${wrong}"]`).click();
    assert.match(await page.locator('#cat-message').innerText(), /You don’t have to know it yet/);
    assert.match(await page.evaluate(() => speechLog.at(-1).text), /^Sarithee,/);
    assert.equal(await page.locator('#total-stars').innerText(), '0');
    await page.locator('#cat-voice').click();
    const count = await page.evaluate(() => speechLog.length);
    await page.locator('#cat-boost').click();
    assert.equal(await page.evaluate(() => speechLog.length), count);
    assert.equal(await page.locator('.speaking').count(), 0);
    await page.locator('#next-question').click();
    await page.locator('#parent-open').click();
    await page.clock.fastForward(80000);
    assert.doesNotMatch(await page.locator('#cat-message').innerText(), /Thinking time/);
    await page.locator('#parent-close').click();
    await page.evaluate(() => { window.testVoices = [{lang:'en-US',localService:false}]; });
    await page.locator('#cat-voice').click();
    assert.match(await page.locator('#cat-voice-note').innerText(), /not ready/);
    assert.equal(await page.evaluate(() => speechLog.length), count);
    for (const width of [375,768,1024,1440]) {
      await page.setViewportSize({width,height:1000});
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('.cat-coach').evaluate(el => el.classList.add('speaking'));
    assert.equal(await page.locator('.cat-face').evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.reload();
    assert.equal(await page.locator('#cat-voice').getAttribute('aria-pressed'), 'false');
    if (process.env.SCREENSHOT_PATH) await page.screenshot({path:process.env.SCREENSHOT_PATH,fullPage:true});
    assert.deepEqual(errors, []);
    console.log('PASS: encouragement, local-only speech selection, mute, missing voice fallback, once-only idle reminder, settings pause, responsive layout, reduced motion, and default-off reload. Speech engine mocked; listening on real devices remains a manual check.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
