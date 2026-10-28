# Resumen del entorno de pruebas - OrangeHRM (laboratorio local)

Fecha de preparacion: 2026-10-15. Empresa ficticia: **Grupo Comercial Andes S.A. de C.V.** (pais MX).

## 1. Hardware y SO
| Concepto | Valor |
|---|---|
| Equipo | Micro-Star International Cyborg 15 A12VF |
| CPU | 12th Gen Intel Core i5-12450H (8 nucleos / 12 hilos) |
| RAM | 15.7 GB |
| Disco C: | ~486 GB usados / ~467 GB libres |
| SO | Windows 11 Home Single Language 10.0.26200 |

## 2. Versiones instaladas
| Herramienta | Version |
|---|---|
| WSL | 3.0.3.0 (kernel 6.18.54.1), backend WSL2 |
| Docker Desktop | 4.95.0 (motor 29.8.2, Compose v5.6.0) |
| Git | 2.55.0 |
| Node.js / npm | v24.20.0 / 11.19.0 |
| Playwright | 1.64.1 (Chromium) |
| k6 | v2.2.0 |
| Lighthouse | via npx (ultima disponible) |
| ZAP | imagen zaproxy/zap-stable (latest) |
| VS Code | ya instalado |
| OrangeHRM v1 | OS 5.8.1 (imagen orangehrm/orangehrm:5.8.1, PHP 8.3) |
| OrangeHRM v2 | OS 5.9 (imagen orangehrm/orangehrm:5.9, PHP 8.3) |
| Base de datos | MariaDB 10.11 (una por version) |

## 3. URLs y arquitectura
- v1: http://localhost:8081/web/index.php/auth/login
- v2: http://localhost:8082/web/index.php/auth/login
- Credenciales de prueba: en `C:\QA\orangehrm-lab\.env` (no incluido en esta entrega). Usuario admin `Admin`.

```
Windows 11 -> Docker Desktop (WSL2) -> red ohrm_net
  :8081 -> ohrm_v1 (orangehrm 5.8.1) -> db_v1 (mariadb 10.11, volumen db_v1_data)
  :8082 -> ohrm_v2 (orangehrm 5.9)   -> db_v2 (mariadb 10.11, volumen db_v2_data)
```
Laboratorio en `C:\QA\orangehrm-lab\` (fuera de OneDrive). Reinicio de datos: `reset.ps1`.

## 4. Datos semilla (identicos en v1 y v2)
3 ubicaciones (CDMX, Monterrey, Guadalajara), 4 departamentos (RH, TI, Ventas, Finanzas), 5 puestos, 2 estatus de empleo, 12 empleados (E001-E012), 4 usuarios ESS (ana.lopez, carlos.ramirez, beatriz.hernandez, diego.martinez), 2 tipos de permiso (Vacaciones 12 dias, Permiso personal 5 dias, periodo del año 2026), 1 vacante "Analista QA Jr." con 2 candidatos. Detalle en `seed/datos_semilla.json`.
Observaciones: OrangeHRM no tiene rol de usuario "Supervisor"; ana.lopez es supervisora por linea de reporte directa de E002-E004. Los IDs internos de puestos en v1 estan desfasados +1 respecto a v2 (nombres identicos).

## 5. Smoke Playwright
`npx playwright test --project=v1 --project=v2`: **12/12 pasan** (6 por version: login valido/invalido, PIM buscar, Leave List, Admin Users, Recruitment Vacancies). Sin defectos del sistema detectados en el smoke. Reporte: `playwright-report/index.html`.

## 6. Requerimientos no funcionales (v1, login)
- **k6** (5 VUs, 30 s): 140 solicitudes, 0 % fallos, avg 95.8 ms, p(95) 133.4 ms.
- **ZAP baseline pasivo**: 0 FAIL, 13 WARN, 54 PASS (cabeceras como Permissions Policy y COEP ausentes, identificacion de gestion de sesion, etc.).
- **Lighthouse**: Performance 50, Accessibility 86, Best Practices 100, SEO 91.

## 7. IMS (IEEE 982.1), 5.8.1 -> 5.9
Mt = 23, Fa = 1 (orangehrmWorkspaceNotificationsPlugin), Fc = 7, Fd = 0.
**IMS = (23 - (1 + 7 + 0)) / 23 = 0.6522**. Tabla completa en `ims/ims_datos.md`; notas oficiales en `ims/release_notes_5.9.md`.

## 8. Problemas y notas
- WSL requirio reinicio; la virtualizacion funciona (VBS activo) aunque Windows reporta el flag de firmware como False.
- No existe ajuste global de zona horaria en OrangeHRM OS 5; America/Mexico_City no pudo fijarse a nivel instancia.
- El instalador CLI esta deprecado (`install:on-new-database` es el reemplazo) pero funciono; se elimino el YAML con credenciales del contenedor.
- ZAP se ejecuto solo contra localhost:8081 (instancia propia).
- Las credenciales no se copiaron a OneDrive; PROGRESO.md tampoco las contiene.
