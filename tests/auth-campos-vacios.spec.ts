import { test, expect } from '@playwright/test';

test.describe('CU-03 Login con campos vacíos', () => {
  test('muestra errores de obligatorios', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    await page.getByTestId('login-button').click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('username-error')).toBeVisible();
    await expect(page.getByTestId('username-error')).toHaveText('El usuario es obligatorio.');
    await expect(page.getByTestId('password-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toHaveText('La contraseña es obligatoria.');
    await page.waitForTimeout(1500);
  });
});
