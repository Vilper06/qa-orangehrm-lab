// Uso: npx tsx scripts/analisis.ts <ciclo.json> <zap_alertas.json> <salida.md> "<titulo>"
import * as fs from 'fs';
import * as path from 'path';
import { LAB } from '../lib/config';
const [cicloF, zapF, outF, titulo] = process.argv.slice(2);
const rd = (f: string) => JSON.parse(fs.readFileSync(path.isAbsolute(f) ? f : path.join(LAB, 'resultados', f), 'utf8'));
const plan = rd(path.join(LAB, 'casos_prueba.json'));
const res: any[] = rd(cicloF);
const zap: any[] = fs.existsSync(path.join(LAB, 'resultados', zapF)) ? rd(zapF) : [];
const por = new Map(res.map(r => [r.id, r]));
const ESTADOS = ['Pasa', 'Falla', 'Bloqueado', 'No ejecutado'];
const cuenta = (xs: any[]) => ESTADOS.map(e => xs.filter(x => x.estado === e).length);
const casos = plan.casos.map((c: any) => ({ ...c, estado: por.get(c.id)?.estado ?? 'No ejecutado', r: por.get(c.id) }));
const tabla = (cab: string[], filas: (string | number)[][]) => `| ${cab.join(' | ')} |\n|${cab.map(() => '---').join('|')}|\n` + filas.map(f => `| ${f.join(' | ')} |`).join('\n');
const pct = (a: number, b: number) => (b ? (100 * a / b).toFixed(1) + ' %' : 'n/a');

const tot = cuenta(casos);
const ejecutados = casos.filter((c: any) => c.estado === 'Pasa' || c.estado === 'Falla').length;
let md = `# ${titulo}\n\nGenerado: ${new Date().toISOString()} · Casos del plan: ${casos.length}\n\n## 1. Totales por estado\n\n` +
  tabla(['Estado', 'Casos', '%'], ESTADOS.map((e, i) => [e, tot[i], pct(tot[i], casos.length)])) +
  `\n\n**% de aprobacion** = Pasa / (Pasa + Falla) = ${tot[0]} / ${ejecutados} = **${pct(tot[0], ejecutados)}** (los Bloqueados no cuentan como ejecutados).\n\n## 2. Totales por modulo y densidad de defectos\n\nDensidad de defectos = casos con Falla del modulo / casos del modulo (defectos/caso).\n\n`;
const mods = [...new Set(casos.map((c: any) => c.modulo))] as string[];
md += tabla(['Modulo', 'Casos', 'Pasa', 'Falla', 'Bloqueado', 'No ejec.', '% aprobacion', 'Densidad defectos'],
  mods.map(m => { const xs = casos.filter((c: any) => c.modulo === m); const c = cuenta(xs); return [m, xs.length, c[0], c[1], c[2], c[3], pct(c[0], c[0] + c[1]), (c[1] / xs.length).toFixed(2)]; }));
md += `\n\n## 3. Totales por requerimiento\n\n`;
const reqs = [...plan.requerimientos_funcionales.map((r: any) => ({ id: r.id, n: r.nombre })), ...plan.requerimientos_no_funcionales.map((r: any) => ({ id: r.id, n: r.atributo }))];
md += tabla(['Requerimiento', 'Nombre', 'Casos', 'Pasa', 'Falla', 'Bloqueado', 'No ejec.'],
  reqs.map(r => { const xs = casos.filter((c: any) => c.requerimiento === r.id); const c = cuenta(xs); return [r.id, r.n, xs.length, c[0], c[1], c[2], c[3]]; }));
const cubiertos = reqs.filter(r => casos.some((c: any) => c.requerimiento === r.id && (c.estado === 'Pasa' || c.estado === 'Falla')));
const cF = cubiertos.filter(r => r.id.startsWith('RF')).length, cN = cubiertos.filter(r => r.id.startsWith('RNF')).length;
md += `\n\n## 4. Cobertura de requerimientos\n\nRF con al menos un caso ejecutado: **${cF} de ${plan.requerimientos_funcionales.length}** (${pct(cF, plan.requerimientos_funcionales.length)}). RNF con al menos un caso ejecutado: **${cN} de ${plan.requerimientos_no_funcionales.length}** (${pct(cN, plan.requerimientos_no_funcionales.length)}).\n`;
const sinCubrir = reqs.filter(r => !cubiertos.includes(r));
if (sinCubrir.length) md += `\nSin cobertura ejecutada: ${sinCubrir.map(r => r.id).join(', ')}.\n`;
md += `\n## 5. Detalle por caso\n\n` + tabla(['Caso', 'Req.', 'Titulo', 'Estado', 'Resultado obtenido'], casos.map((c: any) => [c.id, c.requerimiento, c.titulo, c.estado, (c.r?.resultado_obtenido ?? '').replace(/\|/g, '/').slice(0, 160)]));
const disc = casos.filter((c: any) => c.r?.observaciones?.includes('texto real'));
md += `\n\n## 6. Discrepancias de redaccion (no son defectos)\n\n` + (disc.length ? tabla(['Caso', 'Observacion'], disc.map((c: any) => [c.id, c.r.observaciones.replace(/\|/g, '/')])) : 'Ninguna: todos los mensajes coincidieron con el texto esperado.');
md += `\n\n## 7. Alertas WARN de ZAP (CP-39)\n\n` + (zap.length ? tabla(['ID de regla', 'Nombre', 'Riesgo', 'Instancias'], zap.map(a => [a.id, a.nombre, a.riesgo, a.instancias])) : 'No hay archivo de alertas.');
const fallas = casos.filter((c: any) => c.estado === 'Falla'), bloq = casos.filter((c: any) => c.estado === 'Bloqueado');
md += `\n\n## 8. Fallas y bloqueos\n\n` + (fallas.length ? fallas.map((c: any) => `- **${c.id}** ${c.titulo}: ${c.r?.resultado_obtenido}`).join('\n') : 'Sin fallas.') +
  `\n\n` + (bloq.length ? 'Bloqueados:\n' + bloq.map((c: any) => `- **${c.id}** ${c.titulo}: ${c.r?.resultado_obtenido} ${c.r?.observaciones}`).join('\n') : '');
fs.writeFileSync(path.join(LAB, 'resultados', outF), md + '\n', 'utf8');
console.log('escrito', outF, tot.join('/'));
