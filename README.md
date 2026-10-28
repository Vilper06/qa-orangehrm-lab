# Laboratorio de pruebas de software: OrangeHRM

Proyecto académico de la materia **Ingeniería de Pruebas** (Ingeniería en Informática, IPN-UPIICSA, octubre 2026). Proyecto de equipo de 4 integrantes; el laboratorio se construyó con asistencia de IA (Claude Code).

Una consultora ficticia valida la implantación de [OrangeHRM](https://github.com/orangehrm/orangehrm) (sistema de RR. HH. de código abierto) comparando la versión **5.8.1** (línea base) con la **5.9** (candidata a liberar).

## Qué incluye

| Área | Herramienta | Dónde |
|---|---|---|
| Casos de prueba | 42 casos (CP-01 a CP-42) a partir de 10 requerimientos funcionales y 6 no funcionales; partición de equivalencia y valores límite | `casos_prueba.json` |
| Automatización funcional | Playwright + TypeScript, Page Object Model, fixtures y reporter propio por ID de caso (36 pruebas en 6 specs) | `pruebas/` |
| Rendimiento | k6 (5 y 20 usuarios virtuales) | `k6/`, `reportes/` |
| Seguridad | OWASP ZAP baseline | `reportes/*/zap_*.txt` |
| Calidad web | Lighthouse | `RESUMEN_EJECUCION.md` |
| Entorno reproducible | Docker Compose con ambas versiones, datos semilla, reset y restauración | `docker-compose.yml`, `reset.ps1`, `restore.ps1` |
| Gestión de pruebas | Kiwi TCMS (plan, casos y ejecuciones) | `kiwi/`, `evidencias/kiwi_*.png` |
| Control de cambios | Solicitud CR-001 (cabeceras HTTP de seguridad) con reprueba y regresión | `config/`, `evidencias/cr001.diff` |

## Resultados

| Ciclo | Pasa | Falla | Bloqueado |
|---|---|---|---|
| Ciclo 1 · OrangeHRM 5.8.1 | 41 | 0 | 1 |
| Ciclo 2 · OrangeHRM 5.9 (regresión) | 41 | 0 | 1 |
| Regresión posterior a CR-001 (CP-01 a CP-36) | 36 | 0 | 0 |

- **0 regresiones** entre versiones (`resultados/comparativa_v1_v2.md`).
- **CR-001:** ZAP baseline pasó de 13 a 7 advertencias, sin fallos y sin romper funcionalidad (36/36).
- **k6, 20 usuarios durante 60 s:** p95 de 458 ms (5.8.1) y 488 ms (5.9), 0 % de errores.
- **Lighthouse:** accesibilidad 86, buenas prácticas 100, SEO 91.
- **CP-41 (compatibilidad):** bloqueado, porque una política del equipo de pruebas impidió abrir Firefox y WebKit. Chromium pasó el smoke 6/6.
- No se registraron defectos; los hallazgos están en `defectos.md`.

Detalle completo en [`RESUMEN_EJECUCION.md`](RESUMEN_EJECUCION.md).

## Cómo ejecutarlo

1. Copia `.env.example` a `.env` y define tus propias credenciales de prueba.
2. `docker compose up -d` (OrangeHRM 5.8.1 en el puerto 8081 y 5.9 en el 8082).
3. En `pruebas/`: `npm install`, `npx playwright install chromium` y `npx playwright test`.

El código fuente de OrangeHRM no se incluye; se usan sus imágenes oficiales.
