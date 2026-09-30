const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.clock.install();
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.click('[data-game="math"]');
    await page.evaluate(() => { round.score = 9; result(); });
    assert.equal(await page.locator('#open-prize').count(), 0);
    await page.click('#play-again');
    for (let i = 0; i < 10; i++) {
      const answer = await page.evaluate(() => round.question.options.indexOf(round.question.answer));
      await page.click(`[data-answer-index="${answer}"]`);
      await page.click('#next-question');
    }
    const stars = await page.locator('#total-stars').innerText();
    await page.tap('#open-prize');
    assert.equal(await page.locator('#prize-clock').innerText(), '2:00');
    await page.locator('.prize-friends button').first().tap();
    assert.match(await page.locator('#prize-message').innerText(), /bananas/);
    assert.equal(await page.locator('#total-stars').innerText(), stars);
    assert(await page.evaluate(() => { const d = document.querySelector('.prize-dialog'); return d.scrollWidth <= d.clientWidth; }));
    await page.clock.fastForward(119000);
    assert.equal(await page.locator('#prize-friends').isVisible(), true);
    await page.clock.fastForward(1000);
    assert.equal(await page.locator('#prize-clock').innerText(), '0:00');
    assert.equal(await page.locator('#prize-friends').isVisible(), false);
    await page.click('#prize-close');
    assert.equal(await page.locator('#open-prize').isDisabled(), true);
    await page.click('#result-home');
    await page.click('[data-game="reading"]');
    await page.evaluate(() => { round.score = 10; result(); });
    await page.locator('.writing-practice summary').first().click();
    await page.fill('#writing-0', 'My story stays here.');
    await page.click('#open-prize');
    await page.press('#prize-close', 'Escape');
    assert.equal(await page.locator('#writing-0').inputValue(), 'My story stays here.');
    await page.clock.fastForward(125000);
    assert.equal(await page.locator('.prize-dialog').isVisible(), false);
    await page.click('#result-home');
    await page.click('[data-game="spelling"]');
    await page.evaluate(() => { round.score = 10; result(); });
    assert.equal(await page.locator('#open-prize').isVisible(), true);
    assert.deepEqual(errors, []);
    console.log('PASS: perfect-round unlock, no 9/10 reward, touch play, unchanged stars, two-minute deadline, single use, early exit, preserved writing, and reading/spelling unlocks.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
