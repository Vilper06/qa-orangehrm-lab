import { chromium } from '@playwright/test';
import { ENV, LAB } from '../lib/config';
import * as path from 'path';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
(async () => {
  const r = await fetch('https://localhost:8443/json-rpc/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'Auth.login', params: [ENV.KIWI_ADMIN_USER, ENV.KIWI_ADMIN_PASSWORD] }) });
  const sid = (await r.json()).result;
  const b = await chromium.launch(); const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1400, height: 1000 } });
  await ctx.addCookies([{ name: 'sessionid', value: sid, domain: 'localhost', path: '/', secure: true, httpOnly: true }]);
  const p = await ctx.newPage();
  const shots: [string, string, boolean][] = [
    ['plan/1/', 'kiwi_plan.png', false], ['plan/2/', 'kiwi_plan_base.png', false],
    ['cases/search/?product=1', 'kiwi_lista_casos.png', true], ['runs/1/', 'kiwi_run_ciclo1.png', true], ['runs/2/', 'kiwi_run_ciclo2.png', true],
    ['runs/3/', 'kiwi_run_post_cr001.png', true], ['bugs/search/', 'kiwi_bugs.png', false], ['runs/search/', 'kiwi_runs_lista.png', false],
  ];
  for (const [u, f, full] of shots) {
    await p.goto('https://localhost:8443/' + u); await p.waitForLoadState('networkidle'); await p.waitForTimeout(3000);
    await p.screenshot({ path: path.join(LAB, 'evidencias', f), fullPage: full });
    console.log(f, (await p.title()).slice(0, 60));
  }
  await b.close();
})();
