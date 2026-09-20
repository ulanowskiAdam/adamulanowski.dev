import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://localhost:4000';
const out = 'artifacts/ux-check';
await mkdir(out, { recursive: true });
const stats = JSON.parse(await readFile('dist/adamulanowski.dev/stats.json', 'utf8'));
const threeChunks = Object.entries(stats.outputs)
  .filter(([, value]) =>
    Object.keys(value.inputs ?? {}).some((key) => key.includes('node_modules/three/')),
  )
  .map(([key]) => key.split(/[\\/]/).at(-1));
assert(threeChunks.length);
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const report = [];
try {
  for (const [width, height] of [
    [360, 800],
    [390, 844],
    [768, 1024],
    [1440, 900],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const scripts = [],
      errors = [];
    page.on('request', (req) => {
      if (req.resourceType() === 'script') scripts.push(req.url());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(origin);
    assert.equal(response.status(), 200);
    await page.getByRole('heading', { level: 1 }).waitFor();
    const metrics = await page.evaluate(() => {
      const rect = (selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, width: r.width };
      };
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        h1: rect('h1'),
        description: rect('.hero-description'),
        actions: rect('.hero .actions'),
        columns: getComputedStyle(
          document.querySelector('.service-grid'),
        ).gridTemplateColumns.split(' ').length,
      };
    });
    assert.equal(metrics.overflow, false);
    assert(metrics.actions.bottom <= height, JSON.stringify(metrics));
    assert.equal(metrics.columns, width >= 768 ? 2 : 1);
    await page.locator('.about img').scrollIntoViewIfNeeded();
    await page.locator('.about img').evaluate((img) => img.decode());
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: out + '/home-' + width + '.png', fullPage: true });
    await page.screenshot({ path: out + '/hero-' + width + '.png' });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Wyślij wiadomość', exact: true }).click();
    await page.locator('#email[aria-invalid="true"]').waitFor();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'email');
    assert(
      !scripts.some((url) => threeChunks.some((chunk) => url.endsWith('/' + chunk))),
      'Home loaded Three.js',
    );
    assert.equal(errors.length, 0, errors.join('\n'));
    report.push({
      viewport: width + 'x' + height,
      ...metrics,
      scripts: scripts.length,
      threeLoaded: false,
    });
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  // No real outgoing message: all browser submission responses are local mocks.
  await page.route('**/api/contact', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'provider_error' }),
    }),
  );
  await page.goto(origin + '/#contact');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#message').fill('Test bez wysyłania do dostawcy.');
  await page.getByRole('button', { name: 'Wyślij wiadomość', exact: true }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.locator('#message').inputValue(), 'Test bez wysyłania do dostawcy.');
  await page.unroute('**/api/contact');
  await page.route('**/api/contact', (route) =>
    route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: '{"ok":true,"status":"accepted"}',
    }),
  );
  await page.getByRole('button', { name: 'Wyślij wiadomość', exact: true }).click();
  await page.getByRole('status').waitFor();
  assert(await page.getByRole('button', { name: 'Przyjęto do wysłania' }).isDisabled());
  await page.goto(origin + '/demo/konfigurator');
  await page.getByRole('button', { name: 'Uruchom demonstrację' }).click();
  await page.getByRole('button', { name: 'Fachowcy i usługi', exact: true }).click();
  await page.getByRole('button', { name: 'Dalej: wybierz rozwiązania →' }).click();
  await page.getByRole('button', { name: /Automatyzacja obsługi zleceń/ }).click();
  assert.equal(await page.locator('input').count(), 0);
  await page.getByRole('link', { name: 'Porozmawiajmy o tej koncepcji ↗' }).click();
  await page.getByText(/Kontekst z demonstracji:/).waitFor();
  assert((await page.locator('.context').innerText()).includes('Automatyzacja obsługi zleceń'));
  const contactTop = await page
    .locator('#contact')
    .evaluate((el) => el.getBoundingClientRect().top);
  assert(contactTop < 100, 'Demo link did not scroll to contact: ' + contactTop);
  for (const fragment of ['about', 'capabilities', 'contact', 'configurator']) {
    await page.goto(origin + '/#' + fragment);
    await page.locator('#' + fragment).waitFor({ state: 'attached' });
  }
  for (const path of ['/', '/o-mnie', '/polityka-prywatnosci', '/demo/konfigurator']) {
    const response = await page.goto(origin + path);
    assert.equal(response.status(), 200);
    assert.equal(
      await page.locator('link[rel=canonical]').getAttribute('href'),
      'https://adamulanowski.dev' + path,
    );
    assert.equal(await page.locator('h1').count(), 1);
  }
  const missing = await page.goto(origin + '/nie-ma-takiej-strony');
  assert.equal(missing.status(), 404);
  assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex, follow');
  assert.equal(await page.locator('link[rel=canonical]').count(), 0);
  const invalidJson = await page.request.post(origin + '/api/contact', {
    headers: { 'Content-Type': 'application/json' },
    data: '{',
  });
  assert.equal(invalidJson.status(), 400);
  assert.equal((await invalidJson.json()).code, 'validation_error');
  const image = await page.request.get(origin + '/images/adam-ulanowski-dark.webp');
  assert.equal(image.status(), 200);
  assert(image.headers()['content-type'].startsWith('image/webp'));
  await page.close();
  const demo = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const demoScripts = [];
  demo.on('request', (req) => {
    if (req.resourceType() === 'script') demoScripts.push(req.url());
  });
  await demo.goto(origin + '/demo/konfigurator');
  await demo.getByRole('button', { name: 'Uruchom demonstrację' }).click();
  await demo.getByRole('button', { name: 'Gastronomia', exact: true }).click();
  await demo.getByRole('button', { name: 'Włącz podgląd 3D' }).click();
  await demo.waitForFunction(() =>
    performance
      .getEntriesByType('resource')
      .some((entry) => entry.name.includes('.js') && entry.name.includes('chunk')),
  );
  await demo.waitForFunction(
    () =>
      document.querySelector('.scene-canvas')?.width > 300 ||
      document.body.textContent.includes('Podgląd 3D jest niedostępny'),
    null,
    { timeout: 20000 },
  );
  assert(demoScripts.some((url) => threeChunks.some((chunk) => url.endsWith('/' + chunk))));
  await demo.getByRole('button', { name: 'Dalej: wybierz rozwiązania →' }).click();
  await demo.getByRole('button', { name: /Aplikacja do zamówień online/ }).click();
  await demo.screenshot({ path: out + '/demo-desktop.png', fullPage: true });
  await demo.close();
  const fallback = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await fallback.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
      return getContext.call(this, type, ...args);
    };
  });
  await fallback.goto(origin + '/demo/konfigurator');
  await fallback.getByRole('button', { name: 'Uruchom demonstrację' }).click();
  await fallback.getByRole('button', { name: 'Włącz podgląd 3D' }).click();
  await fallback.getByText('Podgląd 3D jest niedostępny.', { exact: false }).waitFor();
  await fallback.getByRole('button', { name: 'Gastronomia', exact: true }).click();
  await fallback.getByRole('button', { name: 'Dalej: wybierz rozwiązania →' }).click();
  await fallback.getByRole('button', { name: /Aplikacja do zamówień online/ }).click();
  assert.equal(
    await fallback.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await fallback.screenshot({ path: out + '/demo-mobile-fallback.png', fullPage: true });
  await fallback.close();
  // Verify the home offer and form exist without JavaScript.
  const noJs = await browser.newPage({ javaScriptEnabled: false });
  await noJs.goto(origin);
  assert.equal(await noJs.locator('.service-card').count(), 4);
  assert.equal(await noJs.locator('#contact form').count(), 1);
  await noJs.close();
  await writeFile(out + '/report.json', JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        passed: true,
        report,
        checked: [
          'mocked form errors and success',
          'demo context',
          'legacy anchors',
          'route SEO',
          'HTTP 404',
          'image MIME',
          'HTML without JS',
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
