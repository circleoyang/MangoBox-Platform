const { chromium } = require('playwright');
const assert = require('assert');
const fixture = require('./current-fixture.js');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {}) });
  try {
    const page = await browser.newPage({ acceptDownloads: true });
    const errors = [];
    // Set AI_CONTEXT_REAL_PACK=1 for the final integration check against delivered data.
    if (!process.env.AI_CONTEXT_REAL_PACK) await page.route('**/data/firmware-current.json', r => r.fulfill({json:fixture}));
    page.on('pageerror', e => errors.push(e.message));
    const root = 'http://127.0.0.1:8769/docs/student-guide/site/';
    await page.goto(root + 'ai-context-builder.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.getElementById('generate').disabled);
    assert.strictEqual(await page.locator('#source').inputValue(), 'current');
    assert.strictEqual(await page.locator('#target option').count(), 8);
    assert(await page.locator('#mode').isDisabled());
    for (const t of fixture.targets) for (const lang of ['zh-TW','en']) {
      await page.locator('#target').selectOption(t.id);
      await page.locator('#lang').selectOption(lang);
      assert(await page.locator('#download').isDisabled());
      await page.locator('#generate').click();
      const md = await page.locator('#preview').inputValue();
      assert(md.includes(fixture.source_commit) && md.includes('TEST_ONLY') && md.includes('歐陽芳泉'));
      assert(md.includes(t.id));
    }
    const [currentDownload] = await Promise.all([page.waitForEvent('download'), page.locator('#download').click()]);
    assert(currentDownload.suggestedFilename().includes('TEST_ONLY.md'));
    const stream = await currentDownload.createReadStream(); const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    assert.strictEqual(Buffer.concat(chunks).toString('utf8'), await page.locator('#preview').inputValue());
    await page.context().addInitScript(() => { window.print = () => {}; });
    const [printPage] = await Promise.all([page.waitForEvent('popup'), page.locator('#print').click()]);
    await printPage.waitForLoadState('domcontentloaded');
    assert.strictEqual(await printPage.locator('#content').textContent(), await page.locator('#preview').inputValue());
    const pdf = await printPage.pdf(); assert(pdf.subarray(0,4).toString() === '%PDF');
    await printPage.close();
    await page.locator('#source').selectOption('legacy');
    await page.locator('#lang').selectOption('zh-TW');
    await page.locator('#modules input').first().waitFor();
    if (await page.locator('#modules input').count() < 5) throw Error('Too few supported modules');
    await page.locator('#all').uncheck();
    await page.locator('#modules input[value="pot"]').check();
    await page.locator('#generate').click();
    await page.waitForFunction(() => !document.getElementById('download').disabled, null, { timeout: 15000 });
    const content = await page.locator('#preview').inputValue();
    if (!content.includes('m.pot(') || !content.includes('MangoBox Official Student API')) throw Error('Pot reference absent from generated context');
    const [download] = await Promise.all([
      page.waitForEvent('download'), page.locator('#download').click()
    ]);
    if (!download.suggestedFilename().endsWith('.md')) throw Error('Incorrect download extension');
    await page.locator('#mode').selectOption('host_python');
    if (await page.locator('#modules input[value="pot"]').count() !== 0) throw Error('Unsupported Host Pot shown');
    await page.locator('#mode').selectOption('high_level_micropython');
    await page.locator('#lang').selectOption('en');
    await page.locator('#all').check();
    await page.locator('#generate').click();
    await page.waitForFunction(() => !document.getElementById('download').disabled, null, {timeout:15000});
    if ((await page.locator('#preview').inputValue()).length < 1000) throw Error('Full context unexpectedly short');
    // Missing current pack fails closed, without preventing historical use.
    const broken = await browser.newPage();
    await broken.route('**/data/firmware-current.json', r => r.fulfill({status:404,body:'missing'}));
    await broken.goto(root + 'ai-context-builder.html', {waitUntil:'networkidle'});
    assert(await broken.locator('#generate').isDisabled());
    assert(await broken.locator('#download').isDisabled());
    await broken.locator('#source').selectOption('legacy');
    assert(!(await broken.locator('#generate').isDisabled()));
    await broken.close();
    if (errors.length) throw Error('Browser JavaScript errors: ' + errors.join('; '));
    console.log('AI Context Builder E2E PASS: 16 current exports, MD byte parity, print/PDF parity, missing-data gate, historical profile gate, Pot export, English export');
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exit(1)});

