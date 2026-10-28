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

test.describe('CU-18 Validación al editar', () => {
  test('muestra errores al guardar con datos inválidos', async ({ page }) => {
    await loginAsAlumno(page);
    await page.getByTestId('edit-req-001').click();
    await expect(page.getByTestId('edit-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('field-title').fill('abcd');
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill('corto');
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption('');
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption('');
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('title-error')).toBeVisible();
    await expect(page.getByTestId('description-error')).toBeVisible();
    await expect(page.getByTestId('category-error')).toBeVisible();
    await expect(page.getByTestId('priority-error')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
