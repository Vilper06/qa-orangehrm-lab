import { test, expect, textoEsperado } from '../../fixtures/base';
import { ADMIN, SEEDPASS } from '../../lib/config';
import { loginOk, goto, field, fillField, pick, autocomplete, msgs, toast, businessDay, setDate } from '../../lib/ui';
import { Page, Browser, APIRequestContext } from '@playwright/test';

const API = '/web/index.php/api/v2/';
const VACACIONES = 1;
const EMP = { E002: 3, E003: 4, E005: 6 } as const;

/** Sesion en un contexto nuevo (usuario ESS/Supervisor) para precondiciones y verificaciones */
async function sesion(browser: Browser, base: string, user: string, pass: string) {
  const ctx = await browser.newContext({ baseURL: base });
  const page = await ctx.newPage();
  await loginOk(page, user, pass);
  return { ctx, page, rq: page.request as APIRequestContext };
}
/** Precondicion: crea una solicitud propia (pendiente) como ESS via API */
async function crearSolicitud(browser: Browser, base: string, user: string, emp: number, desde: string, hasta = desde) {
  const s = await sesion(browser, base, user, SEEDPASS);
  const r = await s.rq.post(`${API}leave/leave-requests`, { data: { leaveTypeId: VACACIONES, fromDate: desde, toDate: hasta, comment: 'precondicion automatizada', partialOption: null } });
  const j = await r.json();
  await s.ctx.close();
  if (!r.ok()) throw new Error('No se pudo crear la solicitud precondicion: ' + JSON.stringify(j).slice(0, 300));
  return j.data.id as number;
}
/** Saldo de Vacaciones visible para el usuario (formulario Apply) */
async function saldo(browser: Browser, base: string, user: string, pass: string) {
  const s = await sesion(browser, base, user, pass);
  await goto(s.page, 'leave/applyLeave');
  await pick(s.page, 'Leave Type', 'Vacaciones');
  await s.page.waitForTimeout(1500);
  const t = (await field(s.page, 'Leave Balance').innerText()).replace(/\s+/g, ' ');
  await s.ctx.close();
  return parseFloat(t.match(/([\d.]+)\s*Day/)?.[1] ?? 'NaN');
}
async function cancelarPorApi(browser: Browser, base: string, user: string, id: number) {
  const s = await sesion(browser, base, user, SEEDPASS);
  await s.rq.put(`${API}leave/employees/leave-requests/${id}`, { data: { action: 'CANCEL' } });
  await s.ctx.close();
}

test.describe('Leave - derechos (RF-06)', () => {
  test.beforeEach(async ({ page }) => { await loginOk(page, ADMIN.user, ADMIN.pass); });

  async function abrirDerecho(page: Page) {
    await goto(page, 'leave/addLeaveEntitlement');
    await expect(page.getByRole('heading', { name: 'Entitlements' })).toBeVisible();
    await autocomplete(page, 'Employee Name', 'Elena Torres', 'Elena');
    await pick(page, 'Leave Type', 'Vacaciones');
  }

  test('CP-23 Asignar derecho adicional', async ({ page, ev }) => {
    await abrirDerecho(page);
    await fillField(page, 'Entitlement', '2');
    await page.getByRole('button', { name: 'Save' }).click();
    const dlg = page.locator('.oxd-dialog-container-default--inner');
    await dlg.waitFor();
    const txt = (await dlg.innerText()).replace(/\s+/g, ' ');
    await dlg.getByRole('button', { name: 'Confirm' }).click();
    const t = await toast(page);
    await page.waitForLoadState('networkidle');
    const y = new Date().getFullYear();
    const r = await page.request.get(`${API}leave/leave-entitlements?empNumber=${EMP.E005}&leaveTypeId=${VACACIONES}&fromDate=${y}-01-01&toDate=${y}-12-31`);
    const j = await r.json();
    const total = Number(j.meta.sum?.entitlements ?? j.meta.sum);
    ev.obtenido = `Dialogo: ${txt}; toast: ${t}; derecho total de E005 (Vacaciones ${y}): ${total}`;
    expect(total).toBe(14);
  });

  test('CP-24 Derecho no numerico o negativo', async ({ page, ev }) => {
    await abrirDerecho(page);
    const resultados: string[] = [];
    for (const v of ['abc', '-1']) {
      await fillField(page, 'Entitlement', v);
      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForTimeout(1200);
      const m = await msgs(page);
      resultados.push(`"${v}" -> ${m.join(' / ') || '(sin mensaje)'}`);
      expect(await page.locator('.oxd-dialog-container-default--inner').count()).toBe(0);
      expect(m.length).toBeGreaterThan(0);
    }
    ev.obtenido = resultados.join(' ; ');
    textoEsperado(ev, resultados, 'number');
  });

  test('CP-25 Derecho con 3 decimales', async ({ page, ev }) => {
    await abrirDerecho(page);
    await fillField(page, 'Entitlement', '1.555');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1200);
    const m = await msgs(page); textoEsperado(ev, m, 'Should be a number with upto 2 decimal places');
    ev.obtenido = `Mensajes: ${m.join(' / ')}`;
    expect(await page.locator('.oxd-dialog-container-default--inner').count()).toBe(0);
    expect(m.join(' ')).toMatch(/decimal/i);
  });
});

