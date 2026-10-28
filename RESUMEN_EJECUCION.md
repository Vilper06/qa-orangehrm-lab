# Resumen de ejecución — Proyecto OrangeHRM / Grupo Comercial Andes (NCS)

Equipo QA: Nodo Calidad de Software (NCS). Fuente única de casos: `casos_prueba.json` (10 RF, 6 RNF, 42 casos CP-01 a CP-42). Horas locales (UTC-6), 15 de octubre de 2026.

## 1. Ciclos ejecutados
| Ciclo | Versión / build | Inicio – fin | Alcance |
|---|---|---|---|
| Ciclo 1 (línea base) | v1 OrangeHRM 5.8.1 · `5.8.1-base` | 18:43 – 18:52 | CP-01 a CP-42 |
| Ciclo 2 (regresión) | v2 OrangeHRM 5.9 · `5.9-rc1` | 18:53 – 19:00 | CP-01 a CP-42 |
| Reprueba CR-001 | v2 · `5.9-rc1.1` | 19:03 | CP-39 (ZAP) |
| Regresión posterior a CR-001 | v2 · `5.9-rc1.1` | 19:04 – 19:08 | CP-01 a CP-36 |

Antes de cada ciclo se ejecutó `reset.ps1` (ambas BD a datos semilla). Playwright con `retries: 0` y un solo worker.

## 2. Totales por estado
| Ciclo | Pasa | Falla | Bloqueado | No ejecutado | % aprobación (Pasa/(Pasa+Falla)) |
|---|---|---|---|---|---|
| Ciclo 1 v1 | 41 | 0 | 1 (CP-41) | 0 | 100 % |
| Ciclo 2 v2 | 41 | 0 | 1 (CP-41) | 0 | 100 % |
| Regresión post CR-001 (CP-01..36) | 36 | 0 | 0 | 0 | 100 % |
| Reprueba CR-001 (CP-39) | 1 | 0 | 0 | 0 | 100 % |

Comparativa caso por caso v1 vs v2: **0 cambios de estado, 0 regresiones** (`comparativa_v1_v2.md`). Cobertura: 10 de 10 RF y 4 de 6 RNF con casos ejecutados (RNF-04 solo parcial; **RNF-06 no tiene ningún caso en el plan**).

## 3. Defectos
**No se registraron defectos DEF-xx**: ningún caso quedó en *Falla* en ningún ciclo (`defectos.json`, `defectos.md`). Hallazgos que no son defectos:
- **H-01** ZAP 10003 *Vulnerable JS Library* (High (Medium)) en v1 y v2; el baseline lo reporta como WARN (FAIL = 0), así que CP-39 cumple su resultado esperado. Requiere actualización por parte del fabricante.
- **H-02** CP-41 **Bloqueado**: Firefox y WebKit no pueden iniciarse por una política de Control de aplicaciones de Windows (App Control for Business) del equipo. Chromium: smoke 6/6 OK en v1 y v2.
- **H-03** CP-28: texto real «Leave Balance Exceeded» en lugar de «Balance not sufficient». Discrepancia de redacción: **Pasa** con observación (única de los 42 casos).
- **H-04** El plan no incluye casos para RNF-06 (Portabilidad).

## 4. Reprueba de CR-001 (cabeceras de seguridad, solo v2)
Cambio: `config/security-headers.conf` + `config/headers.load` montados en `ohrm_v2` por `docker-compose.yml` (`X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`, `Referrer-Policy`, `COOP`/`CORP: same-origin`, `ServerTokens Prod`, se quita `X-Powered-By`). No se añadió CSP restrictiva ni COEP. Diff: `evidencias/cr001.diff`; commit `fix(CR-001)`, etiqueta `entorno-v1.1`.

| | Antes (v2 5.9-rc1) | Después (5.9-rc1.1) |
|---|---|---|
| ZAP baseline | FAIL 0 · WARN 13 · PASS 54 | FAIL 0 · WARN 7 · PASS 60 |
| Alertas | 16 entradas | 8 entradas |

Resueltas: 10020 Anti-clickjacking, 90004 COOP, 90004 CORP, 10063 Permissions Policy, 10021 X-Content-Type-Options, 10037 X-Powered-By, 10036 versión en `Server`, 10009 banner en página. Persisten: 10003 Vulnerable JS Library (High), 10038 CSP no definida (Medium), 10044 Big Redirect, 90004 COEP, 10109, 10049 (x2), 10112. Regresión posterior: **36/36 Pasa**: el cambio no rompió funcionalidad. Propuestas CR-002 en adelante (no implementadas): `propuestas_cambio.md`.

