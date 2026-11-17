import { test, expect, type Page } from '@playwright/test';

// Datos para la prueba de persistencia.
const URL_LOGIN = '/login';
const CREDENCIALES = { usuario: 'alumno', password: 'Playwright123' };
const SOLICITUD_PERSISTENTE = {
  titulo: 'Persistencia E2E',
  descripcion: 'Descripción para probar persistencia tras recarga.',
  categoria: 'General',
  prioridad: 'Baja',
};

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

test.describe('Persistencia en localStorage', () => {
  // Prerrequisito: sesión iniciada con datos limpios antes de cada test.
  test.beforeEach(async ({ page }) => {
    await prepararSesion(page);
  });

  test('CU-24 Los cambios persisten tras recargar la página', async ({ page }) => {
    await page.getByTestId('new-request-button').click();
    await expect(page.getByTestId('new-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('field-title').fill(SOLICITUD_PERSISTENTE.titulo);
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill(SOLICITUD_PERSISTENTE.descripcion);
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption(SOLICITUD_PERSISTENTE.categoria);
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption(SOLICITUD_PERSISTENTE.prioridad);
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await page.reload();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('request-row').filter({ hasText: SOLICITUD_PERSISTENTE.titulo })).toHaveCount(1);
    await page.waitForTimeout(1500);
  });
});
