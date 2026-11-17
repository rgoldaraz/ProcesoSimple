import { test, expect, type Page } from '@playwright/test';

// Datos para crear solicitudes y validar el título.
const URL_LOGIN = '/login';
const CREDENCIALES = { usuario: 'alumno', password: 'Playwright123' };
const FILAS_SEMILLA = 5;
const ESTADO_INICIAL = 'Pendiente';
const TITULO_TEMPORAL = 'Temporal';
const TITULO_MINIMO = 5;
const TITULO_MAXIMO = 80;
const MSG_TITULO_LONGITUD = 'El título debe tener entre 5 y 80 caracteres.';
const TITULO_DEBAJO_MINIMO = 'a'.repeat(TITULO_MINIMO - 1); // 4 caracteres
const TITULO_ARRIBA_MAXIMO = 'a'.repeat(TITULO_MAXIMO + 1); // 81 caracteres
const SOLICITUD_VALIDA = {
  titulo: 'Solicitud de prueba E2E',
  descripcion: 'Esta es una descripción de prueba con más de diez caracteres.',
  categoria: 'Técnico',
  prioridad: 'Alta',
};
const SOLICITUD_ESTADO_INICIAL = {
  titulo: 'Estado Inicial E2E',
  descripcion: 'Comprobar estado inicial Pendiente.',
  categoria: 'Facturación',
  prioridad: 'Alta',
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

// Prerrequisito común: abre el formulario de nueva solicitud.
async function abrirFormularioNuevaSolicitud(page: Page) {
  await page.getByTestId('new-request-button').click();
  await expect(page.getByTestId('new-request-page')).toBeVisible();
  await page.waitForTimeout(1000);
}

// Rellena el formulario de solicitud con los datos indicados.
async function rellenarFormulario(
  page: Page,
  datos: { titulo: string; descripcion: string; categoria: string; prioridad: string },
) {
  await page.getByTestId('field-title').fill(datos.titulo);
  await page.waitForTimeout(600);
  await page.getByTestId('field-description').fill(datos.descripcion);
  await page.waitForTimeout(600);
  await page.getByTestId('field-category').selectOption(datos.categoria);
  await page.waitForTimeout(600);
  await page.getByTestId('field-priority').selectOption(datos.prioridad);
  await page.waitForTimeout(600);
}

test.describe('Crear solicitudes', () => {
  // Prerrequisito: sesión iniciada con datos limpios antes de cada test.
  test.beforeEach(async ({ page }) => {
    await prepararSesion(page);
  });

  test('CU-12/CU-13 Crear solicitud válida: aparece en el listado', async ({ page }) => {
    await abrirFormularioNuevaSolicitud(page);

    await rellenarFormulario(page, SOLICITUD_VALIDA);
    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('request-row').filter({ hasText: SOLICITUD_VALIDA.titulo })).toHaveCount(1);
    await page.waitForTimeout(1500);
  });

  test('CU-14 Validación al crear: errores con campos vacíos y desaparecen al corregir', async ({ page }) => {
    await abrirFormularioNuevaSolicitud(page);

    // Antes de guardar no hay errores visibles.
    await expect(page.getByTestId('title-error')).not.toBeVisible();
    await expect(page.getByTestId('description-error')).not.toBeVisible();
    await expect(page.getByTestId('category-error')).not.toBeVisible();
    await expect(page.getByTestId('priority-error')).not.toBeVisible();

    await page.getByTestId('save-button').click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('title-error')).toBeVisible();
    await expect(page.getByTestId('description-error')).toBeVisible();
    await expect(page.getByTestId('category-error')).toBeVisible();
    await expect(page.getByTestId('priority-error')).toBeVisible();

    // Corrige el título y reenvía: su error desaparece, los demás permanecen.
    await page.getByTestId('field-title').fill(SOLICITUD_VALIDA.titulo);
    await page.waitForTimeout(600);
    await page.getByTestId('save-button').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('title-error')).not.toBeVisible();
    await expect(page.getByTestId('description-error')).toBeVisible();

    // Corrige la descripción y reenvía: su error desaparece, los demás permanecen.
    await page.getByTestId('field-description').fill(SOLICITUD_VALIDA.descripcion);
    await page.waitForTimeout(600);
    await page.getByTestId('save-button').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('description-error')).not.toBeVisible();
    await expect(page.getByTestId('category-error')).toBeVisible();

    // Corrige categoría y prioridad: la solicitud se crea y no queda ningún error.
    await page.getByTestId('field-category').selectOption(SOLICITUD_VALIDA.categoria);
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption(SOLICITUD_VALIDA.prioridad);
    await page.waitForTimeout(600);
    await page.getByTestId('save-button').click();

    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('title-error')).not.toBeVisible();
    await expect(page.getByTestId('description-error')).not.toBeVisible();
    await expect(page.getByTestId('category-error')).not.toBeVisible();
    await expect(page.getByTestId('priority-error')).not.toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('Validación del título: longitud mínima y máxima', async ({ page }) => {
    await abrirFormularioNuevaSolicitud(page);

    // Campos válidos salvo el título, para aislar su error.
    await page.getByTestId('field-description').fill(SOLICITUD_VALIDA.descripcion);
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption(SOLICITUD_VALIDA.categoria);
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption(SOLICITUD_VALIDA.prioridad);
    await page.waitForTimeout(600);

    // Antes de guardar no hay error de título visible.
    await expect(page.getByTestId('title-error')).not.toBeVisible();

    // Por debajo del mínimo permitido.
    await page.getByTestId('field-title').fill(TITULO_DEBAJO_MINIMO);
    await page.waitForTimeout(600);
    await page.getByTestId('save-button').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('title-error')).toBeVisible();
    await expect(page.getByTestId('title-error')).toHaveText(MSG_TITULO_LONGITUD);
    await page.waitForTimeout(1000);

    // Por encima del máximo permitido.
    await page.getByTestId('field-title').fill(TITULO_ARRIBA_MAXIMO);
    await page.waitForTimeout(600);
    await page.getByTestId('save-button').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('title-error')).toBeVisible();
    await expect(page.getByTestId('title-error')).toHaveText(MSG_TITULO_LONGITUD);
    await page.waitForTimeout(1000);

    // Corrige el título a un valor válido: el error desaparece y la solicitud se crea.
    await page.getByTestId('field-title').fill(SOLICITUD_VALIDA.titulo);
    await page.waitForTimeout(600);
    await page.getByTestId('save-button').click();

    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('title-error')).not.toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('CU-15 Cancelar creación: vuelve al listado sin crear', async ({ page }) => {
    await expect(page.getByTestId('request-row')).toHaveCount(FILAS_SEMILLA);
    await page.waitForTimeout(800);

    await abrirFormularioNuevaSolicitud(page);
    await page.getByTestId('field-title').fill(TITULO_TEMPORAL);
    await page.waitForTimeout(600);

    await page.getByTestId('cancel-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('request-row')).toHaveCount(FILAS_SEMILLA);
    await page.waitForTimeout(1500);
  });

  test('CU-28 Estado inicial Pendiente al crear', async ({ page }) => {
    await abrirFormularioNuevaSolicitud(page);

    await rellenarFormulario(page, SOLICITUD_ESTADO_INICIAL);
    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await page
      .getByTestId('request-row')
      .filter({ hasText: SOLICITUD_ESTADO_INICIAL.titulo })
      .getByRole('button', { name: 'Ver' })
      .click();
    await expect(page.getByTestId('request-detail')).toBeVisible();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('detail-status')).toContainText(ESTADO_INICIAL);
    await page.waitForTimeout(1500);
  });
});
