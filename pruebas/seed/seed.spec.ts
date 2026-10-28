import { test, expect, request as pwRequest } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const env: Record<string, string> = {};
for (const l of fs.readFileSync(path.resolve(__dirname, '../../.env'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2];
}
const D = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'datos_semilla.json'), 'utf8'));
const API = '/web/index.php/api/v2/';

test('seed: cargar datos semilla', async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto('/web/index.php/auth/login');
  await page.getByPlaceholder('Username').fill(env.OHRM_ADMIN_USER);
  await page.getByPlaceholder('Password').fill(env.OHRM_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/dashboard/);
  const rq = page.request;

  const post = async (url: string, data: any, method: 'post' | 'put' = 'post') => {
    const r = await rq[method](API + url, { data });
    const body = await r.text();
    if (!r.ok()) throw new Error(`${method.toUpperCase()} ${url} -> ${r.status()} ${body.slice(0, 300)}`);
    return JSON.parse(body).data;
  };
  const get = async (url: string) => {
    const r = await rq.get(API + url); const b = await r.text();
    if (!r.ok()) throw new Error(`GET ${url} -> ${r.status()} ${b.slice(0, 300)}`);
    return JSON.parse(b).data;
  };

  // limpieza de la sonda de pruebas, si existe
  const jt0 = await get('admin/job-titles?limit=0');
  if (!jt0.some((j: any) => j.title === 'ProbeTmp')) await post('admin/job-titles', { title: 'ProbeTmp', description: '', note: '' }); // iguala AUTO_INCREMENT entre v1 y v2
  const jt1 = await get('admin/job-titles?limit=0');
  const probe = jt1.filter((j: any) => j.title === 'ProbeTmp').map((j: any) => j.id);
  if (probe.length) await rq.delete(API + 'admin/job-titles', { data: { ids: probe } });

  const loc: Record<string, number> = {};
  for (const u of D.ubicaciones) loc[u.name] = (await post('admin/locations', { name: u.name, countryCode: 'MX', province: u.province, city: u.city, address: '', zipCode: '', phone: '', fax: '', note: '' })).id;
  const dep: Record<string, number> = {};
  for (const n of D.departamentos) dep[n] = (await post('admin/subunits', { name: n, unitId: '', description: '', parentId: 1 })).id;
  const jt: Record<string, number> = {};
  for (const n of D.puestos) jt[n] = (await post('admin/job-titles', { title: n, description: '', note: '' })).id;
  const es: Record<string, number> = {};
  for (const n of D.estatus) es[n] = (await post('admin/employment-statuses', { name: n })).id;

  const emp: Record<string, number> = {};
  for (const e of D.empleados) {
    const r = await post('pim/employees', { firstName: e.nombre, middleName: '', lastName: e.apellido, empPicture: null, employeeId: e.id });
    emp[e.id] = r.empNumber;
    await post(`pim/employees/${r.empNumber}/job-details`, { joinedDate: `${D.anio}-01-02`, jobTitleId: jt[e.puesto], empStatusId: es[e.estatus], subunitId: dep[e.dep], locationId: loc[e.ubi], jobCategoryId: null }, 'put');
    if (e.usuario) {
      await post('admin/users', { username: e.usuario, password: env.SEED_USER_PASSWORD, status: true, userRoleId: 2, empNumber: r.empNumber });
    }
  }

  // supervisor: en OrangeHRM no existe un rol de usuario "Supervisor"; se modela con linea de reporte
  const rm = await get('pim/reporting-methods?limit=0');
  let direct = rm.find((x: any) => x.name === 'Direct')?.id;
  if (!direct) direct = (await post('pim/reporting-methods', { name: 'Direct' })).id;
  for (const s of D.supervisor.subordinados) {
    await post(`pim/employees/${emp[s]}/supervisors`, { empNumber: emp[D.supervisor.id], reportingMethodId: direct });
  }

  // permisos
  const from = `${D.anio}-01-01`, to = `${D.anio}-12-31`;
  try { await post('leave/leave-period', { startMonth: 1, startDay: 1 }, 'put'); } catch (e: any) { console.log('leave-period:', e.message); }
  const lt: Record<string, number> = {};
  for (const n of D.tiposPermiso) lt[n] = (await post('leave/leave-types', { name: n, situational: false })).id;
  for (const e of D.empleados) for (const n of D.tiposPermiso) {
    await post('leave/leave-entitlements', { empNumber: emp[e.id], leaveTypeId: lt[n], fromDate: from, toDate: to, entitlement: D.derechos[n] });
  }

  // reclutamiento
  const v = await post('recruitment/vacancies', { name: D.vacante.nombre, jobTitleId: jt[D.vacante.puesto], employeeId: emp[D.vacante.gerente], numOfPositions: 1, description: 'Vacante de prueba', status: true, isPublished: true });
  for (const c of D.vacante.candidatos) {
    await post('recruitment/candidates', { firstName: c.nombre, middleName: null, lastName: c.apellido, email: c.email, contactNumber: null, keywords: null, comment: null, dateOfApplication: `${D.anio}-10-01`, consentToKeepData: false, vacancyId: v.id });
  }
  console.log('SEED OK', { loc, dep, jt, es, emp, lt, vacante: v.id });
  expect(Object.keys(emp).length).toBe(12);
});




