import { test, expect, type Page } from '@playwright/test';

// Datos para la vista de detalle.
const URL_LOGIN = '/login';
const CREDENCIALES = { usuario: 'alumno', password: 'Playwright123' };
const ID_DETALLE = 'req-001';
const ID_NO_EXISTENTE = 'NOEXISTE123';
const CAMPOS_DETALLE = [
  'detail-id',
  'detail-title',
  'detail-description',
  'detail-category',
  'detail-priority',
  'detail-status',
  'detail-created-at',
  'detail-updated-at',
];

// Limpia el almacenamiento del navegador para que los tests no se mezclen datos.
async function limpiarAlmacenamiento(page: Page) {
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

// Prerrequisito común: login abierto, almacenamiento limpio y sesión iniciada.
async function prepararSesion(page: Page) {
  await page.goto(URL_LOGIN);
  await page.waitForTimeout(800);
  await limpiarAlmacenamiento(page);
  await page.getByTestId('login-username').fill(CREDENCIALES.usuario);
  await page.waitForTimeout(600);
  await page.getByTestId('login-password').fill(CREDENCIALES.password);
  await page.waitForTimeout(600);
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('dashboard')).toBeVisible();
  await page.waitForTimeout(1000);
}

test.describe('Detalle de solicitudes', () => {
  // Prerrequisito: sesión iniciada con datos limpios antes de cada test.
  test.beforeEach(async ({ page }) => {
    await prepararSesion(page);
  });

  test('CU-16 Ver detalle: muestra todos los campos', async ({ page }) => {
    await page.getByTestId(`view-${ID_DETALLE}`).click();
    await expect(page.getByTestId('request-detail')).toBeVisible();
    await page.waitForTimeout(1000);

    for (const campo of CAMPOS_DETALLE) {
      await expect(page.getByTestId(campo)).toBeVisible();
    }
    await page.waitForTimeout(1500);
  });

  test('CU-23 Solicitud no encontrada: pantalla de error en detalle y edición', async ({ page }) => {
    await page.goto(`/solicitudes/${ID_NO_EXISTENTE}`);
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('request-not-found')).toBeVisible();
    await expect(page.getByTestId('back-to-list')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.goto(`/solicitudes/${ID_NO_EXISTENTE}/editar`);
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('request-not-found')).toBeVisible();
    await expect(page.getByTestId('back-to-list')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
