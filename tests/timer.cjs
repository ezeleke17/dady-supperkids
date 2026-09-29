const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install();
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    assert.equal(await page.locator('#time-challenge').isChecked(), false);
    await page.locator('[data-game="math"]').click();
    assert.equal(await page.locator('#challenge-clock').count(), 0);
    await page.locator('#back-home').click();
    await page.locator('#time-challenge').check();
    await page.reload();
    assert(await page.locator('#time-challenge').isChecked());
    for (const game of ['math', 'spelling', 'reading', 'memory']) {
      await page.locator(`[data-game="${game}"]`).click();
      await page.clock.fastForward(65000);
      const before = await page.locator('#challenge-clock').innerText();
      assert.match(before, /^1:0[5-9]$/);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (game === 'memory') {
        const pairs = await page.evaluate(() => {
          const groups = {};
          round.cards.forEach((c,i) => (groups[c.name] ||= []).push(i));
          return Object.values(groups);
        });
        for (const pair of pairs) for (const i of pair) await page.locator(`[data-card="${i}"]`).click();
      } else {
        for (let i = 0; i < 10; i++) {
          const index = await page.evaluate(() => round.question.options.indexOf(round.question.answer));
          await page.locator(`[data-answer-index="${index}"]`).click();
          if (i < 9) await page.locator('#next-question').click();
        }
      }
      const finished = await page.locator('#challenge-clock').innerText();
      assert.notEqual(finished, '0:00', 'Clock must not reset between questions');
      await page.clock.fastForward(90000);
      assert.equal(await page.locator('#challenge-clock').innerText(), finished, 'Clock stops on completion');
      await page.locator(game === 'memory' ? '#memory-finish' : '#next-question').click();
      assert((await page.locator('.time-result').innerText()).includes(finished));
      await page.clock.fastForward(60000);
      assert.equal(await page.locator('#challenge-clock').innerText(), finished);
      await page.locator('#play-again').click();
      assert.match(await page.locator('#challenge-clock').innerText(), /^0:0[0-3]$/);
      await page.locator('#back-home').click();
      await page.clock.fastForward(120000);
      assert.equal(await page.locator('#challenge-clock').count(), 0);
    }
    await page.locator('#time-challenge').uncheck();
    await page.locator('[data-game="math"]').click();
    assert.equal(await page.locator('#challenge-clock').count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: optional timer, saved preference, all four games, time continuity, completion freeze, results, replay reset, navigation cleanup, mobile layout, and untimed play.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
