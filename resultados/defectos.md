# Registro de defectos

**Defectos DEF-xx registrados: 0.** Ningun caso quedo en estado *Falla* en el Ciclo 1 (v1, 5.8.1), el Ciclo 2 (v2, 5.9) ni en la regresion posterior a CR-001. Por tanto tampoco hay defectos de regresion.

## Hallazgos que no son defectos

| ID | Caso | Hallazgo | Clasificacion | Accion |
|---|---|---|---|---|
| H-01 | CP-39 | ZAP 10003 *Vulnerable JS Library* (High (Medium)) en v1 y v2 | Componente de terceros; reportado como WARN (FAIL = 0), CP-39 cumple lo esperado | Reportar al fabricante; no corregible por configuracion |
| H-02 | CP-41 | Firefox y WebKit no se pueden ejecutar en el equipo de pruebas | Bloqueado: politica de Control de aplicaciones de Windows | Solicitar excepcion o ejecutar en otro equipo |
| H-03 | CP-28 | Mensaje real "Leave Balance Exceeded" en vez de "Balance not sufficient" | Discrepancia de redaccion (Pasa con observacion) | Ninguna |
| H-04 | RNF-06 | El plan no incluye casos para Portabilidad | Brecha de cobertura del plan | Agregar caso de despliegue limpio |
