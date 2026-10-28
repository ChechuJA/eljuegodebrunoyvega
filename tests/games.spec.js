import { test, expect } from '@playwright/test';

test.describe('Bruno y Vega Games', () => {
  test('main page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/El juego de Bruno y Vega/);
    await expect(page.locator('#menu h2')).toContainText('Elige tu juego');
  });

  test('player name input works', async ({ page }) => {
    await page.goto('/');
    
    // Should show name overlay if no name stored
    const nameInput = page.locator('#playerNameInput');
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      await page.locator('#savePlayerNameBtn').click();
    }
    
    // Check player name is displayed
    await expect(page.locator('#currentPlayerName')).toContainText(/TestPlayer|Jugador/);
  });

  test('games can be loaded', async ({ page }) => {
    await page.goto('/');
    
    // Set player name if needed
    const nameInput = page.locator('#playerNameInput');
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      await page.locator('#savePlayerNameBtn').click();
    }

    // Test loading a simple game
    await page.locator('button[onclick*="4enraya"]').click();
    
    // Should hide menu and show game area
    await expect(page.locator('#menu')).toBeHidden();
    await expect(page.locator('#gameArea')).toBeVisible();
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('multiplayer ping pong requests player names and loads', async ({ page }) => {
    await page.goto('/');
    
    // Set player name if needed
    const nameInput = page.locator('#playerNameInput');
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      await page.locator('#savePlayerNameBtn').click();
    }

    const prompts = [];
    page.on('dialog', async dialog => {
      prompts.push(dialog.message());
      await dialog.accept('Jugador de prueba');
    });

    const pingPongButton = page.locator('button[onclick*="ping-pong"]');
    await expect(pingPongButton).toBeVisible();
    await pingPongButton.click();
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
    await canvas.focus();
    await page.keyboard.press('Space');
    await expect.poll(() => prompts.length).toBe(2);
    await expect(page.locator('#menu')).toBeHidden();
  });

  test('multiplayer football game loads and starts', async ({ page }) => {
    await page.goto('/');

    const nameInput = page.locator('#playerNameInput');
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      await page.locator('#savePlayerNameBtn').click();
    }

    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.locator('button[onclick*="futbol"]').click();
    await expect(page.locator('#gameArea')).toBeVisible();
    await expect(page.locator('#gameCanvas')).toBeVisible();
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toHaveAttribute('aria-label', /Fútbol 7.*Almudena, de negro/);
    const roster = await canvas.getAttribute('aria-label');
    const captains = [...roster.matchAll(/([A-Za-z]+) \(Portero y capitán\)/g)].map(([, name]) => name).sort();
    expect(captains).toEqual(['Julia', 'Mateo']);
    await expect(canvas).toHaveAttribute('aria-label', /elige jugar dos personas o CPU 1 contra CPU 2/);
    await canvas.focus();
    await page.keyboard.press('Space');
    await expect(canvas).toHaveAttribute('aria-label', /Partido de fútbol 7 en curso/);
    await expect(canvas).toHaveAttribute('aria-label', /máximo 3 minutos o 5 goles/);
    await page.waitForTimeout(100);
    expect(pageErrors).toEqual([]);
  });

  test('football CPU mode starts an automatic match', async ({ page }) => {
    await page.goto('/');

    const nameInput = page.locator('#playerNameInput');
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      await page.locator('#savePlayerNameBtn').click();
    }

    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.locator('button[onclick*="futbol"]').click();
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toHaveAttribute('aria-label', /elige jugar dos personas o CPU 1 contra CPU 2/);
    await canvas.focus();
    await page.keyboard.press('2');
    await expect(canvas).toHaveAttribute('aria-label', /CPU 1 contra CPU 2/);
    await page.waitForTimeout(100);
    expect(pageErrors).toEqual([]);
  });

  test('back to menu works', async ({ page }) => {
    await page.goto('/');
    
    // Set player name if needed  
    const nameInput = page.locator('#playerNameInput');
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      await page.locator('#savePlayerNameBtn').click();
    }

    // Load a game
    await page.locator('button[onclick*="4enraya"]').click();
    await expect(page.locator('#gameArea')).toBeVisible();
    
    // Go back to menu
    await page.locator('#menuBtn').click();
    await expect(page.locator('#menu')).toBeVisible();
    await expect(page.locator('#gameArea')).toBeHidden();
  });

  test('climate action section exists', async ({ page }) => {
    await page.goto('/');
    
    // Check Climate Action section header
    await expect(page.locator('text=No dejes que vuelva a ocurrir - Acción por el Clima')).toBeVisible();
  });

  test('all climate action games can be loaded', async ({ page }) => {
    await page.goto('/');
    
    // Set player name if needed
    const nameInput = page.locator('#playerNameInput');
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      await page.locator('#savePlayerNameBtn').click();
    }

    const ecogames = ['salva-costa', 'bosque-verde', 'aire-limpio', 'energia-sabia', 'planeta-azul'];
    
    for (const game of ecogames) {
      // Load the game
      await page.locator(`button[onclick*="${game}"]`).click();
      
      // Should show game area
      await expect(page.locator('#gameArea')).toBeVisible();
      await expect(page.locator('#gameCanvas')).toBeVisible();
      
      // Go back to menu
      await page.locator('#menuBtn').click();
      await expect(page.locator('#menu')).toBeVisible();
    }
  });

  test('teclado rapido game loads', async ({ page }) => {
    await page.goto('/');

    // Set player name if needed
    const nameInput = page.locator('#playerNameInput');
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      await page.locator('#savePlayerNameBtn').click();
    }

    // Click the Teclado Rápido button
    await page.locator('button[onclick*="teclado-rapido"]').click();

    // Should hide menu and show game area
    await expect(page.locator('#menu')).toBeHidden();
    await expect(page.locator('#gameArea')).toBeVisible();
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });
});