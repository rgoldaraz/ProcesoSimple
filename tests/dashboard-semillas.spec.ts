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

test.describe('CU-05 Visualización inicial con semillas', () => {
  test('muestra 5 filas con req-001 a req-005', async ({ page }) => {
    await loginAsAlumno(page);

    await expect(page.getByTestId('requests-table')).toBeVisible();
    await expect(page.getByTestId('request-row')).toHaveCount(5);
    await page.waitForTimeout(800);

    await expect(page.locator('tr[data-id="req-001"]')).toBeVisible();
    await expect(page.locator('tr[data-id="req-002"]')).toBeVisible();
    await expect(page.locator('tr[data-id="req-003"]')).toBeVisible();
    await expect(page.locator('tr[data-id="req-004"]')).toBeVisible();
    await expect(page.locator('tr[data-id="req-005"]')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
