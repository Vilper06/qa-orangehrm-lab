// Uso: npx tsx scripts/comparativa.ts <v1.json> <v2.json> <zap1.json> <zap2.json> <salida.md>
import * as fs from 'fs';
import * as path from 'path';
import { LAB } from '../lib/config';
const [f1, f2, z1, z2, out] = process.argv.slice(2);
const R = path.join(LAB, 'resultados');
const rd = (f: string) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const plan = JSON.parse(fs.readFileSync(path.join(LAB, 'casos_prueba.json'), 'utf8'));
const a: any[] = rd(f1), b: any[] = rd(f2), za: any[] = rd(z1), zb: any[] = rd(z2);
const ma = new Map(a.map(r => [r.id, r])), mb = new Map(b.map(r => [r.id, r]));
const num = (s: string, re: RegExp) => parseFloat(s?.match(re)?.[1] ?? 'NaN');
let md = `# Comparativa v1 (5.8.1) vs v2 (5.9)\n\nGenerado: ${new Date().toISOString()}\n\n## 1. Caso por caso\n\n| Caso | Titulo | Estado v1 | Estado v2 | Cambio |\n|---|---|---|---|---|\n`;
let reg = 0, mejoras = 0, cambios = 0;
const regresiones: string[] = [];
for (const c of plan.casos) {
  const e1 = ma.get(c.id)?.estado ?? 'No ejecutado', e2 = mb.get(c.id)?.estado ?? 'No ejecutado';
  const ch = e1 === e2 ? 'No' : (e1 === 'Pasa' && e2 === 'Falla') ? 'REGRESION' : e2 === 'Pasa' ? 'Mejora' : 'Si';
  if (ch === 'REGRESION') { reg++; regresiones.push(c.id); } else if (ch === 'Mejora') mejoras++; if (e1 !== e2) cambios++;
  md += `| ${c.id} | ${c.titulo} | ${e1} | ${e2} | ${ch} |\n`;
}
md += `\nCasos con cambio de estado: **${cambios}**; regresiones (Pasa->Falla): **${reg}**${regresiones.length ? ' (' + regresiones.join(', ') + ')' : ''}; mejoras: ${mejoras}.\n`;
// diferencias de comportamiento (texto obtenido distinto)
const difs = plan.casos.filter((c: any) => { const x = ma.get(c.id), y = mb.get(c.id); return x && y && c.id <= 'CP-36' && norm(x.resultado_obtenido) !== norm(y.resultado_obtenido); });
function norm(s: string) { return (s ?? '').replace(/\d{4}-\d{2}-\d{2}/g, 'FECHA').replace(/\s+/g, ' ').trim(); }
md += `\n## 2. Diferencias de comportamiento observadas (CP-01 a CP-36)\n\nSe comparo el resultado obtenido (fechas normalizadas).\n\n` + (difs.length ? difs.map((c: any) => `- **${c.id}** v1: ${ma.get(c.id).resultado_obtenido.slice(0, 200)}\n  - v2: ${mb.get(c.id).resultado_obtenido.slice(0, 200)}`).join('\n') : 'Sin diferencias de comportamiento observables entre v1 y v2 en los casos funcionales.');
// rendimiento
md += `\n\n## 3. Rendimiento (k6) y web (Lighthouse)\n\n| Caso | v1 | v2 |\n|---|---|---|\n`;
for (const id of ['CP-37', 'CP-38', 'CP-40', 'CP-42']) md += `| ${id} | ${ma.get(id)?.resultado_obtenido ?? ''} | ${mb.get(id)?.resultado_obtenido ?? ''} |\n`;
for (const id of ['CP-37', 'CP-38']) { const p1 = num(ma.get(id)?.resultado_obtenido, /p95=(\d+)/), p2 = num(mb.get(id)?.resultado_obtenido, /p95=(\d+)/); md += `\n${id}: p95 v1=${p1} ms, v2=${p2} ms (${isNaN(p1 + p2) ? 'n/a' : ((p2 - p1) / p1 * 100).toFixed(1) + ' %'}).`; }
// ZAP
const k = (xs: any[]) => new Map(xs.map(x => [x.id, x]));
const ka = k(za), kb = k(zb);
const nuevas = zb.filter(x => !ka.has(x.id)), resueltas = za.filter(x => !kb.has(x.id));
md += `\n\n## 4. Seguridad (ZAP baseline)\n\n- v1: ${ma.get('CP-39')?.resultado_obtenido}\n- v2: ${mb.get('CP-39')?.resultado_obtenido}\n\nAlertas nuevas en 5.9 (no estaban en 5.8.1): ${nuevas.length ? nuevas.map(x => `${x.id} ${x.nombre}`).join('; ') : 'ninguna'}.\n\nAlertas resueltas en 5.9: ${resueltas.length ? resueltas.map(x => `${x.id} ${x.nombre}`).join('; ') : 'ninguna'}.\n\nAlertas comunes: ${zb.filter(x => ka.has(x.id)).map(x => x.id).join(', ')}.\n`;
fs.writeFileSync(path.join(R, out), md, 'utf8');
console.log('escrito', out, 'regresiones:', reg);