## 5. Métricas por versión (login de cada instancia)
| Métrica | v1 5.8.1 | v2 5.9 |
|---|---|---|
| k6 5 VUs, 30 s (CP-37) | p95 119 ms, avg 85 ms, 0 % errores, 140 solicitudes | p95 118 ms, avg 86 ms, 0 % errores, 140 solicitudes |
| k6 20 VUs, 60 s login+dashboard (CP-38) | p95 458 ms, avg 203 ms, 0 % errores, 3 000 solicitudes | p95 488 ms, avg 178 ms, 0 % errores, 3 200 solicitudes |
| ZAP baseline (CP-39) | FAIL 0 · WARN 13 · PASS 54 | FAIL 0 · WARN 13 · PASS 54 (tras CR-001: WARN 7) |
| Lighthouse (CP-40) | Accesibilidad 86 · Rendimiento 53 · Buenas prácticas 100 · SEO 91 | Accesibilidad 86 · Rendimiento 55 · Buenas prácticas 100 · SEO 91 |
| Restauración (CP-42) | 51.8 s (ambas BD) | 40.9 s (ambas BD) |
Umbrales del plan: k6 p95 < 2 s / < 3 s y < 1 % errores; ZAP 0 FAIL; Lighthouse accesibilidad ≥ 80 y rendimiento ≥ 50 (el rendimiento 53/55 supera por poco el mínimo y varía entre corridas). CP-42: 13 empleados, 5 usuarios y 17 días de derechos (E002: 12 + 5) por instancia; hay 24 registros de derecho en total.

## 6. Control de versiones
| Commit | Etiqueta | Mensaje |
|---|---|---|
| d5b971f | `entorno-v1.0` | chore: entorno inicial OrangeHRM v1/v2 con Docker, datos semilla y smoke Playwright |
| 7fc4b20 | `pruebas-v1.0` | test: suite funcional CP-01..CP-36 y orquestador de ciclo (CP-37..CP-42) |
| 5697fa1 | `entorno-v1.1` | fix(CR-001): endurecer cabeceras HTTP de seguridad en ohrm_v2 |
| 1d1b7e5 | — | docs: resultados de los ciclos, comparativa, reprueba CR-001, defectos y carga en Kiwi |
Historial exportado: `evidencias/git_historial.txt`.

## 7. Kiwi TCMS
Instalado con Docker (compose oficial adaptado) en https://localhost:8443; usuario y contraseña en `.env` (no incluido en la entrega). Producto «OrangeHRM – Grupo Comercial Andes»; versiones 5.8.1 y 5.9; builds `5.8.1-base`, `5.9-rc1`, `5.9-rc1.1`; plan **PP-NCS-OHRM-001** (Acceptance) con los 42 casos (`CP-xx · título`, prioridad, categoría por módulo, texto completo y etiquetas RF/técnica/`regresion`). Test Runs: TR-1 Ciclo 1 (41 PASSED, 1 BLOCKED), TR-2 Ciclo 2 (41/1), TR-3 reprueba y regresión posterior (37 PASSED). Capturas `evidencias/kiwi_*.png`. La lista de bugs está vacía porque no hubo defectos.

## 8. Problemas encontrados
1. **Control de aplicaciones de Windows** bloquea Firefox y WebKit (CP-41 Bloqueado). No se intentó evadir la política.
2. Kiwi exige que la versión del plan coincida con la del build; se creó un plan hermano «línea base 5.8.1» (TP-2) con los mismos 42 casos para registrar el Ciclo 1.
3. Errores propios del script durante la preparación, ya corregidos: fechas calculadas en UTC (un día de desfase), campo de fecha que concatenaba valores, y una ruta mal leída que marcó CP-41 como Falla por error. Por esto último, CP-41 del Ciclo 1 se volvió a ejecutar de forma aislada (misma versión, sin reiniciar datos). La evidencia de CP-12 se regeneró aparte en los tres ciclos (el resultado del caso no cambió).
4. Dos pruebas empezaron con aserciones demasiado laxas (CP-25, CP-27, CP-28) y se endurecieron para exigir el mensaje relevante antes del ciclo oficial.
5. ZAP baseline clasifica todo como WARN, de modo que una alerta de riesgo alto (10003) no produce FAIL; el resultado esperado del plan se evaluó tal como está escrito (0 FAIL).
6. La zona horaria de OrangeHRM no es configurable a nivel instancia (nota del Prompt 1).
