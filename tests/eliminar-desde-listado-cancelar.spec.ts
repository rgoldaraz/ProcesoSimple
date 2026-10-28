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

test.describe('CU-21 Cancelar eliminación desde listado', () => {
  test('no elimina al cancelar', async ({ page }) => {
    await loginAsAlumno(page);
    await expect(page.getByTestId('request-row')).toHaveCount(5);
    await page.waitForTimeout(800);

    await page.getByTestId('delete-req-004').click();
    await page.waitForTimeout(1000);

    const cancelButtons = page.locator('button:has-text("Cancelar")');
    await expect(cancelButtons.last()).toBeVisible();
    await cancelButtons.last().click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('request-row')).toHaveCount(5);
    await page.waitForTimeout(1500);
  });
});
