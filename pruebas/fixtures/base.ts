import { test as base, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LAB } from '../lib/config';

export interface Ev { page: Page; obtenido: string; obs: string[]; estado?: 'Bloqueado'; after?: () => Promise<void>; }

/** Nota discrepancia de redaccion: si ningun texto real contiene el esperado, lo registra como observacion (no falla). */
export function textoEsperado(ev: Ev, reales: string[], esperado: string) {
  const ok = reales.some(r => r.toLowerCase().includes(esperado.toLowerCase()));
  if (!ok) ev.obs.push(`texto real: ${reales.length ? reales.join(' / ') : '(sin mensaje)'} (esperado: ${esperado})`);
  return ok;
}

export const test = base.extend<{ ev: Ev }>({
  ev: [async ({ page }, use, testInfo) => {
    const ev: Ev = { page, obtenido: '', obs: [] };
    await use(ev);
    const id = testInfo.title.match(/^CP-\d+/)?.[0];
    if (!id) return;
    const sub = (process.env.EVID_TAG || testInfo.project.name.split('-')[0]);
    const dir = path.join(LAB, 'evidencias', sub); fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, id + '.png');
    try { await ev.page.screenshot({ path: file, fullPage: false }); } catch { /* pagina cerrada */ }
    await ev.after?.();
    testInfo.annotations.push({ type: 'evidencia', description: path.relative(LAB, file).replace(/\\/g, '/') });
    testInfo.annotations.push({ type: 'obtenido', description: ev.obtenido });
    testInfo.annotations.push({ type: 'obs', description: ev.obs.join(' | ') });
    if (ev.estado) testInfo.annotations.push({ type: 'estado', description: ev.estado });
  }, { auto: true }],
});
export { expect };

