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

test.describe('CU-20 Eliminar desde listado', () => {
  test('elimina con confirmación', async ({ page }) => {
    await loginAsAlumno(page);

    const countBefore = await page.getByTestId('request-row').count();
    await page.waitForTimeout(800);

    await page.getByTestId('delete-req-005').click();
    await page.waitForTimeout(1000);

    const confirmButtons = page.locator('button:has-text("Eliminar")');
    await expect(confirmButtons.last()).toBeVisible();
    await confirmButtons.last().click();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('request-row')).toHaveCount(countBefore - 1);
    await page.waitForTimeout(1500);
  });
});
