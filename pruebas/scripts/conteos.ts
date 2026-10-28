import { chromium } from '@playwright/test';
import { ADMIN, PORTS } from '../lib/config';
(async () => {
  const b = await chromium.launch(); const out: any[] = [];
  for (const [v, port] of Object.entries(PORTS)) {
    const p = await b.newPage();
    await p.goto(`http://localhost:${port}/web/index.php/auth/login`);
    await p.getByPlaceholder('Username').fill(ADMIN.user); await p.getByPlaceholder('Password').fill(ADMIN.pass);
    await p.getByRole('button', { name: 'Login' }).click(); await p.waitForURL(/dashboard/);
    const g = async (u: string) => JSON.parse(await (await p.request.get(`http://localhost:${port}/web/index.php/api/v2/${u}`)).text());
    const y = new Date().getFullYear();
    out.push({ version: v, empleados: (await g('pim/employees?limit=50')).meta.total, usuarios: (await g('admin/users?limit=50')).meta.total,
      derechos: (await g(`leave/leave-entitlements?empNumber=3&fromDate=${y}-01-01&toDate=${y}-12-31`)).meta.sum });
    await p.close();
  }
  await b.close();
  console.log('CONTEOS::' + JSON.stringify(out));
})();
