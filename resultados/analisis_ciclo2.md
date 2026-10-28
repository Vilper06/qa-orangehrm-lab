# Analisis del Ciclo 2 - OrangeHRM 5.9 (v2)

Generado: 2026-10-16T01:00:52.404Z · Casos del plan: 42

## 1. Totales por estado

| Estado | Casos | % |
|---|---|---|
| Pasa | 41 | 97.6 % |
| Falla | 0 | 0.0 % |
| Bloqueado | 1 | 2.4 % |
| No ejecutado | 0 | 0.0 % |

**% de aprobacion** = Pasa / (Pasa + Falla) = 41 / 41 = **100.0 %** (los Bloqueados no cuentan como ejecutados).

## 2. Totales por modulo y densidad de defectos

Densidad de defectos = casos con Falla del modulo / casos del modulo (defectos/caso).

| Modulo | Casos | Pasa | Falla | Bloqueado | No ejec. | % aprobacion | Densidad defectos |
|---|---|---|---|---|---|---|---|
| Autenticación | 6 | 6 | 0 | 0 | 0 | 100.0 % | 0.00 |
| Admin | 7 | 7 | 0 | 0 | 0 | 100.0 % | 0.00 |
| PIM | 10 | 10 | 0 | 0 | 0 | 100.0 % | 0.00 |
| Leave | 10 | 10 | 0 | 0 | 0 | 100.0 % | 0.00 |
| Recruitment | 3 | 3 | 0 | 0 | 0 | 100.0 % | 0.00 |
| No funcional | 6 | 5 | 0 | 1 | 0 | 100.0 % | 0.00 |

## 3. Totales por requerimiento

| Requerimiento | Nombre | Casos | Pasa | Falla | Bloqueado | No ejec. |
|---|---|---|---|---|---|---|
| RF-01 | Autenticación de usuarios | 6 | 6 | 0 | 0 | 0 |
| RF-02 | Gestión de usuarios del sistema | 6 | 6 | 0 | 0 | 0 |
| RF-03 | Alta de empleados | 6 | 6 | 0 | 0 | 0 |
| RF-04 | Búsqueda y filtrado de empleados | 3 | 3 | 0 | 0 | 0 |
| RF-05 | Línea de reporte (supervisor) | 1 | 1 | 0 | 0 | 0 |
| RF-06 | Derechos (entitlements) de permisos | 3 | 3 | 0 | 0 | 0 |
| RF-07 | Solicitud de permisos | 4 | 4 | 0 | 0 | 0 |
| RF-08 | Aprobación y rechazo de permisos | 3 | 3 | 0 | 0 | 0 |
| RF-09 | Reclutamiento | 3 | 3 | 0 | 0 | 0 |
| RF-10 | Control de acceso por rol | 1 | 1 | 0 | 0 | 0 |
| RNF-01 | Rendimiento | 2 | 2 | 0 | 0 | 0 |
| RNF-02 | Seguridad | 1 | 1 | 0 | 0 | 0 |
| RNF-03 | Accesibilidad y experiencia web | 1 | 1 | 0 | 0 | 0 |
| RNF-04 | Compatibilidad | 1 | 0 | 0 | 1 | 0 |
| RNF-05 | Recuperabilidad | 1 | 1 | 0 | 0 | 0 |
| RNF-06 | Portabilidad | 0 | 0 | 0 | 0 | 0 |

## 4. Cobertura de requerimientos

RF con al menos un caso ejecutado: **10 de 10** (100.0 %). RNF con al menos un caso ejecutado: **4 de 6** (66.7 %).

Sin cobertura ejecutada: RNF-04, RNF-06.

## 5. Detalle por caso

