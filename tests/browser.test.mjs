import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { requireTool, repoRoot } from '../scripts/toolchain.mjs';
import { startServer } from '../scripts/serve.mjs';

const { chromium } = requireTool('playwright');
const testTemporaryRoot = resolve(repoRoot, '../../Temporary/tcgcardgame/browser-tests');
let server;
let baseURL;
before(async () => {
  await mkdir(testTemporaryRoot, { recursive: true });
  server = startServer(0);
  await once(server, 'listening');
  baseURL = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });

for (const channel of ['chrome', 'msedge']) {
  test(`${channel}：匯入兩款遊戲、查看詳情與關閉重開後恢復`, async () => {
    const profile = await mkdtemp(join(testTemporaryRoot, `${channel}-`));
    let context;
    try {
      context = await chromium.launchPersistentContext(profile, { channel, headless: true, viewport: { width: 1440, height: 1000 } });
      let page = await context.newPage();
      await page.goto(baseURL);
      await page.locator('input[aria-label="匯入遊戲套件"]:enabled').waitFor({ state: 'attached' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      if (process.env.PREVIEW_DIR && channel === 'chrome') {
        await mkdir(process.env.PREVIEW_DIR, { recursive: true });
        await page.screenshot({ path: join(process.env.PREVIEW_DIR, 'card-library-empty.png'), fullPage: true });
      }
      await page.getByLabel('匯入遊戲套件').setInputFiles(join(repoRoot, 'app/examples/astral-garden.json'));
      await page.getByRole('button', { name: /晨光旅人/ }).click();
      await page.getByRole('heading', { name: '晨光旅人', exact: true }).waitFor();
      assert.equal(await page.getByRole('img', { name: '晨光旅人' }).last().evaluate(img => img.complete && img.naturalWidth > 0), true);
      await page.getByLabel('匯入遊戲套件').setInputFiles(join(repoRoot, 'app/examples/clockwork-harbor.json'));
      await page.getByRole('button', { name: /發條信使/ }).click();
      await page.getByRole('heading', { name: '發條信使', exact: true }).waitFor();
      await page.getByLabel('目前遊戲').selectOption('sample-astral-garden');
      await page.getByRole('button', { name: /晨光旅人/ }).waitFor();
      assert.equal(await page.getByRole('button', { name: /發條信使/ }).count(), 0);
      await context.close();
      context = await chromium.launchPersistentContext(profile, { channel, headless: true });
      page = await context.newPage();
      await page.goto(baseURL);
      await page.getByRole('button', { name: /晨光旅人/ }).click();
      await page.getByRole('heading', { name: '晨光旅人', exact: true }).waitFor();
      assert.equal(await page.getByLabel('目前遊戲').inputValue(), 'sample-astral-garden');
      await page.getByLabel('目前遊戲').selectOption('sample-clockwork-harbor');
      await page.getByRole('button', { name: /發條信使/ }).click();
      await page.getByRole('heading', { name: '發條信使', exact: true }).waitFor();
      assert.equal(await page.getByRole('img', { name: '發條信使' }).last().evaluate(img => img.complete && img.naturalWidth > 0), true);
      assert.deepEqual(errors, []);
      if (process.env.PREVIEW_DIR && channel === 'chrome') {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: join(process.env.PREVIEW_DIR, 'card-library-loaded.png'), fullPage: true });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: join(process.env.PREVIEW_DIR, 'card-library-narrow.png'), fullPage: true });
      }
    } finally {
      await context?.close();
      assert.ok(resolve(profile).startsWith(testTemporaryRoot + sep));
      await rm(profile, { recursive: true, force: true });
    }
  });

  test(`${channel}：無效檔案不影響既有卡表，也可重新選取同一套件`, async () => {
    const profile = await mkdtemp(join(testTemporaryRoot, `${channel}-`));
    let context;
    try {
      context = await chromium.launchPersistentContext(profile, { channel, headless: true });
      const page = await context.newPage();
      await page.goto(baseURL);
      await page.locator('input[aria-label="匯入遊戲套件"]:enabled').waitFor({ state: 'attached' });
      await page.getByLabel('匯入遊戲套件').setInputFiles(join(repoRoot, 'app/examples/astral-garden.json'));
      await page.getByRole('button', { name: /晨光旅人/ }).waitFor();
      await page.getByLabel('匯入遊戲套件').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
      await page.getByRole('status').filter({ hasText: '無法讀取 JSON' }).waitFor();
      await page.getByRole('button', { name: /晨光旅人/ }).click();
      await page.getByRole('heading', { name: '晨光旅人', exact: true }).waitFor();
      await page.getByLabel('匯入遊戲套件').setInputFiles(join(repoRoot, 'app/examples/astral-garden.json'));
      await page.getByRole('status').filter({ hasText: '已安裝' }).waitFor();
      await page.reload();
      await page.getByRole('button', { name: /晨光旅人/ }).waitFor();
      assert.equal(await page.getByLabel('目前遊戲').locator('option').count(), 1);
    } finally {
      await context?.close();
      assert.ok(resolve(profile).startsWith(testTemporaryRoot + sep));
      await rm(profile, { recursive: true, force: true });
    }
  });
}
