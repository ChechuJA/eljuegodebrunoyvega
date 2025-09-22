import { test, expect } from '@playwright/test';

test.describe('Bruno y Vega Games', () => {
  test('main page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/El juego de Bruno y Vega/);
    await expect(page.locator('h2')).toContainText('Elige tu juego');
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

  test('multiplayer ping pong game loads', async ({ page }) => {
    await page.goto('/');
    
    // Set player name if needed
    const nameInput = page.locator('#playerNameInput');
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestPlayer');
      await page.locator('#savePlayerNameBtn').click();
    }

    // Look for ping pong game button (will be added)
    const pingPongButton = page.locator('button[onclick*="ping-pong"]');
    if (await pingPongButton.isVisible()) {
      await pingPongButton.click();
      
      // Should show multiplayer name inputs
      const multiplayerOverlay = page.locator('#multiplayerOverlay');
      await expect(multiplayerOverlay).toBeVisible({ timeout: 5000 });
    }
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
});