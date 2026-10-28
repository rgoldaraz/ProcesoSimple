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

test.describe('CU-08 Búsqueda + filtro combinados', () => {
  test('muestra mensaje vacío si no hay coincidencias', async ({ page }) => {
    await loginAsAlumno(page);

    await page.getByTestId('status-filter').selectOption('Completada');
    await page.waitForTimeout(800);
    await page.getByTestId('search-input').fill('zzzzzzsincoincidencia');
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('empty-message')).toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('caso de éxito: crea solicitud, busca nombre erróneo, borra con X y busca nombre correcto', async ({ page }) => {
    await loginAsAlumno(page);

    await page.getByTestId('new-request-button').click();
    await expect(page.getByTestId('new-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('field-title').fill('PruebaBusquedaCombinada');
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill('Descripción para probar búsqueda y filtro combinados.');
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption('Técnico');
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption('Alta');
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await page.getByTestId('status-filter').selectOption('Pendiente');
    await page.waitForTimeout(1000);

    await page.getByTestId('search-input').fill('nombreerroneo');
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('empty-message')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('search-input').clear();
    await page.waitForTimeout(1000);

    await page.getByTestId('search-input').fill('pruebabusqueda');
    await page.waitForTimeout(1500);

    const rows = page.getByTestId('request-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.getByTestId('request-title')).toHaveText('PruebaBusquedaCombinada');
    await page.waitForTimeout(1500);
  });
});
