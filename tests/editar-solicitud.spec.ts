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

test.describe('CU-17 Editar solicitud', () => {
  test('edita y vuelve a detalle con mensaje', async ({ page }) => {
    await loginAsAlumno(page);

    await page.getByTestId('edit-req-001').click();
    await expect(page.getByTestId('edit-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('field-title').fill('Título editado E2E');
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill('Descripción editada con más de diez caracteres para la prueba.');
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption('Acceso');
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption('Media');
    await page.waitForTimeout(600);
    await page.getByTestId('field-status').selectOption('En progreso');
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('request-detail')).toBeVisible();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('detail-title')).toHaveText('Título editado E2E');
    await page.waitForTimeout(1500);
  });
});
