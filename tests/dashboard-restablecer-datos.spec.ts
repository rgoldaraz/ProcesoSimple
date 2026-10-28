import { test, expect, type Page } from '@playwright/test';

async function loginAsAlumno(page: Page) {
  await page.goto('/login');
  await page.waitForTimeout(800);
  await page.getByTestId('login-username').fill('alumno');
  await page.waitForTimeout(600);
  await page.getByTestId('login-password').fill('Playwright123');
  await page.waitForTimeout(600);
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('dashboard')).toBeVisible();
  await page.waitForTimeout(1000);
}

test.describe('CU-10 Restablecer datos de prueba', () => {
  test('restablece semillas sin cerrar sesión', async ({ page }) => {
    await loginAsAlumno(page);

    await page.getByTestId('reset-data-button').click();
    await page.waitForTimeout(1000);

    await page.getByTestId('reset-data-button').click();
    await page.waitForTimeout(1000);

    const confirmButtons = page.locator('button:has-text("Restablecer")');
    await expect(confirmButtons.last()).toBeVisible();
    await confirmButtons.last().click();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('requests-table')).toBeVisible();
    await expect(page.getByTestId('request-row')).toHaveCount(5);
    await expect(page.locator('tr[data-id="req-001"]')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