test.describe('Leave - solicitudes (RF-07)', () => {
  test('CP-26 Solicitud de 1 dia con saldo', async ({ page, ev, browser }) => {
    const dia = businessDay(3);
    await loginOk(page, 'carlos.ramirez', SEEDPASS);
    await goto(page, 'leave/applyLeave');
    await pick(page, 'Leave Type', 'Vacaciones');
    await setDate(page, 'From Date', dia); await setDate(page, 'To Date', dia);
    await page.keyboard.press('Escape'); await page.getByRole('heading', { name: 'Apply Leave' }).click();
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Apply' }).click();
    const t = await toast(page);
    await goto(page, 'leave/viewMyLeaveList');
    await page.getByRole('button', { name: 'Search' }).click().catch(() => {});
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1000);
    const fila = page.locator('.oxd-table-card').filter({ hasText: dia });
    const f = (await fila.first().innerText().catch(() => '')).replace(/\s+/g, ' ');
    ev.obtenido = `Toast: ${t}; solicitud en My Leave: ${f}`;
    await expect(fila.first()).toContainText('Pending Approval');
    // limpieza de la propia solicitud
    await fila.first().getByRole('button', { name: 'Cancel' }).click().catch(() => {});
  });

  test('CP-27 Fecha final anterior a la inicial', async ({ page, ev }) => {
    await loginOk(page, 'carlos.ramirez', SEEDPASS);
    await goto(page, 'leave/applyLeave');
    await pick(page, 'Leave Type', 'Vacaciones');
    await setDate(page, 'From Date', businessDay(10)); await setDate(page, 'To Date', businessDay(9));
    await page.getByRole('heading', { name: 'Apply Leave' }).click();
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.waitForTimeout(1500);
    const m = await msgs(page); textoEsperado(ev, m, 'To date should be after from date');
    ev.obtenido = `Mensajes: ${m.join(' / ')}; URL: ${page.url()}`;
    expect(m.join(' ')).toMatch(/to date|after|from date|before|earlier/i);
    await expect(page).toHaveURL(/applyLeave/);
  });

  test('CP-28 Solicitud mayor al saldo', async ({ page, ev }) => {
    const desde = businessDay(5), hasta = businessDay(17); // 13 dias habiles
    await loginOk(page, 'beatriz.hernandez', SEEDPASS);
    await goto(page, 'leave/applyLeave');
    await pick(page, 'Leave Type', 'Vacaciones');
    await setDate(page, 'From Date', desde); await setDate(page, 'To Date', hasta);
    await page.getByRole('heading', { name: 'Apply Leave' }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.waitForTimeout(2000);
    const m = await msgs(page); const dlg = await page.locator('.oxd-dialog-container-default--inner').allInnerTexts();
    const todos = [...m, ...dlg.map(d => d.replace(/\s+/g, ' '))];
    textoEsperado(ev, todos, 'Balance not sufficient');
    ev.obtenido = `Rango ${desde}..${hasta}; mensajes: ${todos.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/applyLeave/);
    expect(todos.join(' ')).toMatch(/balance|sufficient|insufficient/i);
  });

  test('CP-29 Cancelar solicitud propia pendiente', async ({ page, ev, browser, baseURL }) => {
    const dia = businessDay(30);
    const antes = await saldo(browser, baseURL!, 'carlos.ramirez', SEEDPASS);
    const id = await crearSolicitud(browser, baseURL!, 'carlos.ramirez', EMP.E002, dia);
    await loginOk(page, 'carlos.ramirez', SEEDPASS);
    await goto(page, 'leave/viewMyLeaveList');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1000);
    const fila = page.locator('.oxd-table-card').filter({ hasText: dia });
    await expect(fila.first()).toContainText('Pending Approval');
    await fila.first().getByRole('button', { name: 'Cancel' }).click();
    const t = await toast(page);
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(1500);
    const f = (await page.locator('.oxd-table-card').filter({ hasText: dia }).first().innerText()).replace(/\s+/g, ' ');
    const despues = await saldo(browser, baseURL!, 'carlos.ramirez', SEEDPASS);
    ev.obtenido = `Toast: ${t}; fila: ${f}; saldo antes ${antes}, despues de cancelar ${despues}`;
    expect(f).toContain('Cancelled');
    expect(despues).toBe(antes);
    void id;
  });
});

test.describe('Leave - aprobacion (RF-08)', () => {
  async function accion(page: Page, dia: string, nombre: string, boton: 'Approve' | 'Reject') {
    await goto(page, 'leave/viewLeaveList');
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1200);
    const fila = page.locator('.oxd-table-card').filter({ hasText: dia }).filter({ hasText: nombre });
    await expect(fila.first()).toBeVisible();
    await fila.first().getByRole('button', { name: boton }).click();
    return toast(page);
  }
  async function estadoDe(browser: Browser, baseURL: string, user: string, dia: string) {
    const s = await sesion(browser, baseURL, user, SEEDPASS);
    await goto(s.page, 'leave/viewMyLeaveList');
    await s.page.getByRole('button', { name: 'Search' }).click();
    await s.page.waitForLoadState('networkidle'); await s.page.waitForTimeout(1200);
    const f = (await s.page.locator('.oxd-table-card').filter({ hasText: dia }).first().innerText()).replace(/\s+/g, ' ');
    await s.ctx.close();
    return f;
  }

  test('CP-30 Supervisor aprueba solicitud', async ({ page, ev, browser, baseURL }) => {
    const dia = businessDay(20);
    const antes = await saldo(browser, baseURL!, 'carlos.ramirez', SEEDPASS);
    await crearSolicitud(browser, baseURL!, 'carlos.ramirez', EMP.E002, dia);
    await loginOk(page, 'ana.lopez', SEEDPASS);
    const t = await accion(page, dia, 'Carlos', 'Approve');
    const f = await estadoDe(browser, baseURL!, 'carlos.ramirez', dia);
    const despues = await saldo(browser, baseURL!, 'carlos.ramirez', SEEDPASS);
    ev.obtenido = `Toast: ${t}; estado en cuenta de E002: ${f}; saldo antes ${antes}, despues ${despues}`;
    expect(f).toContain('Scheduled');
    expect(despues).toBe(antes - 1);
  });

  test('CP-31 Supervisor rechaza solicitud', async ({ page, ev, browser, baseURL }) => {
    const dia = businessDay(21);
    const antes = await saldo(browser, baseURL!, 'beatriz.hernandez', SEEDPASS);
    await crearSolicitud(browser, baseURL!, 'beatriz.hernandez', EMP.E003, dia);
    await loginOk(page, 'ana.lopez', SEEDPASS);
    const t = await accion(page, dia, 'Beatriz', 'Reject');
    const f = await estadoDe(browser, baseURL!, 'beatriz.hernandez', dia);
    const despues = await saldo(browser, baseURL!, 'beatriz.hernandez', SEEDPASS);
    ev.obtenido = `Toast: ${t}; estado en cuenta de E003: ${f}; saldo antes ${antes}, despues ${despues}`;
    expect(f).toContain('Rejected');
    expect(despues).toBe(antes);
  });
});


