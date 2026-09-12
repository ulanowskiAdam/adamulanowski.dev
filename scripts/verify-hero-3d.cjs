// Run against `ng serve`: PLAYWRIGHT_MODULE may point to a bundled Playwright.
// node scripts/verify-hero-3d.cjs (optionally BROWSER_PATH, HERO_URL)
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function audit(page, out, viewport, reducedMotion, industries = [0, 1, 2, 3]) {
  await fs.mkdir(out, { recursive: true });
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion });
  await page.goto(process.env.HERO_URL || 'http://127.0.0.1:4200');
  await page.getByRole('button', { name: 'Stwórz swoją koncepcję' }).click();
  const stepReady = async (step) => page.waitForFunction(n => document.querySelector('.progress-head')?.textContent.includes(`0${n}`), step);
  await stepReady(1);
  const records = [];
  const errors = [];
  const onError = (error) => errors.push(error.message);
  page.on('pageerror', onError);
  const capture = async (name, count) => {
    // Let the compositor repaint the canvas after clicks scroll it out of view.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    // Reduced motion still needs time for shader compilation/compositor updates.
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.feature-option[aria-pressed="true"]').count(), count);
    const bounds = await page.evaluate(() => {
      const scene = window.ng.getComponent(document.querySelector('app-business-scene'));
      return [...scene.addons.values()].filter(r => !r.exiting).map(r => {
        const points = [];
        r.group.updateMatrixWorld(true);
        r.group.traverse(mesh => {
          if (!mesh.isMesh || !mesh.visible) return;
          mesh.geometry.computeBoundingBox();
          const b = mesh.geometry.boundingBox;
          for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
            points.push(scene.camera.position.clone().set(x, y, z).applyMatrix4(mesh.matrixWorld).project(scene.camera));
          }
        });
        return { id: r.id, active: r.activeIndicator.visible, minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)), minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)) };
      });
    });
    assert.equal(bounds.length, count);
    const canvasSize = await page.evaluate(() => {
      const host = document.querySelector('.canvas-host').getBoundingClientRect();
      const canvas = document.querySelector('.canvas-host canvas').getBoundingClientRect();
      return { width: Math.abs(host.width - canvas.width), height: Math.abs(host.height - canvas.height) };
    });
    assert.ok(canvasSize.width < 1 && canvasSize.height < 1, `Canvas CSS size differs from label host: ${JSON.stringify(canvasSize)}`);
    const order = await page.evaluate(() => {
      const root = document.querySelector('app-experience-hero');
      const scene = window.ng.getComponent(document.querySelector('app-business-scene'));
      return scene.addonLabels().map(item => item.id);
    });
    for (const b of bounds) {
      const index = order.indexOf(b.id);
      assert.equal((b.minX + b.maxX) > 0, index % 2 === 1, `Wrong column: ${b.id}`);
      assert.equal((b.minY + b.maxY) > 0, index < 2, `Wrong row: ${b.id}`);
    }
    const labels = await page.locator('.addon-label').evaluateAll(nodes => nodes.map(n => {
      const r = n.getBoundingClientRect();
      const panel = n.closest('.visual-panel').getBoundingClientRect();
      return { id: n.dataset.addonId, left: r.left, right: r.right, top: r.top, bottom: r.bottom,
        panel: { left: panel.left, right: panel.right, top: panel.top, bottom: panel.bottom } };
    }));
    assert.equal(labels.length, count);
    for (const label of labels) {
      assert.ok(label.left >= label.panel.left && label.right <= label.panel.right && label.bottom < label.panel.bottom - 32, `Caption clipped: ${label.id}`);
      for (const b of bounds) {
        const width = label.panel.right - label.panel.left, height = label.panel.bottom - label.panel.top;
        const left = label.panel.left + (b.minX + 1) * width / 2, right = label.panel.left + (b.maxX + 1) * width / 2;
        const top = label.panel.top + (1 - b.maxY) * height / 2, bottom = label.panel.top + (1 - b.minY) * height / 2;
        assert.ok(label.right <= left || label.left >= right || label.bottom <= top || label.top >= bottom, `Caption overlaps model: ${label.id}, ${b.id}`);
      }
    }
    assert.equal(bounds.filter(b => b.active).length, 1);
    for (const b of bounds) assert.ok(b.minX > -0.96 && b.maxX < 0.96 && b.minY > -0.8 && b.maxY < 0.8, `Clipping: ${JSON.stringify(b)}`);
    for (let i = 0; i < bounds.length; i++) for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i], b = bounds[j];
      assert.ok(a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY, `Overlapping addons: ${a.id}, ${b.id}`);
    }
    let shot = await page.locator('.visual-panel').screenshot();
    if (reducedMotion === 'reduce') {
      let stable = false;
      for (let attempt = 0; attempt < 6 && !stable; attempt++) {
        await page.waitForTimeout(300);
        const next = await page.locator('.visual-panel').screenshot();
        stable = shot.equals(next);
        shot = next;
      }
      assert.ok(stable, `Reduced-motion capture did not stabilize: ${name}`);
    }
    await fs.writeFile(path.join(out, `${name}.png`), shot);
    records.push({ name, bounds });
  };
  for (const industry of industries) {
    await page.locator('.option').nth(industry).click();
    await page.getByRole('button', { name: 'Dalej' }).click();
    await stepReady(2);
    assert.equal(await page.locator('.feature-option[aria-pressed="true"]').count(), 0);
    for (let addon = 0; addon < 4; addon++) {
      await page.locator('.feature-option').nth(addon).click();
      await capture(`${industry}-${addon}`, 1);
      await page.locator('.feature-option').nth(addon).click();
    }
    for (const button of await page.locator('.feature-option').all()) await button.click();
    await capture(`${industry}-all`, 4);
    await page.getByRole('button', { name: 'Dalej' }).click();
    await stepReady(3);
    for (const mood of await page.locator('.mood-option').all()) {
      await mood.click();
      await page.waitForTimeout(150);
    }
    await page.getByRole('button', { name: 'Dalej' }).click();
    await stepReady(4);
    assert.equal(await page.locator('input').count(), 3);
    await page.getByRole('button', { name: 'Wstecz' }).click();
    await stepReady(3);
    await page.getByRole('button', { name: 'Wstecz' }).click();
    await stepReady(2);
    assert.equal(await page.locator('.feature-option[aria-pressed="true"]').count(), 4);
    await page.getByRole('button', { name: 'Wstecz' }).click();
    await stepReady(1);
  }
  page.off('pageerror', onError);
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(out, 'results.json'), JSON.stringify({ viewport, reducedMotion, records, errors }, null, 2));
  return { viewport, reducedMotion, captures: records.length, errors };
}

module.exports = { audit };
if (require.main === module) {
  (async () => {
    const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
    try {
      const page = await browser.newPage();
      for (const width of [1440, 390]) for (const motion of ['no-preference', 'reduce']) {
        console.log(await audit(page, path.resolve(`artifacts/hero-3d/${width}-${motion}`), { width, height: width === 390 ? 844 : 1000 }, motion));
      }
    } finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
