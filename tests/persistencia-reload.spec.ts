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

test.describe('CU-24 Persistencia en localStorage', () => {
  test('los cambios persisten tras recarga', async ({ page }) => {
    await loginAsAlumno(page);

    await page.getByTestId('new-request-button').click();
    await expect(page.getByTestId('new-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('field-title').fill('Persistencia E2E');
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill('Descripción para probar persistencia tras recarga.');
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption('General');
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption('Baja');
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await page.reload();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('request-row').filter({ hasText: 'Persistencia E2E' })).toHaveCount(1);
    await page.waitForTimeout(1500);
  });
});
