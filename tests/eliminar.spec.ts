import { test, expect, type Page } from '@playwright/test';

// Datos para eliminar solicitudes.
const URL_LOGIN = '/login';
const CREDENCIALES = { usuario: 'alumno', password: 'Playwright123' };
const FILAS_SEMILLA = 5;
const ID_ELIMINAR = 'req-005';
const ID_CANCELAR = 'req-004';
const ID_DETALLE = 'req-003';
const BOTON_CONFIRMAR_ELIMINAR = 'button:has-text("Eliminar")';
const BOTON_CANCELAR = 'button:has-text("Cancelar")';

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

test.describe('Eliminar solicitudes', () => {
  // Prerrequisito: sesión iniciada con datos limpios antes de cada test.
  test.beforeEach(async ({ page }) => {
    await prepararSesion(page);
  });

  test('CU-20 Eliminar desde listado: elimina con confirmación', async ({ page }) => {
    const filasAntes = await page.getByTestId('request-row').count();
    await page.waitForTimeout(800);

    await page.getByTestId(`delete-${ID_ELIMINAR}`).click();
    await page.waitForTimeout(1000);

    const botonesEliminar = page.locator(BOTON_CONFIRMAR_ELIMINAR);
    await expect(botonesEliminar.last()).toBeVisible();
    await botonesEliminar.last().click();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('request-row')).toHaveCount(filasAntes - 1);
    await page.waitForTimeout(1500);
  });

  test('CU-21 Cancelar eliminación desde listado: no elimina al cancelar', async ({ page }) => {
    await expect(page.getByTestId('request-row')).toHaveCount(FILAS_SEMILLA);
    await page.waitForTimeout(800);

    await page.getByTestId(`delete-${ID_CANCELAR}`).click();
    await page.waitForTimeout(1000);

    const botonesCancelar = page.locator(BOTON_CANCELAR);
    await expect(botonesCancelar.last()).toBeVisible();
    await botonesCancelar.last().click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('request-row')).toHaveCount(FILAS_SEMILLA);
    await page.waitForTimeout(1500);
  });

  test('CU-22 Eliminar desde detalle: redirige al listado con mensaje', async ({ page }) => {
    await page.getByTestId(`view-${ID_DETALLE}`).click();
    await expect(page.getByTestId('request-detail')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('delete-request-button').click();
    await page.waitForTimeout(1000);

    const botonesEliminar = page.locator(BOTON_CONFIRMAR_ELIMINAR);
    await expect(botonesEliminar.last()).toBeVisible();
    await botonesEliminar.last().click();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('success-message')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
