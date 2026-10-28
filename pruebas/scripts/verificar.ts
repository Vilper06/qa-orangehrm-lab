import { chromium } from '@playwright/test';
import * as fs from 'fs';
const env: Record<string,string> = {};
for (const l of fs.readFileSync('../.env','utf8').split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
(async () => {
  const b = await chromium.launch();
  for (const port of [8081, 8082]) {
    const p = await b.newPage();
    await p.goto(`http://localhost:${port}/web/index.php/auth/login`);
    await p.getByPlaceholder('Username').fill(env.OHRM_ADMIN_USER);
    await p.getByPlaceholder('Password').fill(env.OHRM_ADMIN_PASSWORD);
    await p.getByRole('button', { name: 'Login' }).click(); await p.waitForURL(/dashboard/);
    const g = async (u: string) => JSON.parse(await (await p.request.get(`http://localhost:${port}/web/index.php/api/v2/${u}`)).text());
    const y = new Date().getFullYear();
    const out = {
      empleados: (await g('pim/employees?limit=50')).meta.total,
      usuarios: (await g('admin/users?limit=50')).meta.total,
      ubicaciones: (await g('admin/locations?limit=50')).meta.total,
      puestos: (await g('admin/job-titles?limit=50')).meta.total,
      tiposPermiso: (await g('leave/leave-types?limit=50')).meta.total,
      derechos: (await g(`leave/leave-entitlements?empNumber=3&fromDate=${y}-01-01&toDate=${y}-12-31`)).meta?.sum,
      vacantes: (await g('recruitment/vacancies?limit=50')).meta.total,
      candidatos: (await g('recruitment/candidates?limit=50')).meta.total,
      superv_E002: (await g('pim/employees/3/supervisors')).meta.total,
    };
    console.log(port, JSON.stringify(out));
  }
  await b.close();
})();
