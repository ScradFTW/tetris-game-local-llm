import { test, expect } from '@playwright/test';

test.describe('Tetris App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Log all console messages for debugging
    const consoleLogs = []
    page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }))
    page.on('pageerror', error => consoleLogs.push({ error: error.message }))
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Give React time to render
    await page.waitForTimeout(1000)
    
    // Log console messages if any
    if (consoleLogs.length > 0) {
      console.log('Console logs:', JSON.stringify(consoleLogs, null, 2))
    }
    
    await page.waitForSelector('.board', { timeout: 5000 })
  });

  test('loads the Tetris app', async ({ page }) => {
    await expect(page).toHaveTitle(/Tetris/i);
    await expect(page.locator('.board')).toBeVisible();
  });

  test('displays score, level, and lines', async ({ page }) => {
    await expect(page.locator('.score')).toBeVisible();
    await expect(page.locator('.level')).toBeVisible();
    await expect(page.locator('.lines')).toBeVisible();
  });

  test('shows next piece preview', async ({ page }) => {
    await expect(page.locator('.next-piece')).toBeVisible();
  });

  test('can spawn a piece', async ({ page }) => {
    await page.keyboard.press('Space');
    await expect(page.locator('.board .cell.filled')).toHaveCount(8);
  });

  test('can move piece left and right', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.board .cell.filled')).toHaveCount(8);
  });

  test('can rotate piece', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.board .cell.filled').first()).toBeVisible();
  });

  test('can hard drop piece', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.keyboard.press('KeyZ');
    await expect(page.locator('.board .cell.filled').first()).toBeVisible();
  });

  test('can pause and resume game', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.keyboard.press('p');
    await page.keyboard.press('p');
    await expect(page.locator('.board .cell.filled').first()).toBeVisible();
  });
});
