import { test, expect, type Page } from '@playwright/test';

const TARGET_TITLE = 'Error al iniciar sesión';

// Inicia sesión y deja el listado visible (sin restablecer datos de prueba).
async function prepareListOn(page: Page) {
  // Abre la aplicación y muestra el formulario de inicio de sesión.
  await page.goto('/');
  await page.waitForTimeout(1000);

  // Rellena las credenciales de demostración.
  await page.getByTestId('login-username').fill('alumno');
  await page.waitForTimeout(600);
  await page.getByTestId('login-password').fill('Playwright123');
  await page.waitForTimeout(600);

  // Inicia sesión y espera al listado.
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('dashboard')).toBeVisible();
  await page.waitForTimeout(1000);
}

// Comprueba si existe el registro objetivo; si no, lo crea desde "Nueva solicitud".
async function ensureRequestExists(page: Page) {
  const matchingRow = page.getByTestId('request-row').filter({ hasText: TARGET_TITLE });
  if (await matchingRow.count() > 0) {
    await page.waitForTimeout(800);
    return;
  }

  // No existe: se navega al formulario de creación.
  await page.getByTestId('new-request-button').click();
  await expect(page.getByTestId('new-request-page')).toBeVisible();
  await page.waitForTimeout(1000);

  // Se rellena el formulario con el registro objetivo.
  await page.getByTestId('field-title').fill(TARGET_TITLE);
  await page.waitForTimeout(600);
  await page
    .getByTestId('field-description')
    .fill('Registro creado automáticamente por el test al no existir en los datos iniciales.');
  await page.waitForTimeout(600);
  await page.getByTestId('field-category').selectOption('Técnico');
  await page.waitForTimeout(600);
  await page.getByTestId('field-priority').selectOption('Alta');
  await page.waitForTimeout(600);

  // Guarda y vuelve al listado.
  await page.getByTestId('save-button').click();
  await expect(page.getByTestId('dashboard')).toBeVisible();
  await page.waitForTimeout(1500);

  // Confirmación de que ya existe el registro objetivo.
  await expect(page.getByTestId('request-row').filter({ hasText: TARGET_TITLE })).toHaveCount(1);
  await page.waitForTimeout(800);
}

test.describe('Buscar por título en el listado de solicitudes', () => {
  test.beforeEach(async ({ page }) => {
    await prepareListOn(page);
    await ensureRequestExists(page);
  });

  test('buscar "error" muestra solo la solicitud "Error al iniciar sesión"', async ({ page }) => {
    // Escribe "error" en el buscador por título.
    await page.getByTestId('search-input').fill('error');
    await page.waitForTimeout(1500);

    // Comprueba que solo queda una fila en la tabla.
    const rows = page.getByTestId('request-row');
    await expect(rows).toHaveCount(1);

    // Comprueba que el título de esa fila es el esperado.
    await expect(rows.getByTestId('request-title')).toHaveText(TARGET_TITLE);
    await page.waitForTimeout(1500);
  });
});
