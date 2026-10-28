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

test.describe('CU-28 Estado inicial Pendiente al crear', () => {
  test('nueva solicitud queda en Pendiente', async ({ page }) => {
    await loginAsAlumno(page);
    await page.getByTestId('new-request-button').click();
    await expect(page.getByTestId('new-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('field-title').fill('Estado Inicial E2E');
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill('Comprobar estado inicial Pendiente.');
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption('Facturación');
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption('Alta');
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await page.getByTestId('request-row').filter({ hasText: 'Estado Inicial E2E' }).getByRole('button', { name: 'Ver' }).click();
    await expect(page.getByTestId('request-detail')).toBeVisible();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('detail-status')).toContainText('Pendiente');
    await page.waitForTimeout(1500);
  });
});
