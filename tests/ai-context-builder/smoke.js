const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ acceptDownloads: true });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const root = 'http://127.0.0.1:8769/docs/student-guide/site/';
    await page.goto(root + 'ai-context-builder.html', { waitUntil: 'networkidle' });
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
    if (errors.length) throw Error('Browser JavaScript errors: ' + errors.join('; '));
    console.log('AI Context Builder E2E PASS: profile gate, Pot export, English complete export, download');
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exit(1)});
