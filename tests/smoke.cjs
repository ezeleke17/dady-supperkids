// Optional browser regression checks: install Playwright and run node tests/smoke.cjs.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    }
    await page.getByRole('button', { name: "Let's do math" }).click();
    for (let i = 0; i < 10; i++) {
      const answer = await page.evaluate(() => round.question.answer);
      const options = await page.locator('.answer').allTextContents();
      assert.equal(new Set(options).size, 4);
      await page.getByRole('button', { name: String(answer), exact: true }).click();
      assert.equal(await page.locator('.answer:disabled').count(), 4);
      await page.locator('#next-question').click();
    }
    assert.match(await page.locator('.result-score').innerText(), /10 \/ 10/);
    assert.equal(await page.locator('#total-stars').innerText(), '10');
    await page.locator('#result-home').click();
    await page.getByRole('button', { name: "Let's spell" }).click();
    for (let i = 0; i < 10; i++) {
      const word = await page.evaluate(() => round.question.answer);
      await page.locator('#word-input').fill(i === 0 ? 'wrong' : ` ${word.toUpperCase()} `);
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await page.locator('#next-question').click();
    }
    assert.match(await page.locator('.result-score').innerText(), /9 \/ 10/);
    await page.locator('#result-home').click();
    await page.getByRole('button', { name: "Let's find pairs" }).click();
    // Inspect generated state to exercise all matching cards independently of shuffle order.
    const pairs = await page.evaluate(() => {
      const groups = {};
      round.cards.forEach((c, i) => (groups[c.name] ||= []).push(i));
      return Object.values(groups);
    });
    await page.locator(`[data-card="${pairs[0][0]}"]`).click();
    await page.locator(`[data-card="${pairs[1][0]}"]`).click();
    await page.waitForTimeout(1450);
    assert.equal(await page.locator('.revealed').count(), 0);
    for (const pair of pairs) for (const i of pair) await page.locator(`[data-card="${i}"]`).click();
    await page.locator('#memory-finish').click();
    assert.match(await page.locator('.result-score').innerText(), /6 \/ 6/);
    await page.locator('#parent-open').click();
    await page.locator('#difficulty').selectOption('hard');
    await page.locator('#reduce-motion').check();
    await page.getByRole('button', { name: 'Save settings' }).click();
    await page.reload();
    assert.equal(await page.locator('#total-stars').innerText(), '25');
    assert(await page.locator('body').evaluate(el => el.classList.contains('quiet')));
    await page.getByRole('button', { name: "Let's find pairs" }).click();
    assert.equal(await page.locator('[data-card]').count(), 20);
    // Leaving during a mismatch must cancel the old game timer.
    const mismatch = await page.evaluate(() => [0, round.cards.findIndex(c => c.name !== round.cards[0].name)]);
    for (const i of mismatch) await page.locator(`[data-card="${i}"]`).click();
    await page.locator('#back-home').click();
    await page.waitForTimeout(1450);
    for (const grade of ['1','3']) {
      await page.selectOption('#grade-select', grade);
      await page.reload();
      assert.equal(await page.locator('#grade-select').inputValue(), grade);
      for (const game of ['math','spelling','reading']) {
        await page.locator(`[data-game="${game}"]`).click();
        assert.match(await page.locator('.progress-label').innerText(), new RegExp(`Grade ${grade}`));
        for (let i=0; i<10; i++) {
          for (const width of [375,768]) {
            await page.setViewportSize({width,height:1024});
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${game} overflow at ${width}`);
          }
          const answerIndex = await page.evaluate(() => round.question.options.indexOf(round.question.answer));
          const starsBefore = Number(await page.locator('#total-stars').innerText());
          const button = page.locator(`[data-answer-index="${answerIndex}"]`);
          await button.click();
          // A second event on the disabled answer must not change the score.
          await button.dispatchEvent('click');
          assert.equal(Number(await page.locator('#total-stars').innerText()), starsBefore+1);
          assert((await page.locator('#feedback').innerText()).length > 40);
          await page.locator('#next-question').click();
        }
        assert.match(await page.locator('.result-score').innerText(), /10 \/ 10/);
        if (game === 'reading') {
          assert.equal(await page.locator('.writing-practice details').count(), 2);
          await page.locator('.writing-practice summary').first().click();
          await page.locator('#writing-0').fill('I can explain my answer with details from the text.');
        }
        await page.locator('#result-home').click();
      }
    }
    assert.equal(await page.locator('#total-stars').innerText(), '85');
    assert.match(await page.locator('footer').innerText(), /© Design and Developed by Esayas Zeleke/);
    assert.deepEqual(errors, []);
    await page.setViewportSize({ width: 1440, height: 1000 });
    if (process.env.SCREENSHOT_PATH) await page.screenshot({ path: process.env.SCREENSHOT_PATH, fullPage: true });
    console.log('PASS: both grades, complete math/spelling/reading rounds, writing prompts, responsive questions, scoring guards, memory matching, timer cleanup, settings, persistence, copyright, and no browser errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
