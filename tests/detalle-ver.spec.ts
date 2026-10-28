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

test.describe('CU-16 Ver detalle de una solicitud', () => {
  test('muestra detalle con todos los campos', async ({ page }) => {
    await loginAsAlumno(page);

    await page.getByTestId('view-req-001').click();
    await expect(page.getByTestId('request-detail')).toBeVisible();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('detail-id')).toBeVisible();
    await expect(page.getByTestId('detail-title')).toBeVisible();
    await expect(page.getByTestId('detail-description')).toBeVisible();
    await expect(page.getByTestId('detail-category')).toBeVisible();
    await expect(page.getByTestId('detail-priority')).toBeVisible();
    await expect(page.getByTestId('detail-status')).toBeVisible();
    await expect(page.getByTestId('detail-created-at')).toBeVisible();
    await expect(page.getByTestId('detail-updated-at')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
