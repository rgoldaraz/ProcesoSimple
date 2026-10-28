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

test.describe('CU-23 Solicitud no encontrada', () => {
  test('muestra pantalla de no encontrada en detalle y edición', async ({ page }) => {
    await loginAsAlumno(page);

    await page.goto('/solicitudes/NOEXISTE123');
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('request-not-found')).toBeVisible();
    await expect(page.getByTestId('back-to-list')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.goto('/solicitudes/NOEXISTE123/editar');
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('request-not-found')).toBeVisible();
    await expect(page.getByTestId('back-to-list')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
