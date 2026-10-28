import type { Reporter, TestCase, TestResult, FullConfig } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/** Reporter por caso: escribe resultados/raw_<salida>.json con el formato del plan */
export default class CpReporter implements Reporter {
  rows: any[] = [];
  out = process.env.RAW_OUT || 'raw_funcional.json';
  onTestEnd(test: TestCase, r: TestResult) {
    const id = test.title.match(/^(CP-\d+)/)?.[1];
    if (!id) return;
    const an = (t: string) => r.annotations.find(a => a.type === t)?.description ?? test.annotations.find(a => a.type === t)?.description ?? '';
    let estado = r.status === 'passed' ? 'Pasa' : r.status === 'skipped' ? 'No ejecutado' : 'Falla';
    if (an('estado') === 'Bloqueado') estado = 'Bloqueado';
    const err = r.error?.message?.replace(/\u001b\[[0-9;]*m/g, '').split('\n').slice(0, 6).join(' ').slice(0, 500) ?? '';
    const obtenido = estado === 'Falla' ? (an('obtenido') ? an('obtenido') + ' | ' : '') + err : an('obtenido') || (estado === 'Pasa' ? 'Cumple el resultado esperado' : '');
    this.rows.push({
      id, version: test.parent.project()!.name.split('-')[0], navegador: test.parent.project()!.name,
      estado, resultado_obtenido: obtenido, observaciones: an('obs'),
      duracion_ms: r.duration, evidencia: an('evidencia'), fecha_hora: r.startTime.toISOString(),
    });
  }
  onEnd() {
    const dir = path.resolve(__dirname, '..', '..', 'resultados'); fs.mkdirSync(dir, { recursive: true });
    this.rows.sort((a, b) => a.id.localeCompare(b.id));
    fs.writeFileSync(path.join(dir, this.out), JSON.stringify(this.rows, null, 2), 'utf8');
  }
}
