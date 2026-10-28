import { test, expect } from '@playwright/test';

test.describe('CU-04 Login con credenciales incorrectas', () => {
  test('ambas credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    await page.getByTestId('login-username').fill('otro');
    await page.waitForTimeout(600);
    await page.getByTestId('login-password').fill('incorrecta');
    await page.waitForTimeout(600);

    await page.getByTestId('login-button').click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText('Usuario o contraseña incorrectos.');
    await page.waitForTimeout(1500);
  });

  test('solo contraseña incorrecta', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    await page.getByTestId('login-username').fill('alumno');
    await page.waitForTimeout(600);
    await page.getByTestId('login-password').fill('contraseñaincorrecta');
    await page.waitForTimeout(600);

    await page.getByTestId('login-button').click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText('Usuario o contraseña incorrectos.');
    await page.waitForTimeout(1500);
  });

  test('solo usuario incorrecto', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    await page.getByTestId('login-username').fill('usuarioerroneo');
    await page.waitForTimeout(600);
    await page.getByTestId('login-password').fill('Playwright123');
    await page.waitForTimeout(600);

    await page.getByTestId('login-button').click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText('Usuario o contraseña incorrectos.');
    await page.waitForTimeout(1500);
  });
});
