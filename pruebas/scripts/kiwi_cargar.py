# Carga estructura y casos en Kiwi TCMS via JSON-RPC (credenciales desde ../../.env)
import json, sys, os, requests, urllib3
urllib3.disable_warnings()
LAB = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
env = dict(l.rstrip('\n').split('=', 1) for l in open(os.path.join(LAB, '.env'), encoding='utf8') if '=' in l)
URL = 'https://localhost:8443/json-rpc/'
s = requests.Session(); s.verify = False
_id = [0]
def rpc(method, *params):
    _id[0] += 1
    r = s.post(URL, json={'jsonrpc': '2.0', 'method': method, 'params': list(params) if len(params) != 1 or not isinstance(params[0], dict) else params[0], 'id': _id[0]}, headers={'Content-Type': 'application/json'})
    j = r.json()
    if 'error' in j: raise RuntimeError(f"{method}{params}: {j['error']}")
    return j['result']
def call(method, params):  # dict -> un unico argumento posicional; lista -> posicionales
    if isinstance(params, dict): params = [params]
    _id[0] += 1
    r = s.post(URL, json={'jsonrpc': '2.0', 'method': method, 'params': params, 'id': _id[0]})
    j = r.json()
    if 'error' in j: raise RuntimeError(f"{method} {params}: {j['error']}")
    return j['result']

call('Auth.login', [env['KIWI_ADMIN_USER'], env['KIWI_ADMIN_PASSWORD']])
plan = json.load(open(os.path.join(LAB, 'casos_prueba.json'), encoding='utf8'))
state_f = os.path.join(LAB, 'resultados', 'kiwi_ids.json'); state = {}

cls = (call('Classification.filter', {}) or [call('Classification.create', {'name': 'Implantación de software'})])[0]['id']
prod = call('Product.filter', {'name': 'OrangeHRM – Grupo Comercial Andes'})
prod = prod[0] if prod else call('Product.create', {'name': 'OrangeHRM – Grupo Comercial Andes', 'classification': cls, 'description': 'Implantación de OrangeHRM para Grupo Comercial Andes S.A. de C.V. (cliente ficticio). Proyecto NCS.'})
state['product'] = prod['id']
vers = {}
for v in ['5.8.1', '5.9']:
    x = call('Version.filter', {'product': prod['id'], 'value': v}) or [call('Version.create', {'product': prod['id'], 'value': v})]
    vers[v] = x[0]['id']
builds = {}
for name, v in [('5.8.1-base', '5.8.1'), ('5.9-rc1', '5.9'), ('5.9-rc1.1', '5.9')]:
    x = call('Build.filter', {'name': name, 'version': vers[v]}) or [call('Build.create', {'name': name, 'version': vers[v]})]
    builds[name] = x[0]['id']
state.update({'versions': vers, 'builds': builds})

ptype = call('PlanType.filter', {'name': 'Acceptance'})[0]['id']
tp_name = 'PP-NCS-OHRM-001 Plan de pruebas de implantación'
tp = call('TestPlan.filter', {'name': tp_name}) or [call('TestPlan.create', {'name': tp_name, 'product': prod['id'], 'product_version': vers['5.9'], 'type': ptype, 'is_active': True,
    'text': 'Plan de pruebas de implantación de OrangeHRM (v1 5.8.1 línea base; v2 5.9 candidata). 10 RF, 6 RNF, 42 casos.'})]
tp = tp[0]; state['plan'] = tp['id']

prios = {p['value']: p['id'] for p in call('Priority.filter', {})}
pmap = {'Alta': 'P1', 'Media': 'P3', 'Baja': 'P5'}
status = call('TestCaseStatus.filter', {'name': 'CONFIRMED'})[0]['id']
cats = {}
for m in sorted({c['modulo'] for c in plan['casos']}):
    x = call('Category.filter', {'name': m, 'product': prod['id']}) or [call('Category.create', {'name': m, 'product': prod['id']})]
    cats[m] = x[0]['id']
cases = {}
for c in plan['casos']:
    summ = f"{c['id']} · {c['titulo']}"
    ex = call('TestCase.filter', {'summary': summ, 'category__product': prod['id']})
    text = (f"**Precondiciones:** {c['precondiciones']}\n\n**Datos:** {c['datos']}\n\n**Rol:** {c['rol']}\n\n**Pasos:**\n{c['pasos']}\n\n**Resultado esperado:** {c['resultado_esperado']}\n\n"
            f"**Técnica:** {c['tecnica']} · **Requerimiento:** {c['requerimiento']}")
    if ex: tc = ex[0]
    else:
        tc = call('TestCase.create', {'summary': summ, 'product': prod['id'], 'category': cats[c['modulo']], 'priority': prios[pmap[c['prioridad']]], 'case_status': status, 'text': text, 'is_automated': True})
        for tag in [c['requerimiento'], c['tecnica'].lower()] + (['regresion'] if c['regresion_prioritaria'] else []):
            call('TestCase.add_tag', [tc['id'], tag])
        call('TestPlan.add_case', [tp['id'], tc['id']])
    cases[c['id']] = tc['id']
state['cases'] = cases
json.dump(state, open(state_f, 'w'), indent=2)
print('OK producto', prod['id'], 'plan', tp['id'], 'casos', len(cases))


