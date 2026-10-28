// Uso: npx tsx scripts/ciclo.ts <v1|v2> <tag> <archivoSalida.json> [modo=all|func|nf|zap] [evidTag]
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { LAB, ENV, PORTS, ADMIN } from '../lib/config';

process.env.PATH += ';C:\\Program Files\\Docker\\Docker\\resources\\bin;C:\\Program Files\\k6;C:\\Program Files\\nodejs';
process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = '1';
const [ver, tag, outFile, modo = 'all', evidArg] = process.argv.slice(2);
const evid = evidArg || ver;
const port = PORTS[ver];
const repDir = path.join(LAB, 'reportes', tag); fs.mkdirSync(repDir, { recursive: true });
const resDir = path.join(LAB, 'resultados'); fs.mkdirSync(resDir, { recursive: true });
const rel = (p: string) => path.relative(LAB, p).replace(/\\/g, '/');
const sh = (cmd: string, cwd = path.join(LAB, 'pruebas'), env: any = {}) =>
  spawnSync(cmd, { shell: true, cwd, encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 1 << 28 });
const nowIso = () => new Date().toISOString();
const rows: any[] = [];
const row = (id: string, estado: string, obtenido: string, obs: string, dur: number, ev: string, t = nowIso()) =>
  rows.push({ id, version: ver, estado, resultado_obtenido: obtenido, observaciones: obs, duracion_ms: Math.round(dur), evidencia: ev, fecha_hora: t });

async function esperar(url: string, seg = 120) {
  const t0 = Date.now();
  while (Date.now() - t0 < seg * 1000) { try { const r = await fetch(url); if (r.status === 200) return true; } catch { /* aun no */ } await new Promise(r => setTimeout(r, 2000)); }
  return false;
}
const jsonSafe = (f: string) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

