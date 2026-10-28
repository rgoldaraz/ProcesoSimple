import { test, expect } from '@playwright/test';

test.describe('CU-02 Redirección si ya hay sesión activa', () => {
  test('ir a /login con sesión activa redirige a /', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    await page.getByTestId('login-username').fill('alumno');
    await page.waitForTimeout(600);
    await page.getByTestId('login-password').fill('Playwright123');
    await page.waitForTimeout(600);

    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.goto('/login');
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('login-form')).not.toBeVisible();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
