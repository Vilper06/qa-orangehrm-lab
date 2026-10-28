# Comparativa v1 (5.8.1) vs v2 (5.9)

Generado: 2026-10-16T01:00:51.205Z

## 1. Caso por caso

| Caso | Titulo | Estado v1 | Estado v2 | Cambio |
|---|---|---|---|---|
| CP-01 | Inicio de sesión válido | Pasa | Pasa | No |
| CP-02 | Contraseña incorrecta | Pasa | Pasa | No |
| CP-03 | Usuario inexistente | Pasa | Pasa | No |
| CP-04 | Campos vacíos | Pasa | Pasa | No |
| CP-05 | Cierre de sesión y acceso posterior | Pasa | Pasa | No |
| CP-06 | URL interna sin sesión | Pasa | Pasa | No |
| CP-07 | Crear usuario ESS válido | Pasa | Pasa | No |
| CP-08 | Usuario de 4 caracteres | Pasa | Pasa | No |
| CP-09 | Usuario de 5 caracteres | Pasa | Pasa | No |
| CP-10 | Usuario duplicado | Pasa | Pasa | No |
| CP-11 | Confirmación de contraseña distinta | Pasa | Pasa | No |
| CP-12 | Usuario deshabilitado no accede | Pasa | Pasa | No |
| CP-13 | Alta de empleado válida | Pasa | Pasa | No |
| CP-14 | Nombre vacío | Pasa | Pasa | No |
| CP-15 | Nombre de 30 caracteres | Pasa | Pasa | No |
| CP-16 | Nombre de 31 caracteres | Pasa | Pasa | No |
| CP-17 | ID de empleado duplicado | Pasa | Pasa | No |
| CP-18 | ID de empleado de 11 caracteres | Pasa | Pasa | No |
| CP-19 | Búsqueda por nombre existente | Pasa | Pasa | No |
| CP-20 | Búsqueda por ID inexistente | Pasa | Pasa | No |
| CP-21 | Filtro por subunidad TI | Pasa | Pasa | No |
| CP-22 | Supervisor asignado visible | Pasa | Pasa | No |
| CP-23 | Asignar derecho adicional | Pasa | Pasa | No |
| CP-24 | Derecho no numérico o negativo | Pasa | Pasa | No |
| CP-25 | Derecho con 3 decimales | Pasa | Pasa | No |
| CP-26 | Solicitud de 1 día con saldo | Pasa | Pasa | No |
| CP-27 | Fecha final anterior a la inicial | Pasa | Pasa | No |
| CP-28 | Solicitud mayor al saldo | Pasa | Pasa | No |
| CP-29 | Cancelar solicitud propia pendiente | Pasa | Pasa | No |
| CP-30 | Supervisor aprueba solicitud | Pasa | Pasa | No |
| CP-31 | Supervisor rechaza solicitud | Pasa | Pasa | No |
| CP-32 | ESS sin subordinados no aprueba | Pasa | Pasa | No |
| CP-33 | Agregar candidato a vacante | Pasa | Pasa | No |
| CP-34 | Correo vacío e inválido | Pasa | Pasa | No |
| CP-35 | Avance de estado del candidato | Pasa | Pasa | No |
| CP-36 | ESS no accede a Admin | Pasa | Pasa | No |
| CP-37 | Rendimiento con 5 usuarios | Pasa | Pasa | No |
| CP-38 | Carga con 20 usuarios | Pasa | Pasa | No |
| CP-39 | Escaneo de seguridad pasivo | Pasa | Pasa | No |
| CP-40 | Accesibilidad y rendimiento web | Pasa | Pasa | No |
| CP-41 | Compatibilidad entre navegadores | Bloqueado | Bloqueado | No |
| CP-42 | Restauración del entorno | Pasa | Pasa | No |

Casos con cambio de estado: **0**; regresiones (Pasa->Falla): **0**; mejoras: 0.

## 2. Diferencias de comportamiento observadas (CP-01 a CP-36)

Se comparo el resultado obtenido (fechas normalizadas).

