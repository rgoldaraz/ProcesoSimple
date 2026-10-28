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

test.describe('CU-14 Validación al crear', () => {
  test('campos vacíos muestran errores', async ({ page }) => {
    await loginAsAlumno(page);
    await page.getByTestId('new-request-button').click();
    await expect(page.getByTestId('new-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('save-button').click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('title-error')).toBeVisible();
    await expect(page.getByTestId('description-error')).toBeVisible();
    await expect(page.getByTestId('category-error')).toBeVisible();
    await expect(page.getByTestId('priority-error')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
