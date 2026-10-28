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

test.describe('CU-19 Cancelar edición', () => {
  test('vuelve sin guardar cambios', async ({ page }) => {
    await loginAsAlumno(page);
    await page.getByTestId('edit-req-002').click();
    await expect(page.getByTestId('edit-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('field-title').fill('NO_DEBE_GUARDARSE');
    await page.waitForTimeout(600);

    await page.getByTestId('cancel-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
