import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('playerName', 'Jugador de prueba'));
});

test('geometric runner starts, pauses, resumes and restarts', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Entrena tu teclado' })).toBeVisible();
  await page.locator('button[onclick*="geometria-espacio"]').click();

  const canvas = page.locator('#gameCanvas');
  await expect(canvas).toHaveAttribute('aria-label', /Pulsa espacio para empezar/);
  const canvasBounds = await canvas.boundingBox();
  expect(canvasBounds.width).toBeGreaterThanOrEqual(640);
  expect(canvasBounds.width / canvasBounds.height).toBeCloseTo(1.6, 1);
  await canvas.focus();
  await page.keyboard.press('Space');
  await expect(canvas).toHaveAttribute('aria-label', /Nivel 1: Formas amigas/);

  await page.keyboard.press('Escape');
  await expect(canvas).toHaveAttribute('aria-label', /pausa/);
  await page.keyboard.press('Space');
  await expect(canvas).toHaveAttribute('aria-label', /Nivel 1: Formas amigas/);

  await page.locator('#restartBtn').click();
  await expect(canvas).toHaveAttribute('aria-label', /Pulsa espacio para empezar/);
});

test('typing practice accepts the displayed word and pauses without losing progress', async ({ page }) => {
  await page.goto('/');
  await page.locator('button[onclick*="mecanografia"]').click();

  const canvas = page.locator('#gameCanvas');
  await expect(canvas).toHaveAttribute('aria-label', /Pulsa espacio para empezar/);
  await canvas.focus();
  await page.keyboard.press('Space');

  const label = await canvas.getAttribute('aria-label');
  const word = label.match(/Palabra: ([a-z]+)/i)?.[1];
  expect(word).toBeTruthy();
  await page.keyboard.type(word);
  await expect(canvas).toHaveAttribute('aria-label', /Llevas 1 palabras/);

  await page.keyboard.press('Escape');
  await expect(canvas).toHaveAttribute('aria-label', /en pausa/);
  await page.keyboard.press('Space');
  await expect(canvas).toHaveAttribute('aria-label', /Palabra:/);
});
