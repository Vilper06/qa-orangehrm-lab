# Propuestas de cambio (no implementadas)

Origen: alertas de ZAP que permanecen tras CR-001 y observaciones del plan. **No se implementaron**; requieren aprobacion del comite de cambios.

## CR-002 (propuesta): Content-Security-Policy en modo "Report-Only" (ZAP 10038, riesgo Medium)
- **Motivo:** v2 sigue sin cabecera `Content-Security-Policy`. Una CSP restrictiva rompe la interfaz de OrangeHRM (scripts y estilos en linea), por lo que no se incluyo en CR-001.
- **Propuesta:** primero `Content-Security-Policy-Report-Only` con una politica base (`default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'`), observar violaciones durante un ciclo de pruebas y endurecer despues.
- **Tipo:** solo configuracion de Apache (archivo `config/security-headers.conf`). **Riesgo:** bajo si es Report-Only.
- **Verificacion:** repetir CP-39 y la regresion CP-01..CP-36.

## CR-003 (propuesta): Cross-Origin-Embedder-Policy (ZAP 90004, Low)
- `Cross-Origin-Embedder-Policy: require-corp` puede bloquear recursos cruzados. Evaluar en un entorno de pruebas antes de activar; si la aplicacion no incrusta recursos de terceros, es viable.

## CR-004 (propuesta): Politica de cache para respuestas con sesion (ZAP 10049 Storable/Non-Storable Content, Informational) y redireccion grande (10044, Low)
- Revisar `Cache-Control` de recursos estaticos y de la pagina de login. Cambio de configuracion de Apache/PHP; impacto bajo.

## Fuera de alcance de configuracion
- **ZAP 10003 "Vulnerable JS Library" (High (Medium))** aparece en v1 y v2 (y se reporta como WARN, no FAIL, por la semantica del baseline). Corresponde a una libreria JavaScript empaquetada en OrangeHRM; **requiere actualizacion en el codigo del producto** por parte del fabricante. Se recomienda reportarlo a OrangeHRM y dar seguimiento en versiones posteriores. No corregible por configuracion.
- **CP-41 (Firefox/WebKit):** el bloqueo es una politica de Control de aplicaciones de Windows del equipo de pruebas. Solicitar a TI una excepcion para `ms-playwright` o ejecutar CP-41 en otro equipo/CI. No es un defecto de OrangeHRM.
- **RNF-06 (Portabilidad):** el plan no incluye ningun caso de prueba para este requerimiento; se sugiere agregar un caso (despliegue desde cero con `docker compose up -d` en un entorno limpio).
