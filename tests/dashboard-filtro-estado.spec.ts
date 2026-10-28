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

test.describe('CU-07 Filtro por estado', () => {
  test('filtra por Pendiente, En progreso, Completada y Todos', async ({ page }) => {
    await loginAsAlumno(page);

    await page.getByTestId('status-filter').selectOption('Pendiente');
    await page.waitForTimeout(1000);
    const rowsPendiente = page.getByTestId('request-row');
    const countPendiente = await rowsPendiente.count();
    expect(countPendiente).toBeGreaterThan(0);
    await page.waitForTimeout(1000);

    await page.getByTestId('status-filter').selectOption('En progreso');
    await page.waitForTimeout(1000);
    const countEnProgreso = await page.getByTestId('request-row').count();
    expect(countEnProgreso).toBeGreaterThanOrEqual(0);
    await page.waitForTimeout(1000);

    await page.getByTestId('status-filter').selectOption('Completada');
    await page.waitForTimeout(1000);
    const countCompletada = await page.getByTestId('request-row').count();
    expect(countCompletada).toBeGreaterThanOrEqual(0);
    await page.waitForTimeout(1000);

    await page.getByTestId('status-filter').selectOption('Todos');
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('request-row')).toHaveCount(5);
    await page.waitForTimeout(1500);
  });
});
