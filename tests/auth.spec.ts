import { test, expect, type Page } from '@playwright/test';

// Datos de autenticación: si cambian, solo hay que editar estas constantes.
const URL_LOGIN = '/login';
const CREDENCIALES = { usuario: 'alumno', password: 'Playwright123' };
const MSG_ERROR_LOGIN = 'Usuario o contraseña incorrectos.';
const MSG_USUARIO_OBLIGATORIO = 'El usuario es obligatorio.';
const MSG_PASSWORD_OBLIGATORIA = 'La contraseña es obligatoria.';

// Limpia el almacenamiento del navegador para que los tests no se mezclen datos.
async function limpiarAlmacenamiento(page: Page) {
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

// Prerrequisito común: intenta iniciar sesión con las credenciales indicadas (página ya abierta).
async function intentarLogin(page: Page, usuario: string, password: string) {
  await page.getByTestId('login-username').fill(usuario);
  await page.waitForTimeout(600);
  await page.getByTestId('login-password').fill(password);
  await page.waitForTimeout(600);
  await page.getByTestId('login-button').click();
  await page.waitForTimeout(1000);
}

test.describe('Autenticación', () => {
  // Prerrequisito: login abierto y almacenamiento limpio antes de cada test.
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_LOGIN);
    await page.waitForTimeout(800);
    await limpiarAlmacenamiento(page);
  });

  test('CU-01 Acceso con credenciales correctas: redirige al dashboard', async ({ page }) => {
    await intentarLogin(page, CREDENCIALES.usuario, CREDENCIALES.password);

    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('new-request-button')).toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('CU-02 Redirección si ya hay sesión activa', async ({ page }) => {
    await intentarLogin(page, CREDENCIALES.usuario, CREDENCIALES.password);
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1000);

    await page.goto(URL_LOGIN);
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('login-form')).not.toBeVisible();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('CU-03 Login con campos vacíos: errores visibles y desaparecen al corregir', async ({ page }) => {
    // Antes de actuar no hay errores visibles.
    await expect(page.getByTestId('username-error')).not.toBeVisible();
    await expect(page.getByTestId('password-error')).not.toBeVisible();
    await expect(page.getByTestId('login-error')).not.toBeVisible();

    await intentarLogin(page, '', '');

    await expect(page.getByTestId('username-error')).toBeVisible();
    await expect(page.getByTestId('username-error')).toHaveText(MSG_USUARIO_OBLIGATORIO);
    await expect(page.getByTestId('password-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toHaveText(MSG_PASSWORD_OBLIGATORIA);

    // Corrige solo el usuario y reenvía: su error desaparece, el de la contraseña permanece.
    await page.getByTestId('login-username').fill(CREDENCIALES.usuario);
    await page.waitForTimeout(600);
    await page.getByTestId('login-button').click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('username-error')).not.toBeVisible();
    await expect(page.getByTestId('password-error')).toBeVisible();

    // Corrige la contraseña y reenvía: todos los errores desaparecen y accede al dashboard.
    await page.getByTestId('login-password').fill(CREDENCIALES.password);
    await page.waitForTimeout(600);
    await page.getByTestId('login-button').click();

    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('username-error')).not.toBeVisible();
    await expect(page.getByTestId('password-error')).not.toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('CU-04 Login con ambas credenciales incorrectas', async ({ page }) => {
    // Antes de actuar no hay error visible.
    await expect(page.getByTestId('login-error')).not.toBeVisible();

    await intentarLogin(page, 'otro', 'incorrecta');

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText(MSG_ERROR_LOGIN);

    // Corrige ambas credenciales y reenvía: el error desaparece y accede al dashboard.
    await intentarLogin(page, CREDENCIALES.usuario, CREDENCIALES.password);

    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('login-error')).not.toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('CU-04 Login con solo la contraseña incorrecta', async ({ page }) => {
    // Antes de actuar no hay error visible.
    await expect(page.getByTestId('login-error')).not.toBeVisible();

    await intentarLogin(page, CREDENCIALES.usuario, 'contraseñaincorrecta');

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText(MSG_ERROR_LOGIN);

    // Corrige la contraseña y reenvía: el error desaparece y accede al dashboard.
    await intentarLogin(page, CREDENCIALES.usuario, CREDENCIALES.password);

    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('login-error')).not.toBeVisible();
    await page.waitForTimeout(1500);
  });

  test('CU-04 Login con solo el usuario incorrecto', async ({ page }) => {
    // Antes de actuar no hay error visible.
    await expect(page.getByTestId('login-error')).not.toBeVisible();

    await intentarLogin(page, 'usuarioerroneo', CREDENCIALES.password);

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText(MSG_ERROR_LOGIN);

    // Corrige el usuario y reenvía: el error desaparece y accede al dashboard.
    await intentarLogin(page, CREDENCIALES.usuario, CREDENCIALES.password);

    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('login-error')).not.toBeVisible();
    await page.waitForTimeout(1500);
  });
});
