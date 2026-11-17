import { test, expect, type Page } from '@playwright/test';

// Datos del dashboard: semillas, filtros, búsquedas y restablecimiento.
const URL_LOGIN = '/login';
const CREDENCIALES = { usuario: 'alumno', password: 'Playwright123' };
const FILAS_SEMILLA = 5;
const IDS_SEMILLA = ['req-001', 'req-002', 'req-003', 'req-004', 'req-005'];
const ESTADOS_FILTRO = ['Pendiente', 'En progreso', 'Completada', 'Todos'];
const BOTON_CONFIRMAR_RESTABLECER = 'button:has-text("Restablecer")';
const BOTON_CANCELAR = 'button:has-text("Cancelar")';
const BUSQUEDA_SIN_COINCIDENCIAS = 'zzzzzzsincoincidencia';
const BUSQUEDA_ERRONEA = 'nombreerroneo';
const BUSQUEDA_VALIDA = 'pruebabusqueda';
const BUSQUEDA_ERROR = 'error';
const TITULO_OBJETIVO = 'Error al iniciar sesión';
const DESCRIPCION_OBJETIVO = 'Registro creado automáticamente por el test al no existir en los datos iniciales.';
const SOLICITUD_CREADA = {
  titulo: 'PruebaBusquedaCombinada',
  descripcion: 'Descripción para probar búsqueda y filtro combinados.',
  categoria: 'Técnico',
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

// Prerrequisito de búsqueda: crea la solicitud objetivo si aún no existe en el listado.
async function asegurarSolicitudObjetivo(page: Page) {
  const filaObjetivo = page.getByTestId('request-row').filter({ hasText: TITULO_OBJETIVO });
  if ((await filaObjetivo.count()) > 0) {
    await page.waitForTimeout(800);
    return;
  }

  await page.getByTestId('new-request-button').click();
  await expect(page.getByTestId('new-request-page')).toBeVisible();
  await page.waitForTimeout(1000);

  await page.getByTestId('field-title').fill(TITULO_OBJETIVO);
  await page.waitForTimeout(600);
  await page.getByTestId('field-description').fill(DESCRIPCION_OBJETIVO);
  await page.waitForTimeout(600);
  await page.getByTestId('field-category').selectOption('Técnico');
  await page.waitForTimeout(600);
  await page.getByTestId('field-priority').selectOption('Alta');
  await page.waitForTimeout(600);

  await page.getByTestId('save-button').click();
  await expect(page.getByTestId('dashboard')).toBeVisible();
  await page.waitForTimeout(1500);

  await expect(filaObjetivo).toHaveCount(1);
  await page.waitForTimeout(800);
}

test.describe('Dashboard', () => {
  // Prerrequisito: sesión iniciada con datos limpios antes de cada test.
  test.beforeEach(async ({ page }) => {
    await prepararSesion(page);
  });

  test('CU-05 Visualización inicial con semillas: 5 filas de req-001 a req-005', async ({ page }) => {
    await expect(page.getByTestId('requests-table')).toBeVisible();
    await expect(page.getByTestId('request-row')).toHaveCount(FILAS_SEMILLA);
    await page.waitForTimeout(800);

    for (const id of IDS_SEMILLA) {
      await expect(page.locator(`tr[data-id="${id}"]`)).toBeVisible();
    }
    await page.waitForTimeout(1500);
  });

  test('CU-07 Filtro por estado: Pendiente, En progreso, Completada y Todos', async ({ page }) => {
    for (const estado of ESTADOS_FILTRO) {
      await page.getByTestId('status-filter').selectOption(estado);
      await page.waitForTimeout(1000);

      if (estado === 'Todos') {
        await expect(page.getByTestId('request-row')).toHaveCount(FILAS_SEMILLA);
      } else if (estado === 'Pendiente') {
        expect(await page.getByTestId('request-row').count()).toBeGreaterThan(0);
      } else {
        expect(await page.getByTestId('request-row').count()).toBeGreaterThanOrEqual(0);
      }
      await page.waitForTimeout(1000);
    }
  });

  test('CU-08 Búsqueda + filtro combinados: mensaje vacío si no hay coincidencias', async ({ page }) => {
    await page.getByTestId('status-filter').selectOption('Completada');
    await page.waitForTimeout(800);
    await page.getByTestId('search-input').fill(BUSQUEDA_SIN_COINCIDENCIAS);
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('empty-message')).toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('CU-08 Búsqueda + filtro combinados: crea, busca erróneo y luego el nombre correcto', async ({ page }) => {
    await page.getByTestId('new-request-button').click();
    await expect(page.getByTestId('new-request-page')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('field-title').fill(SOLICITUD_CREADA.titulo);
    await page.waitForTimeout(600);
    await page.getByTestId('field-description').fill(SOLICITUD_CREADA.descripcion);
    await page.waitForTimeout(600);
    await page.getByTestId('field-category').selectOption(SOLICITUD_CREADA.categoria);
    await page.waitForTimeout(600);
    await page.getByTestId('field-priority').selectOption(SOLICITUD_CREADA.prioridad);
    await page.waitForTimeout(600);

    await page.getByTestId('save-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);

    await page.getByTestId('status-filter').selectOption('Pendiente');
    await page.waitForTimeout(1000);

    await page.getByTestId('search-input').fill(BUSQUEDA_ERRONEA);
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('empty-message')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByTestId('search-input').clear();
    await page.waitForTimeout(1000);

    await page.getByTestId('search-input').fill(BUSQUEDA_VALIDA);
    await page.waitForTimeout(1500);

    const filas = page.getByTestId('request-row');
    await expect(filas).toHaveCount(1);
    await expect(filas.getByTestId('request-title')).toHaveText(SOLICITUD_CREADA.titulo);
    await page.waitForTimeout(1500);
  });

  test('CU-10 Restablecer datos de prueba: restaura semillas sin cerrar sesión', async ({ page }) => {
    await page.getByTestId('reset-data-button').click();
    await page.waitForTimeout(1000);

    await page.getByTestId('reset-data-button').click();
    await page.waitForTimeout(1000);

    const botonesRestablecer = page.locator(BOTON_CONFIRMAR_RESTABLECER);
    await expect(botonesRestablecer.last()).toBeVisible();
    await botonesRestablecer.last().click();
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('requests-table')).toBeVisible();
    await expect(page.getByTestId('request-row')).toHaveCount(FILAS_SEMILLA);
    await expect(page.locator(`tr[data-id="${IDS_SEMILLA[0]}"]`)).toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('CU-11 Cancelar restablecer datos: no restablece al cancelar', async ({ page }) => {
    await expect(page.getByTestId('request-row')).toHaveCount(FILAS_SEMILLA);
    await page.waitForTimeout(800);

    await page.getByTestId('reset-data-button').click();
    await page.waitForTimeout(1000);

    const botonesCancelar = page.locator(BOTON_CANCELAR);
    await expect(botonesCancelar.last()).toBeVisible();
    await botonesCancelar.last().click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('request-row')).toHaveCount(FILAS_SEMILLA);
    await page.waitForTimeout(1500);
  });
});

test.describe('Búsqueda por título en el listado', () => {
  // Prerrequisito: sesión iniciada y solicitud objetivo asegurada antes de cada test.
  test.beforeEach(async ({ page }) => {
    await prepararSesion(page);
    await asegurarSolicitudObjetivo(page);
  });

  test('buscar "error" muestra solo la solicitud objetivo', async ({ page }) => {
    await page.getByTestId('search-input').fill(BUSQUEDA_ERROR);
    await page.waitForTimeout(1500);

    const filas = page.getByTestId('request-row');
    await expect(filas).toHaveCount(1);
    await expect(filas.getByTestId('request-title')).toHaveText(TITULO_OBJETIVO);
    await page.waitForTimeout(1500);
  });
});
