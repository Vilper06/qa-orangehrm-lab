import { test, expect, textoEsperado } from '../../fixtures/base';
import { ADMIN } from '../../lib/config';
import { loginOk, goto, field, fillField, pick, msgs, toast } from '../../lib/ui';
import { Page } from '@playwright/test';

async function abrirAlta(page: Page) {
  await goto(page, 'pim/addEmployee');
  await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
}
async function llenar(page: Page, nombre: string, apellido: string, id?: string) {
  if (nombre) await page.getByPlaceholder('First Name').fill(nombre);
  if (apellido) await page.getByPlaceholder('Last Name').fill(apellido);
  if (id !== undefined) { const i = field(page, 'Employee Id').locator('input'); await i.fill(''); await i.fill(id); }
}
const esperarMsgs = async (page: Page) => { await page.waitForTimeout(1500); return msgs(page); };

test.describe('PIM (RF-03, RF-04, RF-05)', () => {
  test.beforeEach(async ({ page }) => { await loginOk(page, ADMIN.user, ADMIN.pass); });

  test('CP-13 Alta de empleado valida', async ({ page, ev }) => {
    await abrirAlta(page); await llenar(page, 'Mario', 'Quintero Paz', 'E013');
    await page.getByRole('button', { name: 'Save' }).click();
    const t = await toast(page); textoEsperado(ev, [t], 'Successfully Saved');
    await page.waitForURL(/viewPersonalDetails/, { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    ev.obtenido = `Toast: ${t}; URL expediente: ${page.url()}`;
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  });

  test('CP-14 Nombre vacio', async ({ page, ev }) => {
    await abrirAlta(page); await llenar(page, '', 'Prueba', 'E914');
    await page.getByRole('button', { name: 'Save' }).click();
    const m = await esperarMsgs(page); textoEsperado(ev, m, 'Required');
    ev.obtenido = `Mensajes: ${m.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/addEmployee/);
    expect(m.join(' ')).toContain('Required');
  });

  test('CP-15 Nombre de 30 caracteres', async ({ page, ev }) => {
    const n30 = 'Abcdefghijklmnopqrstuvwxyzabcd'; expect(n30.length).toBe(30);
    await abrirAlta(page); await llenar(page, n30, 'Limite Treinta', 'E015');
    await page.getByRole('button', { name: 'Save' }).click();
    const t = await toast(page);
    await page.waitForURL(/viewPersonalDetails/, { timeout: 20000 });
    ev.obtenido = `Toast: ${t}; URL: ${page.url()}`;
    expect(t).toContain('Successfully Saved');
  });

  test('CP-16 Nombre de 31 caracteres', async ({ page, ev }) => {
    const n31 = 'Abcdefghijklmnopqrstuvwxyzabcde'; expect(n31.length).toBe(31);
    await abrirAlta(page); await llenar(page, n31, 'Limite Treinta', 'E916');
    await page.getByRole('button', { name: 'Save' }).click();
    const m = await esperarMsgs(page); textoEsperado(ev, m, 'Should not exceed 30 characters');
    ev.obtenido = `Mensajes: ${m.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/addEmployee/);
    expect(m.join(' ').toLowerCase()).toMatch(/exceed|30/);
  });

  test('CP-17 ID de empleado duplicado', async ({ page, ev }) => {
    await abrirAlta(page); await llenar(page, 'Duplicado', 'Prueba', 'E001');
    await page.getByRole('button', { name: 'Save' }).click();
    const m = await esperarMsgs(page); textoEsperado(ev, m, 'Employee Id already exists');
    ev.obtenido = `Mensajes: ${m.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/addEmployee/);
    expect(m.join(' ').toLowerCase()).toContain('exist');
  });

  test('CP-18 ID de empleado de 11 caracteres', async ({ page, ev }) => {
    await abrirAlta(page); await llenar(page, 'Largo', 'Prueba', 'E0000000001');
    await page.getByRole('button', { name: 'Save' }).click();
    const m = await esperarMsgs(page); textoEsperado(ev, m, 'Should not exceed 10 characters');
    ev.obtenido = `Mensajes: ${m.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/addEmployee/);
    expect(m.join(' ').toLowerCase()).toMatch(/exceed|10/);
  });

  test('CP-19 Busqueda por nombre existente', async ({ page, ev }) => {
    await goto(page, 'pim/viewEmployeeList');
    await page.getByPlaceholder('Type for hints...').first().fill('Beatriz');
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1000);
    const filas = page.locator('.oxd-table-card');
    const textos = await filas.allInnerTexts();
    ev.obtenido = `Registros: ${await filas.count()} -> ${textos.map(t => t.replace(/\s+/g, ' ')).join(' ; ')}`;
    await expect(filas).toHaveCount(1);
    await expect(filas.first()).toContainText(/Beatriz\s+Hernandez Cruz/);
  });

  test('CP-20 Busqueda por ID inexistente', async ({ page, ev }) => {
    await goto(page, 'pim/viewEmployeeList');
    await field(page, 'Employee Id').locator('input').fill('E999');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1000);
    const m = await msgs(page); const cuerpo = (await page.locator('body').innerText());
    textoEsperado(ev, [...m, cuerpo.includes('No Records Found') ? 'No Records Found' : ''], 'No Records Found');
    ev.obtenido = `Mensajes: ${m.join(' / ')}; filas: ${await page.locator('.oxd-table-card').count()}`;
    await expect(page.getByText('No Records Found').first()).toBeVisible();
  });

  test('CP-21 Filtro por subunidad TI', async ({ page, ev }) => {
    await goto(page, 'pim/viewEmployeeList');
    await pick(page, 'Sub Unit', 'TI');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1000);
    const filas = page.locator('.oxd-table-card');
    const ids = (await filas.allInnerTexts()).map(t => t.replace(/\s+/g, ' ').match(/E\d{3}/)?.[0]).sort();
    ev.obtenido = `Registros: ${ids.length}; IDs: ${ids.join(', ')}`;
    expect(ids).toEqual(['E002', 'E003', 'E008', 'E011']);
  });

  test('CP-22 Supervisor asignado visible', async ({ page, ev }) => {
    await goto(page, 'pim/viewEmployeeList');
    await field(page, 'Employee Id').locator('input').fill('E002');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle');
    await page.locator('.oxd-table-card').first().click();
    await page.waitForURL(/viewPersonalDetails/);
    await page.getByRole('link', { name: 'Report-to' }).click();
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1000);
    const cuerpo = (await page.locator('.orangehrm-edit-employee-content, body').first().innerText()).replace(/\s+/g, ' ');
    ev.obtenido = `Report-to de E002: ${cuerpo.slice(cuerpo.indexOf('Assigned Supervisors'), cuerpo.indexOf('Assigned Supervisors') + 140)}`;
    await expect(page.getByText(/Ana\s+Lopez Garcia/).first()).toBeVisible();
  });
});
