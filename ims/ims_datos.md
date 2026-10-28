# Datos para el IMS (IEEE 982.1) - OrangeHRM 5.8.1 -> 5.9

Fuente: repositorio oficial https://github.com/orangehrm/orangehrm, etiquetas `v5.8.1` y `v5.9`. Modulo = carpeta de `src/plugins/`. Cambios medidos con `git diff --numstat v5.8.1 v5.9 -- src/plugins/<modulo>`.

| Simbolo | Significado | Valor |
|---|---|---|
| Mt | Modulos en la version 5.9 | 23 |
| Fa | Modulos agregados | 1 (orangehrmWorkspaceNotificationsPlugin) |
| Fc | Modulos modificados | 7 |
| Fd | Modulos eliminados | 0 |
| Modulos en 5.8.1 | referencia | 22 |

**IMS = [Mt - (Fa + Fc + Fd)] / Mt = [23 - (1 + 7 + 0)] / 23 = 0.6522**

## Detalle por modulo

| Modulo | Estado | Archivos cambiados | Lineas + | Lineas - |
|---|---|---|---|---|
| orangehrmWorkspaceNotificationsPlugin | Agregado (Fa) | - | - | - |
| orangehrmCorePlugin | Modificado (Fc) | 7 | 229 | 4 |
| orangehrmClaimPlugin | Modificado (Fc) | 4 | 150 | 14 |
| orangehrmLeavePlugin | Modificado (Fc) | 4 | 249 | 5 |
| orangehrmAttendancePlugin | Modificado (Fc) | 3 | 158 | 1 |
| orangehrmAdminPlugin | Modificado (Fc) | 2 | 37 | 0 |
| orangehrmRecruitmentPlugin | Modificado (Fc) | 2 | 206 | 2 |
| orangehrmI18NPlugin | Modificado (Fc) | 1 | 106 | 0 |
| orangehrmMobilePlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmSystemCheckPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmMaintenancePlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmPimPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmTimePlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmOpenidAuthenticationPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmPerformancePlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmCoreOAuthPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmCorporateBrandingPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmAuthenticationPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmBuzzPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmHelpPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmLDAPAuthenticationPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmCorporateDirectoryPlugin | Sin cambios | 0 | 0 | 0 |
| orangehrmDashboardPlugin | Sin cambios | 0 | 0 | 0 |

Nota: solo se contaron archivos dentro de `src/plugins/`; cambios fuera de plugins (lib, vendor, installer, etc.) no afectan este calculo.
