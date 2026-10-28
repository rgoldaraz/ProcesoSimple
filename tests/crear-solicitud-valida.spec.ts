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

test.describe('CU-12/CU-13 Crear solicitud válida', () => {
  test('crear solicitud desde nueva y aparece en listado', async ({ page }) => {
    await loginAsAlumno(page);

    await page.getByTestId('new-request-button').click();
    await expect(page.getByTestId('new-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('field-title').fill('Solicitud de prueba E2E');
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill('Esta es una descripción de prueba con más de diez caracteres.');
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption('Técnico');
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption('Alta');
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('request-row').filter({ hasText: 'Solicitud de prueba E2E' })).toHaveCount(1);
    await page.waitForTimeout(1500);
  });
});
