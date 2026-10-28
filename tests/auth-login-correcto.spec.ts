import { test, expect } from '@playwright/test';

test.describe('CU-01 Acceso con credenciales correctas', () => {
  test('iniciar sesión redirige al dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    await page.getByTestId('login-username').fill('alumno');
    await page.waitForTimeout(600);
    await page.getByTestId('login-password').fill('Playwright123');
    await page.waitForTimeout(600);

    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('new-request-button')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