- **CP-02** v1: Mensaje: Invalid credentials; URL: http://localhost:8081/web/index.php/auth/login
  - v2: Mensaje: Invalid credentials; URL: http://localhost:8082/web/index.php/auth/login
- **CP-05** v1: Tras logout, URL interna redirige a: http://localhost:8081/web/index.php/auth/login
  - v2: Tras logout, URL interna redirige a: http://localhost:8082/web/index.php/auth/login
- **CP-06** v1: Redirigido a: http://localhost:8081/web/index.php/auth/login
  - v2: Redirigido a: http://localhost:8082/web/index.php/auth/login
- **CP-08** v1: Mensajes: Should be at least 5 characters; URL: http://localhost:8081/web/index.php/admin/saveSystemUser
  - v2: Mensajes: Should be at least 5 characters; URL: http://localhost:8082/web/index.php/admin/saveSystemUser
- **CP-10** v1: Mensajes: Already exists; URL: http://localhost:8081/web/index.php/admin/saveSystemUser
  - v2: Mensajes: Already exists; URL: http://localhost:8082/web/index.php/admin/saveSystemUser
- **CP-11** v1: Mensajes: Passwords do not match; URL: http://localhost:8081/web/index.php/admin/saveSystemUser
  - v2: Mensajes: Passwords do not match; URL: http://localhost:8082/web/index.php/admin/saveSystemUser
- **CP-12** v1: Guardado: Success Successfully Updated ×; intento de login -> mensaje: Account disabled; URL: http://localhost:8081/web/index.php/auth/login
  - v2: Guardado: Success Successfully Updated ×; intento de login -> mensaje: Account disabled; URL: http://localhost:8082/web/index.php/auth/login
- **CP-13** v1: Toast: Success Successfully Saved ×; URL expediente: http://localhost:8081/web/index.php/pim/viewPersonalDetails/empNumber/14
  - v2: Toast: Success Successfully Saved ×; URL expediente: http://localhost:8082/web/index.php/pim/viewPersonalDetails/empNumber/14
- **CP-14** v1: Mensajes: Required; URL: http://localhost:8081/web/index.php/pim/addEmployee
  - v2: Mensajes: Required; URL: http://localhost:8082/web/index.php/pim/addEmployee
- **CP-15** v1: Toast: Success Successfully Saved ×; URL: http://localhost:8081/web/index.php/pim/viewPersonalDetails/empNumber/15
  - v2: Toast: Success Successfully Saved ×; URL: http://localhost:8082/web/index.php/pim/viewPersonalDetails/empNumber/15
- **CP-16** v1: Mensajes: Should not exceed 30 characters; URL: http://localhost:8081/web/index.php/pim/addEmployee
  - v2: Mensajes: Should not exceed 30 characters; URL: http://localhost:8082/web/index.php/pim/addEmployee
- **CP-17** v1: Mensajes: Employee Id already exists; URL: http://localhost:8081/web/index.php/pim/addEmployee
  - v2: Mensajes: Employee Id already exists; URL: http://localhost:8082/web/index.php/pim/addEmployee
- **CP-18** v1: Mensajes: Should not exceed 10 characters; URL: http://localhost:8081/web/index.php/pim/addEmployee
  - v2: Mensajes: Should not exceed 10 characters; URL: http://localhost:8082/web/index.php/pim/addEmployee
- **CP-27** v1: Mensajes: To date should be after from date; URL: http://localhost:8081/web/index.php/leave/applyLeave
  - v2: Mensajes: To date should be after from date; URL: http://localhost:8082/web/index.php/leave/applyLeave
- **CP-28** v1: Rango 2026-10-22..2026-11-09; mensajes: Error / Leave Balance Exceeded; URL: http://localhost:8081/web/index.php/leave/applyLeave
  - v2: Rango 2026-10-22..2026-11-09; mensajes: Error / Leave Balance Exceeded; URL: http://localhost:8082/web/index.php/leave/applyLeave
- **CP-32** v1: Opciones del menu Leave: Apply | My Leave | Entitlements | Reports; URL Leave List: http://localhost:8081/web/index.php/leave/viewLeaveList; texto: Leave Time My Info Performance Dashboard Directory C
  - v2: Opciones del menu Leave: Apply | My Leave | Entitlements | Reports; URL Leave List: http://localhost:8082/web/index.php/leave/viewLeaveList; texto: Leave Time My Info Performance Dashboard Directory C