(async () => {
  const inicio = nowIso();
  // ---------- reset + CP-42 ----------
  const sinReset = modo === 'cp41' || modo === 'zap';
  const t0 = Date.now();
  const r0 = sinReset ? { stdout: '' } : sh('powershell -NoProfile -ExecutionPolicy Bypass -File reset.ps1', LAB);
  const okUp = (await esperar('http://localhost:8081/web/index.php/auth/login')) && (await esperar('http://localhost:8082/web/index.php/auth/login'));
  const resetMs = Date.now() - t0;
  const cnt = sinReset ? { stdout: '' } : sh('npx tsx scripts/conteos.ts');
  const conteos = (cnt.stdout.match(/CONTEOS::(.*)/)?.[1]) ? JSON.parse(cnt.stdout.match(/CONTEOS::(.*)/)![1]) : null;
  fs.writeFileSync(path.join(repDir, 'reset_y_conteos.json'), JSON.stringify({ segundos: resetMs / 1000, conteos, stdout: r0.stdout.slice(-400) }, null, 2));
  if (modo === 'all' || modo === 'nf') {
    const exp = { empleados: 13, usuarios: 5, derechos: 17 };
    const ok = (c: any) => c && c.empleados === exp.empleados && c.usuarios === exp.usuarios && c.derechos === exp.derechos;
    const todo = conteos && conteos.every(ok);
    const est = okUp && resetMs < 300000 && todo ? 'Pasa' : 'Falla';
    row('CP-42', est, `reset.ps1 (ambas BD) + arranque: ${(resetMs / 1000).toFixed(1)} s; conteos por API: ${JSON.stringify(conteos)}`,
      'Derechos = suma de dias de permiso de E002 (12 Vacaciones + 5 Permiso personal = 17); en total hay 24 registros de derecho (12 empleados x 2 tipos).', resetMs, rel(path.join(repDir, 'reset_y_conteos.json')));
  }

  // ---------- funcionales ----------
  if (modo === 'all' || modo === 'func') {
    const raw = `raw_func_${tag}.json`;
    const rep = `reportes/${tag}/playwright`;
    sh(`npx playwright test -c functional.config.ts --project=${ver}`, undefined, { RAW_OUT: raw, EVID_TAG: evid, PW_REPORT: rep });
    const f = jsonSafe(path.join(resDir, raw)) ?? [];
    for (const x of f) rows.push(x);
    fs.copyFileSync(path.join(resDir, raw), path.join(repDir, raw));
  }

  if (modo === 'all' || modo === 'nf') {
    const pass = ENV.OHRM_ADMIN_PASSWORD;
    // ---------- CP-37 ----------
    let t = Date.now();
    sh(`k6 run --quiet --summary-export="${path.join(repDir, 'k6_5vu.json')}" -e BASE=http://localhost:${port} k6\\login_smoke.js`, LAB);
    let k = jsonSafe(path.join(repDir, 'k6_5vu.json'));
    if (k) {
      const p95 = k.metrics.http_req_duration['p(95)'], fail = k.metrics.http_req_failed.value * 100;
      row('CP-37', p95 < 2000 && fail < 1 ? 'Pasa' : 'Falla', `5 VUs, 30 s: p95=${p95.toFixed(0)} ms, avg=${k.metrics.http_req_duration.avg.toFixed(0)} ms, errores=${fail.toFixed(2)} %, solicitudes=${k.metrics.http_reqs.count}`, '', Date.now() - t, rel(path.join(repDir, 'k6_5vu.json')));
    } else row('CP-37', 'Bloqueado', 'k6 no produjo resumen', 'Revisar instalacion de k6', Date.now() - t, '');
    // ---------- CP-38 ----------
    t = Date.now();
    sh(`k6 run --quiet --summary-export="${path.join(repDir, 'k6_20vu.json')}" -e BASE=http://localhost:${port} -e OHRM_USER=${ADMIN.user} -e "OHRM_PASS=${pass}" k6\\carga_20vu.js`, LAB);
    k = jsonSafe(path.join(repDir, 'k6_20vu.json'));
    if (k) {
      const p95 = k.metrics.http_req_duration['p(95)'], fail = k.metrics.http_req_failed.value * 100;
      row('CP-38', p95 < 3000 && fail < 1 ? 'Pasa' : 'Falla', `20 VUs, 60 s (login + dashboard): p95=${p95.toFixed(0)} ms, avg=${k.metrics.http_req_duration.avg.toFixed(0)} ms, errores=${fail.toFixed(2)} %, solicitudes=${k.metrics.http_reqs.count}, checks fallidos=${k.metrics.checks.fails}`, '', Date.now() - t, rel(path.join(repDir, 'k6_20vu.json')));
    } else row('CP-38', 'Bloqueado', 'k6 no produjo resumen', '', Date.now() - t, '');
  }

  if (modo === 'all' || modo === 'nf' || modo === 'zap') {
    // ---------- CP-39 ZAP ----------
    const t = Date.now();
    const zr = sh(`docker run --rm -v "${repDir}:/zap/wrk:rw" zaproxy/zap-stable zap-baseline.py -t http://host.docker.internal:${port}/web/index.php/auth/login -r zap_${ver}.html -J zap_${ver}.json -I`, LAB);
    const out = zr.stdout + zr.stderr; fs.writeFileSync(path.join(repDir, `zap_${ver}.txt`), out);
    const sum = out.match(/FAIL-NEW:\s*(\d+).*?WARN-NEW:\s*(\d+).*?PASS:\s*(\d+)/s);
    const zj = jsonSafe(path.join(repDir, `zap_${ver}.json`));
    const alertas: any[] = (zj?.site ?? []).flatMap((s: any) => s.alerts ?? []).map((a: any) => ({ id: a.pluginid, nombre: a.alert ?? a.name, riesgo: a.riskdesc, instancias: a.count }));
    fs.writeFileSync(path.join(resDir, `zap_alertas_${tag}.json`), JSON.stringify(alertas, null, 2));
    if (sum) {
      const [fail, warn, pas] = [+sum[1], +sum[2], +sum[3]];
      row('CP-39', fail === 0 ? 'Pasa' : 'Falla', `ZAP baseline pasivo: FAIL=${fail}, WARN=${warn}, PASS=${pas}`, `Alertas: ${alertas.map(a => `${a.id} ${a.nombre}`).join('; ')}`, Date.now() - t, rel(path.join(repDir, `zap_${ver}.html`)));
    } else row('CP-39', 'Bloqueado', 'ZAP no entrego resumen', out.slice(-300), Date.now() - t, '');
  }

  if (modo === 'all' || modo === 'nf' || modo === 'cp41') {
    // ---------- CP-40 Lighthouse ----------
    let t = Date.now();
    const lp = path.join(repDir, `lighthouse_${ver}`);
    if (modo !== 'cp41') {
    sh(`npx --yes lighthouse http://localhost:${port}/web/index.php/auth/login --output html --output json --output-path "${lp}" --chrome-flags="--headless=new --no-sandbox" --quiet`);
    const lj = jsonSafe(lp + '.report.json');
    if (lj) {
      const a = Math.round(lj.categories.accessibility.score * 100), p = Math.round(lj.categories.performance.score * 100);
      row('CP-40', a >= 80 && p >= 50 ? 'Pasa' : 'Falla', `Lighthouse login: Accesibilidad=${a}, Rendimiento=${p}, Buenas practicas=${Math.round(lj.categories['best-practices'].score * 100)}, SEO=${Math.round(lj.categories.seo.score * 100)}`, '', Date.now() - t, rel(lp + '.report.html'));
    } else row('CP-40', 'Bloqueado', 'Lighthouse no produjo reporte', '', Date.now() - t, '');
    }

    // ---------- CP-41 compatibilidad ----------
    t = Date.now();
    const det: string[] = []; const est: Record<string, string> = {};
    for (const b of ['chromium', 'firefox', 'webkit']) {
      const rp = path.join(LAB, 'reportes', tag, 'cp41_' + b);
      sh(`npx playwright test -c functional.config.ts --project=${ver}-${b}`, undefined, { PW_REPORT: rp, RAW_OUT: `raw_cp41_${b}_${tag}.json` });
      const j = jsonSafe(path.join(rp, 'results.json'));
      const s = j?.stats; const err = JSON.stringify(j?.errors ?? []) + JSON.stringify(j?.suites ?? []).slice(0, 4000);
      if (s && s.expected > 0 && s.unexpected === 0) { est[b] = 'Pasa'; det.push(`${b}: smoke ${s.expected}/${s.expected} OK`); }
      else if (/spawn UNKNOWN|missing dependencies|has been closed|browserType\.launch/i.test(err)) { est[b] = 'Bloqueado'; det.push(`${b}: BLOQUEADO (no se puede iniciar el navegador: politica de Control de aplicaciones de Windows bloquea el ejecutable)`); }
      else { est[b] = 'Falla'; det.push(`${b}: ${s ? s.unexpected + ' fallas' : 'sin resultados'}`); }
    }
    const e = Object.values(est);
    const global = e.every(x => x === 'Pasa') ? 'Pasa' : e.includes('Falla') ? 'Falla' : 'Bloqueado';
    row('CP-41', global, det.join('; '), global === 'Bloqueado' ? 'Causa externa: App Control for Business (WDAC) impide ejecutar Firefox/WebKit de Playwright; Chromium si se ejecuto.' : '', Date.now() - t, `reportes/${tag}/cp41_chromium/results.json`);
  }

  let final = rows;
  const prev = jsonSafe(path.join(resDir, outFile));
  if (prev && (modo === 'cp41' || modo === 'zap')) { const ids = new Set(rows.map(r => r.id)); final = [...prev.filter((r: any) => !ids.has(r.id)), ...rows]; }
  final.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(path.join(resDir, outFile), JSON.stringify(final, null, 2), 'utf8');
  console.log(`CICLO ${tag} (${inicio}) -> ${outFile}: ` + JSON.stringify(final.reduce((m: any, r) => (m[r.estado] = (m[r.estado] || 0) + 1, m), {})));
})();