| Caso | Req. | Titulo | Estado | Resultado obtenido |
|---|---|---|---|---|
| CP-01 | RF-01 | Inicio de sesión válido | Pasa | Dashboard visible; usuario mostrado: Admin Andes |
| CP-02 | RF-01 | Contraseña incorrecta | Pasa | Mensaje: Invalid credentials; URL: http://localhost:8082/web/index.php/auth/login |
| CP-03 | RF-01 | Usuario inexistente | Pasa | Mensaje: Invalid credentials |
| CP-04 | RF-01 | Campos vacíos | Pasa | Mensajes bajo campos: Required / Required |
| CP-05 | RF-01 | Cierre de sesión y acceso posterior | Pasa | Tras logout, URL interna redirige a: http://localhost:8082/web/index.php/auth/login |
| CP-06 | RF-01 | URL interna sin sesión | Pasa | Redirigido a: http://localhost:8082/web/index.php/auth/login |
| CP-07 | RF-02 | Crear usuario ESS válido | Pasa | Toast: Success Successfully Saved ×; usuario en lista: 1 fila(s) |
| CP-08 | RF-02 | Usuario de 4 caracteres | Pasa | Mensajes: Should be at least 5 characters; URL: http://localhost:8082/web/index.php/admin/saveSystemUser |
| CP-09 | RF-02 | Usuario de 5 caracteres | Pasa | Toast: Success Successfully Saved ×; filas con fgome: 1 |
| CP-10 | RF-02 | Usuario duplicado | Pasa | Mensajes: Already exists; URL: http://localhost:8082/web/index.php/admin/saveSystemUser |
| CP-11 | RF-02 | Confirmación de contraseña distinta | Pasa | Mensajes: Passwords do not match; URL: http://localhost:8082/web/index.php/admin/saveSystemUser |
| CP-12 | RF-02 | Usuario deshabilitado no accede | Pasa | Guardado: Success Successfully Updated ×; intento de login -> mensaje: Account disabled; URL: http://localhost:8082/web/index.php/auth/login |
| CP-13 | RF-03 | Alta de empleado válida | Pasa | Toast: Success Successfully Saved ×; URL expediente: http://localhost:8082/web/index.php/pim/viewPersonalDetails/empNumber/14 |
| CP-14 | RF-03 | Nombre vacío | Pasa | Mensajes: Required; URL: http://localhost:8082/web/index.php/pim/addEmployee |
| CP-15 | RF-03 | Nombre de 30 caracteres | Pasa | Toast: Success Successfully Saved ×; URL: http://localhost:8082/web/index.php/pim/viewPersonalDetails/empNumber/15 |
| CP-16 | RF-03 | Nombre de 31 caracteres | Pasa | Mensajes: Should not exceed 30 characters; URL: http://localhost:8082/web/index.php/pim/addEmployee |
| CP-17 | RF-03 | ID de empleado duplicado | Pasa | Mensajes: Employee Id already exists; URL: http://localhost:8082/web/index.php/pim/addEmployee |
| CP-18 | RF-03 | ID de empleado de 11 caracteres | Pasa | Mensajes: Should not exceed 10 characters; URL: http://localhost:8082/web/index.php/pim/addEmployee |
| CP-19 | RF-04 | Búsqueda por nombre existente | Pasa | Registros: 1 -> E003 Beatriz Hernandez Cruz Analista QA Tiempo completo TI Ana Lopez Garcia |
| CP-20 | RF-04 | Búsqueda por ID inexistente | Pasa | Mensajes: Info / No Records Found; filas: 0 |
| CP-21 | RF-04 | Filtro por subunidad TI | Pasa | Registros: 4; IDs: E002, E003, E008, E011 |
| CP-22 | RF-05 | Supervisor asignado visible | Pasa | Report-to de E002: Assigned Supervisors Add (1) Record Found Name Reporting Method Actions Ana Lopez Garcia Direct Assigned Subordinates Add No Records Found N |
| CP-23 | RF-06 | Asignar derecho adicional | Pasa | Dialogo: × Updating Entitlement Existing Entitlement value 12.00 will be updated to 14.00 Cancel Confirm; toast: Success Successfully Saved ×; derecho total de  |
| CP-24 | RF-06 | Derecho no numérico o negativo | Pasa | "abc" -> Should be a number with upto 2 decimal places ; "-1" -> Should be a number with upto 2 decimal places |
| CP-25 | RF-06 | Derecho con 3 decimales | Pasa | Mensajes: Should be a number with upto 2 decimal places |
| CP-26 | RF-07 | Solicitud de 1 día con saldo | Pasa | Toast: Success Successfully Saved ×; solicitud en My Leave: 2026-10-20 Carlos Ramirez Soto Vacaciones 11.00 1.00 Pending Approval (1.00) Cancel |
| CP-27 | RF-07 | Fecha final anterior a la inicial | Pasa | Mensajes: To date should be after from date; URL: http://localhost:8082/web/index.php/leave/applyLeave |
| CP-28 | RF-07 | Solicitud mayor al saldo | Pasa | Rango 2026-10-22..2026-11-09; mensajes: Error / Leave Balance Exceeded; URL: http://localhost:8082/web/index.php/leave/applyLeave |
| CP-29 | RF-07 | Cancelar solicitud propia pendiente | Pasa | Toast: Success Successfully Updated ×; fila: 2026-11-26 Carlos Ramirez Soto Vacaciones 12.00 1.00 Cancelled (1.00) precondicion automatizada; saldo antes 12, de |
| CP-30 | RF-08 | Supervisor aprueba solicitud | Pasa | Toast: Success Successfully Updated ×; estado en cuenta de E002: 2026-11-12 Carlos Ramirez Soto Vacaciones 11.00 1.00 Scheduled (1.00) precondicion automatizada |
| CP-31 | RF-08 | Supervisor rechaza solicitud | Pasa | Toast: Success Successfully Updated ×; estado en cuenta de E003: 2026-11-13 Beatriz Hernandez Cruz Vacaciones 12.00 1.00 Rejected (1.00) precondicion automatiza |
| CP-32 | RF-08 | ESS sin subordinados no aprueba | Pasa | Opciones del menu Leave: Apply / My Leave / Entitlements / Reports; URL Leave List: http://localhost:8082/web/index.php/leave/viewLeaveList; texto: Leave Time M |
| CP-33 | RF-09 | Agregar candidato a vacante | Pasa | Toast: Success Successfully Saved ×; URL: http://localhost:8082/web/index.php/recruitment/addCandidate/3; texto: Admin PIM Leave Time Recruitment My Info Perfor |
| CP-34 | RF-09 | Correo vacío e inválido | Pasa | Correo vacio -> Required; correo "olga@" -> Expected format: admin@example.com; URL: http://localhost:8082/web/index.php/recruitment/addCandidate |
| CP-35 | RF-09 | Avance de estado del candidato | Pasa | Shortlist: Success Successfully Updated ×; Schedule Interview: Success Successfully Updated ×; validaciones: Success / Successfully Updated; URL: http://localho |
| CP-36 | RF-10 | ESS no accede a Admin | Pasa | Menu: ; URL final: http://localhost:8082/web/index.php/admin/viewSystemUsers; texto: Leave Time My Info Performance Dashboard Directory Claim Buzz Admin User Ma |
| CP-37 | RNF-01 | Rendimiento con 5 usuarios | Pasa | 5 VUs, 30 s: p95=118 ms, avg=86 ms, errores=0.00 %, solicitudes=140 |
| CP-38 | RNF-01 | Carga con 20 usuarios | Pasa | 20 VUs, 60 s (login + dashboard): p95=488 ms, avg=178 ms, errores=0.00 %, solicitudes=3200, checks fallidos=0 |
| CP-39 | RNF-02 | Escaneo de seguridad pasivo | Pasa | ZAP baseline pasivo: FAIL=0, WARN=13, PASS=54 |
| CP-40 | RNF-03 | Accesibilidad y rendimiento web | Pasa | Lighthouse login: Accesibilidad=86, Rendimiento=55, Buenas practicas=100, SEO=91 |
| CP-41 | RNF-04 | Compatibilidad entre navegadores | Bloqueado | chromium: smoke 6/6 OK; firefox: BLOQUEADO (no se puede iniciar el navegador: politica de Control de aplicaciones de Windows bloquea el ejecutable); webkit: BLO |
| CP-42 | RNF-05 | Restauración del entorno | Pasa | reset.ps1 (ambas BD) + arranque: 40.9 s; conteos por API: [{"version":"v1","empleados":13,"usuarios":5,"derechos":17},{"version":"v2","empleados":13,"usuarios": |

## 6. Discrepancias de redaccion (no son defectos)

| Caso | Observacion |
|---|---|
| CP-28 | texto real: Error / Leave Balance Exceeded (esperado: Balance not sufficient) |

## 7. Alertas WARN de ZAP (CP-39)

| ID de regla | Nombre | Riesgo | Instancias |
|---|---|---|---|
| 10003 | Vulnerable JS Library | High (Medium) | 1 |
| 10038 | Content Security Policy (CSP) Header Not Set | Medium (High) | 4 |
| 10020 | Missing Anti-clickjacking Header | Medium (Medium) | 3 |
| 10044 | Big Redirect Detected (Potential Sensitive Information Leak) | Low (Medium) | 3 |
| 90004 | Cross-Origin-Embedder-Policy Header Missing or Invalid | Low (Medium) | 3 |
| 90004 | Cross-Origin-Opener-Policy Header Missing or Invalid | Low (Medium) | 3 |
| 90004 | Cross-Origin-Resource-Policy Header Missing or Invalid | Low (Medium) | 5 |
| 10009 | In Page Banner Information Leak | Low (High) | 2 |
| 10063 | Permissions Policy Header Not Set | Low (Medium) | 5 |
| 10037 | Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s) | Low (Medium) | 5 |
| 10036 | Server Leaks Version Information via "Server" HTTP Response Header Field | Low (High) | 5 |
| 10021 | X-Content-Type-Options Header Missing | Low (Medium) | 5 |
| 10109 | Modern Web Application | Informational (Medium) | 3 |
| 10049 | Non-Storable Content | Informational (Medium) | 5 |
| 10112 | Session Management Response Identified | Informational (Medium) | 5 |
| 10049 | Storable and Cacheable Content | Informational (Medium) | 4 |

## 8. Fallas y bloqueos

Sin fallas.

Bloqueados:
- **CP-41** Compatibilidad entre navegadores: chromium: smoke 6/6 OK; firefox: BLOQUEADO (no se puede iniciar el navegador: politica de Control de aplicaciones de Windows bloquea el ejecutable); webkit: BLOQUEADO (no se puede iniciar el navegador: politica de Control de aplicaciones de Windows bloquea el ejecutable) Causa externa: App Control for Business (WDAC) impide ejecutar Firefox/WebKit de Playwright; Chromium si se ejecuto.
