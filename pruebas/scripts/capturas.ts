import { chromium } from '@playwright/test';
import * as fs from 'fs';
const env: Record<string,string> = {};
for (const l of fs.readFileSync('../.env','utf8').split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
(async () => {
  const b = await chromium.launch();
  for (const [v, port] of [['v1', 8081], ['v2', 8082]] as const) {
    const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
    await p.goto(`http://localhost:${port}/web/index.php/auth/login`);
    await p.getByPlaceholder('Username').fill(env.OHRM_ADMIN_USER);
    await p.getByPlaceholder('Password').fill(env.OHRM_ADMIN_PASSWORD);
    await p.getByRole('button', { name: 'Login' }).click();
    await p.waitForURL(/dashboard/);
    await p.waitForLoadState('networkidle');
    await p.screenshot({ path: `../evidencias/login_${v}.png` });
    await p.locator('.oxd-userdropdown-tab').click();
    await p.getByRole('menuitem', { name: 'About' }).click();
    const dlg = p.locator('.oxd-dialog-container-default--inner');
    await p.getByText(/Company Name|Version/).first().waitFor(); await p.waitForTimeout(1500);
    console.log(v, (await dlg.innerText()).replace(/\s+/g, ' ').slice(0, 300));
    await p.screenshot({ path: `../evidencias/about_${v}.png` });
  }
  await b.close();
})();

