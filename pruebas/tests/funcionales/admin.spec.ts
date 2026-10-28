import { test, expect, textoEsperado } from '../../fixtures/base';
import { ADMIN, SEEDPASS } from '../../lib/config';
import { loginOk, goto, field, fillField, pick, autocomplete, msgs, toast, login } from '../../lib/ui';
import { Page } from '@playwright/test';

const PASS = SEEDPASS; // cumple la politica de contrasena de OrangeHRM

async function abrirAlta(page: Page) {
  await goto(page, 'admin/saveSystemUser');
  await expect(page.getByRole('heading', { name: 'Add User' })).toBeVisible();
}
async function llenarUsuario(page: Page, o: { rol: string; emp: string; empOpt?: string; user: string; pass?: string; conf?: string }) {
  await pick(page, 'User Role', o.rol);
  await autocomplete(page, 'Employee Name', o.emp, o.empOpt);
  await pick(page, 'Status', 'Enabled');
  await fillField(page, 'Username', o.user);
  await fillField(page, 'Password', o.pass ?? PASS);
  await fillField(page, 'Confirm Password', o.conf ?? o.pass ?? PASS);
}
async function buscarUsuario(page: Page, user: string) {
  await goto(page, 'admin/viewSystemUsers');
  await fillField(page, 'Username', user);
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
}

test.describe('Admin - usuarios (RF-02)', () => {
  test.beforeEach(async ({ page }) => { await loginOk(page, ADMIN.user, ADMIN.pass); });

  test('CP-07 Crear usuario ESS valido', async ({ page, ev }) => {
    await abrirAlta(page);
    await llenarUsuario(page, { rol: 'ESS', emp: 'Elena Torres', empOpt: 'Elena', user: 'elena.torres' });
    await page.getByRole('button', { name: 'Save' }).click();
    const t = await toast(page); textoEsperado(ev, [t], 'Successfully Saved');
    await buscarUsuario(page, 'elena.torres');
    const fila = page.locator('.oxd-table-card').filter({ hasText: 'elena.torres' });
    ev.obtenido = `Toast: ${t}; usuario en lista: ${await fila.count()} fila(s)`;
    await expect(fila).toHaveCount(1);
  });

  test('CP-08 Usuario de 4 caracteres', async ({ page, ev }) => {
    await abrirAlta(page);
    await llenarUsuario(page, { rol: 'ESS', emp: 'Karla', empOpt: 'Karla', user: 'abcd' });
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
    const m = await msgs(page); textoEsperado(ev, m, 'Should be at least 5 characters');
    ev.obtenido = `Mensajes: ${m.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/saveSystemUser/);
    await buscarUsuario(page, 'abcd');
    await expect(page.locator('.oxd-table-card').filter({ hasText: 'abcd' })).toHaveCount(0);
  });

  test('CP-09 Usuario de 5 caracteres', async ({ page, ev }) => {
    await abrirAlta(page);
    await llenarUsuario(page, { rol: 'ESS', emp: 'Fernando Gomez', empOpt: 'Fernando', user: 'fgome' });
    await page.getByRole('button', { name: 'Save' }).click();
    const t = await toast(page);
    await buscarUsuario(page, 'fgome');
    const n = await page.locator('.oxd-table-card').filter({ hasText: 'fgome' }).count();
    ev.obtenido = `Toast: ${t}; filas con fgome: ${n}`;
    expect(n).toBe(1);
  });

  test('CP-10 Usuario duplicado', async ({ page, ev }) => {
    await abrirAlta(page);
    await pick(page, 'User Role', 'ESS');
    await autocomplete(page, 'Employee Name', 'Gabriela', 'Gabriela');
    await pick(page, 'Status', 'Enabled');
    await fillField(page, 'Username', 'ana.lopez');
    await fillField(page, 'Password', PASS); await fillField(page, 'Confirm Password', PASS);
    await page.waitForTimeout(1500);
    const m1 = await msgs(page);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1500);
    const m = [...new Set([...m1, ...(await msgs(page))])];
    textoEsperado(ev, m, 'Already exists');
    ev.obtenido = `Mensajes: ${m.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/saveSystemUser/);
    expect(m.join(' ').toLowerCase()).toContain('exist');
  });

  test('CP-11 Confirmacion de contrasena distinta', async ({ page, ev }) => {
    await abrirAlta(page);
    await llenarUsuario(page, { rol: 'ESS', emp: 'Hugo', empOpt: 'Hugo', user: 'hugo.sanchez', pass: PASS, conf: PASS + 'x' });
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
    const m = await msgs(page); textoEsperado(ev, m, 'Passwords do not match');
    ev.obtenido = `Mensajes: ${m.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/saveSystemUser/);
    expect(m.join(' ').toLowerCase()).toContain('match');
  });

  test('CP-12 Usuario deshabilitado no accede', async ({ page, ev, browser }) => {
    await buscarUsuario(page, 'diego.martinez');
    const fila = page.locator('.oxd-table-card').filter({ hasText: 'diego.martinez' });
    await fila.getByRole('button').filter({ has: page.locator('.bi-pencil-fill') }).click();
    await page.waitForLoadState('networkidle');
    await pick(page, 'Status', 'Disabled');
    await page.getByRole('button', { name: 'Save' }).click();
    const t = await toast(page);
    // intento de acceso en otro contexto
    const ctx = await browser.newContext({ baseURL: page.url().split('/web')[0] });
    const p2 = await ctx.newPage();
    await login(p2, 'diego.martinez', SEEDPASS);
    await p2.waitForTimeout(2000);
    const m = await msgs(p2); textoEsperado(ev, m, 'Account disabled');
    const url2 = p2.url();
    ev.page = p2;
    ev.obtenido = `Guardado: ${t}; intento de login -> mensaje: ${m.join(' / ')}; URL: ${url2}`;
    try { expect(url2).toMatch(/auth\/login/); expect(url2).not.toMatch(/dashboard/); await expect(p2.locator('.oxd-alert-content-text')).toBeVisible(); }
    finally {
      // restaurar para no afectar otros casos
      const id = await page.evaluate(async () => { const r = await fetch('/web/index.php/api/v2/admin/users?username=diego.martinez'); const j = await r.json(); return j.data[0].id; });
      await page.request.put(`/web/index.php/api/v2/admin/users/${id}`, { data: { username: 'diego.martinez', status: true, userRoleId: 2, empNumber: 5, changePassword: false } });
      ev.after = () => ctx.close();
    }
  });
});

