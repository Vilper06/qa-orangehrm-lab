# Carga Test Runs y resultados de los ciclos en Kiwi TCMS
import json, os, requests, urllib3, datetime
urllib3.disable_warnings()
LAB = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
env = dict(l.rstrip('\n').split('=', 1) for l in open(os.path.join(LAB, '.env'), encoding='utf8') if '=' in l)
s = requests.Session(); s.verify = False; n = [0]
def call(m, p):
    if isinstance(p, dict): p = [p]
    n[0] += 1
    j = s.post('https://localhost:8443/json-rpc/', json={'jsonrpc': '2.0', 'method': m, 'params': p, 'id': n[0]}).json()
    if 'error' in j: raise RuntimeError(f"{m} {p}: {j['error']}")
    return j['result']
call('Auth.login', [env['KIWI_ADMIN_USER'], env['KIWI_ADMIN_PASSWORD']])
st = json.load(open(os.path.join(LAB, 'resultados', 'kiwi_ids.json'), encoding='utf8'))
mgr = call('User.filter', {'username': env['KIWI_ADMIN_USER']})[0]['id']
S = {x['name']: x['id'] for x in call('TestExecutionStatus.filter', {})}
MAP = {'Pasa': 'PASSED', 'Falla': 'FAILED', 'Bloqueado': 'BLOCKED', 'No ejecutado': 'IDLE'}
rd = lambda f: json.load(open(os.path.join(LAB, 'resultados', f), encoding='utf8'))
reprueba = rd('reprueba_CR001.json')
runs = [
  ('Ciclo 1 – v1 OrangeHRM 5.8.1 (línea base)', '5.8.1-base', rd('ciclo1_v1.json')),
  ('Ciclo 2 – v2 OrangeHRM 5.9 (regresión completa)', '5.9-rc1', rd('ciclo2_v2.json')),
  ('Reprueba CR-001 y regresión posterior – v2 5.9 con cabeceras (CP-01..CP-36 y CP-39)', '5.9-rc1.1', rd('regresion_post_CR001.json') + reprueba),
]
# Kiwi exige que la version del plan coincida con la del build: plan hermano para la linea base 5.8.1
pt = call('PlanType.filter', {'name': 'Acceptance'})[0]['id']
nombre_base = 'PP-NCS-OHRM-001 Plan de pruebas de implantación (línea base 5.8.1)'
pb = call('TestPlan.filter', {'name': nombre_base}) or [call('TestPlan.create', {'name': nombre_base, 'product': st['product'], 'product_version': st['versions']['5.8.1'], 'type': pt, 'is_active': True,
    'text': 'Mismo plan PP-NCS-OHRM-001 aplicado a la versión base 5.8.1 (Ciclo 1). Contiene los mismos 42 casos.'})]
pb = pb[0]
if not call('TestCase.filter', {'plan': pb['id']}):
    for cid in st['cases'].values(): call('TestPlan.add_case', [pb['id'], cid])
st['plan_base'] = pb['id']
out = {}
for name, build, rows in runs:
    import datetime as _d
    loc = lambda t: (_d.datetime.fromisoformat(t.replace('Z', '+00:00')) - _d.timedelta(hours=6)).strftime('%Y-%m-%d %H:%M:%S')  # hora local (UTC-6), sin zona
    fechas = sorted(loc(r['fecha_hora']) for r in rows)
    run = call('TestRun.create', {'summary': name, 'manager': mgr, 'plan': (st['plan_base'] if build == '5.8.1-base' else st['plan']), 'build': st['builds'][build], 'start_date': fechas[0], 'stop_date': fechas[-1],
                                  'notes': 'Ejecución automatizada con Playwright, k6, ZAP y Lighthouse. Evidencias en el repositorio del laboratorio.'})
    cnt = {}
    for r in rows:
        ex = call('TestRun.add_case', [run['id'], st['cases'][r['id']]])
        ex = ex[0] if isinstance(ex, list) else ex
        com = (r['resultado_obtenido'] or '') + ((' | ' + r['observaciones']) if r.get('observaciones') else '')
        call('TestExecution.update', [ex['id'], {'status': S[MAP[r['estado']]], 'comment': com[:3000]}])
        cnt[r['estado']] = cnt.get(r['estado'], 0) + 1
    out[name] = {'run': run['id'], 'conteo': cnt}
    print(run['id'], name, cnt)
json.dump(out, open(os.path.join(LAB, 'resultados', 'kiwi_runs.json'), 'w'), indent=2, ensure_ascii=False)