- **CP-33** v1: Toast: Success Successfully Saved ×; URL: http://localhost:8081/web/index.php/recruitment/addCandidate/3; texto: Admin PIM Leave Time Recruitment My Info Performance Dashboard Directory Maintenance Cl
  - v2: Toast: Success Successfully Saved ×; URL: http://localhost:8082/web/index.php/recruitment/addCandidate/3; texto: Admin PIM Leave Time Recruitment My Info Performance Dashboard Directory Maintenance Cl
- **CP-34** v1: Correo vacio -> Required; correo "olga@" -> Expected format: admin@example.com; URL: http://localhost:8081/web/index.php/recruitment/addCandidate
  - v2: Correo vacio -> Required; correo "olga@" -> Expected format: admin@example.com; URL: http://localhost:8082/web/index.php/recruitment/addCandidate
- **CP-35** v1: Shortlist: Success Successfully Updated ×; Schedule Interview: Success Successfully Updated ×; validaciones: Success / Successfully Updated; URL: http://localhost:8081/web/index.php/recruitment/addCan
  - v2: Shortlist: Success Successfully Updated ×; Schedule Interview: Success Successfully Updated ×; validaciones: Success / Successfully Updated; URL: http://localhost:8082/web/index.php/recruitment/addCan
- **CP-36** v1: Menu: ; URL final: http://localhost:8081/web/index.php/admin/viewSystemUsers; texto: Leave Time My Info Performance Dashboard Directory Claim Buzz Admin User Management Carlos Ramirez Soto Credential 
  - v2: Menu: ; URL final: http://localhost:8082/web/index.php/admin/viewSystemUsers; texto: Leave Time My Info Performance Dashboard Directory Claim Buzz Admin User Management Carlos Ramirez Soto Credential 

## 3. Rendimiento (k6) y web (Lighthouse)

| Caso | v1 | v2 |
|---|---|---|
| CP-37 | 5 VUs, 30 s: p95=119 ms, avg=85 ms, errores=0.00 %, solicitudes=140 | 5 VUs, 30 s: p95=118 ms, avg=86 ms, errores=0.00 %, solicitudes=140 |
| CP-38 | 20 VUs, 60 s (login + dashboard): p95=458 ms, avg=203 ms, errores=0.00 %, solicitudes=3000, checks fallidos=0 | 20 VUs, 60 s (login + dashboard): p95=488 ms, avg=178 ms, errores=0.00 %, solicitudes=3200, checks fallidos=0 |
| CP-40 | Lighthouse login: Accesibilidad=86, Rendimiento=53, Buenas practicas=100, SEO=91 | Lighthouse login: Accesibilidad=86, Rendimiento=55, Buenas practicas=100, SEO=91 |
| CP-42 | reset.ps1 (ambas BD) + arranque: 51.8 s; conteos por API: [{"version":"v1","empleados":13,"usuarios":5,"derechos":17},{"version":"v2","empleados":13,"usuarios":5,"derechos":17}] | reset.ps1 (ambas BD) + arranque: 40.9 s; conteos por API: [{"version":"v1","empleados":13,"usuarios":5,"derechos":17},{"version":"v2","empleados":13,"usuarios":5,"derechos":17}] |

CP-37: p95 v1=119 ms, v2=118 ms (-0.8 %).
CP-38: p95 v1=458 ms, v2=488 ms (6.6 %).

## 4. Seguridad (ZAP baseline)

- v1: ZAP baseline pasivo: FAIL=0, WARN=13, PASS=54
- v2: ZAP baseline pasivo: FAIL=0, WARN=13, PASS=54

Alertas nuevas en 5.9 (no estaban en 5.8.1): ninguna.

Alertas resueltas en 5.9: ninguna.

Alertas comunes: 10003, 10038, 10020, 10044, 90004, 90004, 90004, 10009, 10063, 10037, 10036, 10021, 10109, 10049, 10112, 10049.
