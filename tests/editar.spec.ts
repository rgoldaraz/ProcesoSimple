import { test, expect, type Page } from '@playwright/test';

// Datos para editar solicitudes.
const URL_LOGIN = '/login';
const CREDENCIALES = { usuario: 'alumno', password: 'Playwright123' };
const ID_EDITAR = 'req-001';
const ID_VALIDACION = 'req-001';
const ID_CANCELAR = 'req-002';
const TITULO_NO_GUARDADO = 'NO_DEBE_GUARDARSE';
const DATOS_INVALIDOS = { titulo: 'abcd', descripcion: 'corto', categoria: '', prioridad: '' };
const SOLICITUD_EDITADA = {
  titulo: 'Título editado E2E',
  descripcion: 'Descripción editada con más de diez caracteres para la prueba.',
  categoria: 'Acceso',
  prioridad: 'Media',
  estado: 'En progreso',
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

// Prerrequisito común: abre el formulario de edición de una solicitud.
async function abrirEdicion(page: Page, id: string) {
  await page.getByTestId(`edit-${id}`).click();
  await expect(page.getByTestId('edit-request-page')).toBeVisible();
  await page.waitForTimeout(1000);
}

test.describe('Editar solicitudes', () => {
  // Prerrequisito: sesión iniciada con datos limpios antes de cada test.
  test.beforeEach(async ({ page }) => {
    await prepararSesion(page);
  });

  test('CU-17 Editar solicitud: guarda y vuelve a detalle con mensaje', async ({ page }) => {
    await abrirEdicion(page, ID_EDITAR);

    await page.getByTestId('field-title').fill(SOLICITUD_EDITADA.titulo);
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill(SOLICITUD_EDITADA.descripcion);
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption(SOLICITUD_EDITADA.categoria);
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption(SOLICITUD_EDITADA.prioridad);
    await page.waitForTimeout(600);
    await page.getByTestId('field-status').selectOption(SOLICITUD_EDITADA.estado);
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('request-detail')).toBeVisible();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('detail-title')).toHaveText(SOLICITUD_EDITADA.titulo);
    await page.waitForTimeout(1500);
  });

  test('CU-18 Validación al editar: errores con datos inválidos y desaparecen al corregir', async ({ page }) => {
    await abrirEdicion(page, ID_VALIDACION);

    // La solicitud semilla es válida: no hay errores visibles al abrir.
    await expect(page.getByTestId('title-error')).not.toBeVisible();
    await expect(page.getByTestId('description-error')).not.toBeVisible();
    await expect(page.getByTestId('category-error')).not.toBeVisible();
    await expect(page.getByTestId('priority-error')).not.toBeVisible();

    await page.getByTestId('field-title').fill(DATOS_INVALIDOS.titulo);
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill(DATOS_INVALIDOS.descripcion);
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption(DATOS_INVALIDOS.categoria);
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption(DATOS_INVALIDOS.prioridad);
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('title-error')).toBeVisible();
    await expect(page.getByTestId('description-error')).toBeVisible();
    await expect(page.getByTestId('category-error')).toBeVisible();
    await expect(page.getByTestId('priority-error')).toBeVisible();

    // Corrige el título y reenvía: su error desaparece, los demás permanecen.
    await page.getByTestId('field-title').fill(SOLICITUD_EDITADA.titulo);
    await page.waitForTimeout(600);
    await page.getByTestId('save-button').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('title-error')).not.toBeVisible();
    await expect(page.getByTestId('description-error')).toBeVisible();

    // Corrige el resto de campos: se guarda y no queda ningún error.
    await page.getByTestId('field-description').fill(SOLICITUD_EDITADA.descripcion);
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption(SOLICITUD_EDITADA.categoria);
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption(SOLICITUD_EDITADA.prioridad);
    await page.waitForTimeout(600);
    await page.getByTestId('save-button').click();

    await expect(page.getByTestId('request-detail')).toBeVisible();
    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('title-error')).not.toBeVisible();
    await expect(page.getByTestId('description-error')).not.toBeVisible();
    await expect(page.getByTestId('category-error')).not.toBeVisible();
    await expect(page.getByTestId('priority-error')).not.toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('CU-19 Cancelar edición: vuelve sin guardar cambios', async ({ page }) => {
    await abrirEdicion(page, ID_CANCELAR);

    await page.getByTestId('field-title').fill(TITULO_NO_GUARDADO);
    await page.waitForTimeout(600);

    await page.getByTestId('cancel-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);
  });
});
