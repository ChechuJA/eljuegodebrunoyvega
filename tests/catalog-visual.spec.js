import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const entries = [...html.matchAll(/'([^']+)':'(script-[^']+\.js)'/g)]
  .map(([, id, file]) => ({ id, file }));
const catalog = entries.filter(({ file }) => fs.existsSync(file));
const retired = entries.filter(({ file }) => !fs.existsSync(file));

async function prepare(page, prefix = '/') {
  await page.addInitScript(() => localStorage.setItem('playerName', 'Prueba gráfica'));
  await page.goto(prefix);
  await page.waitForFunction(() => window.GameUI?.scenery);
  page.on('dialog', dialog => dialog.accept('Prueba'));
}

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', r => {
    if (!r.failure()?.errorText.includes('ERR_ABORTED')) errors.push(r.url() + ': ' + r.failure()?.errorText);
  });
  return errors;
}

test('inventario: todas las entradas existentes tienen arte explícito', async () => {
  expect(catalog).toHaveLength(39);
  expect(retired.map(e => e.id).sort()).toEqual(['experimento-3d', 'experimento-3d-terreno']);
  const buttons = [...html.matchAll(/onclick="startGame\('([^']+)'\)"/g)].map(m => m[1]);
  expect(buttons.every(id => catalog.some(e => e.id === id))).toBe(true);
  for (const { id, file } of catalog) {
    const source = fs.readFileSync(file, 'utf8');
    expect(source, file).toContain(id === 'futbol' ? 'Grada de barrio original' : `scenery(ctx, '${id}')`);
  }
});

for (const { id } of catalog) {
  test(`carga y render: ${id}`, async ({ page }, testInfo) => {
    const errors = collectErrors(page);
    await prepare(page, '/coleccion/');
    // Espía de la API propia, nunca se intercepta Canvas ni sus prototipos.
    await page.evaluate(() => {
      window.artCalls = [];
      const scenery = GameUI.scenery;
      GameUI.scenery = (...args) => { window.artCalls.push(args[1]); return scenery(...args); };
    });
    await page.evaluate(id => startGame(id), id);
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await page.waitForTimeout(250);
    // Activar tanto juegos con Enter como los de Espacio. No certifica una partida completa.
    await page.locator('#gameCanvas').focus();
    await page.keyboard.press(id === 'futbol' ? '2' : 'Enter');
    await page.keyboard.press('Space');
    await page.waitForTimeout(250);
    if (id !== 'futbol') await expect.poll(() => page.evaluate(() => window.artCalls.length)).toBeGreaterThan(0);
    const colors = await page.evaluate(() => {
      const c = document.getElementById('gameCanvas');
      const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      const values = new Set();
      for (let i = 0; i < data.length; i += 160) values.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
      return values.size;
    });
    expect(colors).toBeGreaterThan(12);
    await testInfo.attach(id, { body: await page.locator('#gameCanvas').screenshot(), contentType: 'image/png' });
    await page.locator('#menuBtn').click();
    await expect(page.locator('#menu')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('catálogo completo: navegar, reiniciar y salir dos veces sin dibujos residuales', async ({ page }) => {
  test.setTimeout(180000);
  const errors = collectErrors(page);
  await prepare(page);
  for (let pass = 0; pass < 2; pass++) {
    for (const { id } of catalog) {
      await page.evaluate(id => startGame(id), id);
      await page.waitForTimeout(70);
      await page.locator('#gameCanvas').focus();
      await page.keyboard.press(id === 'futbol' ? '2' : 'Enter');
      await page.keyboard.press('Space');
      await page.evaluate(() => restartGame());
      await page.waitForTimeout(70);
      await page.evaluate(() => goBack());
      // Si sigue vivo un bucle anterior, vuelve a pintar sobre este lienzo vacío.
      await page.waitForTimeout(80);
      expect.soft(await page.evaluate(() => {
        const c = document.getElementById('gameCanvas');
        return c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some(value => value !== 0);
      }), `${id}, pasada ${pass}: bucle residual`).toBe(false);
    }
  }
  expect(errors).toEqual([]);
});

test('lámina visual de los 39 juegos y tablero de ajedrez', async ({ page }, testInfo) => {
  test.setTimeout(120000);
  const errors = collectErrors(page);
  await prepare(page);
  const images = [];
  for (const { id } of catalog) {
    await page.evaluate(id => startGame(id), id);
    await page.waitForTimeout(100);
    await page.locator('#gameCanvas').focus();
    if (id === 'ajedrez') {
      const box = await page.locator('#gameCanvas').boundingBox();
      const size = await page.locator('#gameCanvas').evaluate(c => ({ w: c.width, h: c.height }));
      await page.mouse.click(box.x + box.width / 2, box.y + 220 * box.height / size.h);
    } else {
      await page.keyboard.press(id === 'futbol' ? '2' : 'Enter');
      await page.keyboard.press('Space');
    }
    await page.waitForTimeout(100);
    images.push({ id, url: await page.locator('#gameCanvas').evaluate(c => c.toDataURL()) });
    await page.evaluate(() => goBack());
  }
  await page.evaluate(async images => {
    const gallery = document.createElement('canvas');
    gallery.id = 'visualGallery'; gallery.width = 1200; gallery.height = Math.ceil(images.length / 4) * 215;
    const ctx = gallery.getContext('2d');
    ctx.fillStyle = '#142333'; ctx.fillRect(0, 0, gallery.width, gallery.height);
    for (let i = 0; i < images.length; i++) {
      const image = new Image(); image.src = images[i].url; await image.decode();
      const x = i % 4 * 300, y = Math.floor(i / 4) * 215;
      ctx.drawImage(image, x + 5, y + 27, 290, 181);
      ctx.font = '15px sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(images[i].id, x + 7, y + 20);
    }
    document.body.replaceChildren(gallery);
  }, images);
  await page.locator('#visualGallery').screenshot({ path: testInfo.outputPath('catalog-gallery.png') });
  await testInfo.attach('39 juegos', { path: testInfo.outputPath('catalog-gallery.png'), contentType: 'image/png' });
  expect(errors).toEqual([]);
});

test('arte determinista, aislado y adaptable, sin recursos externos', async ({ page }) => {
  await prepare(page);
  const results = await page.evaluate(() => {
    return Object.keys(GameUI.sceneThemes).map(id => {
      const c = document.createElement('canvas'); c.width = 480; c.height = 300;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#123456'; ctx.globalAlpha = 0.75; ctx.lineWidth = 7;
      GameUI.scenery(ctx, id);
      const a = c.toDataURL();
      ctx.clearRect(0, 0, 480, 300); GameUI.scenery(ctx, id);
      return { id, same: a === c.toDataURL(), isolated: ctx.fillStyle === '#123456' && ctx.globalAlpha === 0.75 && ctx.lineWidth === 7 };
    });
  });
  expect(results.every(r => r.same && r.isolated)).toBe(true);
});
