import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setContent('<canvas id="gameCanvas" tabindex="0"></canvas>');
  await page.evaluate(() => {
    const ctx = document.querySelector('canvas').getContext('2d');
    const translate = ctx.translate.bind(ctx);
    window.positions = [];
    ctx.translate = (x, y) => {
      window.positions.push({ x, y });
      translate(x, y);
    };
    window.requestAnimationFrame = callback => {
      window.nextFrame = callback;
      return 1;
    };
    window.cancelAnimationFrame = () => { window.nextFrame = null; };
    window.step = () => {
      window.positions = [];
      window.timestamp = (window.timestamp || 0) + 16.67;
      window.nextFrame(window.timestamp);
      return window.positions;
    };
  });
  await page.addScriptTag({ path: 'script-futbol.js' });
  await page.evaluate(() => { window.cleanupFootball = window.registerGame(); });
});

async function key(page, code, type = 'keydown', repeat = false) {
  await page.evaluate(({ code, type, repeat }) => {
    window.dispatchEvent(new KeyboardEvent(type, { code, repeat, cancelable: true }));
  }, { code, type, repeat });
}

async function frame(page) {
  return page.evaluate(() => window.step());
}

test('Ctrl switches each team to its nearest player', async ({ page }) => {
  await key(page, 'Space');
  await key(page, 'Space', 'keyup');
  for (const [control, movement, offset] of [
    ['ControlLeft', 'KeyW', 0],
    ['ControlRight', 'ArrowUp', 7]
  ]) {
    // Move the original forward away so the nearest teammate is a different player.
    await key(page, movement);
    for (let index = 0; index < 70; index += 1) await frame(page);
    await key(page, movement, 'keyup');
    const before = await frame(page);
    const ball = before[14];
    const players = before.slice(offset, offset + 7);
    const nearest = players.reduce((best, player, index) =>
      Math.hypot(player.x - ball.x, player.y - ball.y) <
      Math.hypot(players[best].x - ball.x, players[best].y - ball.y) ? index : best, 0);
    expect(nearest).not.toBe(6);
    await key(page, control);
    await key(page, movement);
    const after = await frame(page);
    expect(after[offset + nearest].y).toBeCloseTo(before[offset + nearest].y - 3.6, 5);
    await key(page, movement, 'keyup');
    // Holding Ctrl must not select another player as distances change.
    await key(page, control, 'keydown', true);
    const stable = await frame(page);
    expect(stable[offset + nearest]).toEqual(after[offset + nearest]);
    await key(page, control, 'keyup');
  }
});

test('Ctrl leaves CPU mode unchanged and cleanup removes its handlers', async ({ page }) => {
  await key(page, 'Digit2');
  await key(page, 'ControlLeft');
  await key(page, 'ControlRight');
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', /CPU 1 contra CPU 2/);
  await frame(page);
  await page.evaluate(() => window.cleanupFootball());
  const prevented = await page.evaluate(() => {
    const event = new KeyboardEvent('keydown', { code: 'ControlLeft', cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(prevented).toBe(false);
});
