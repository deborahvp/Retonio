# Definición de Entornos — Retoño

El proyecto usa tres entornos ligados a ramas de Git: DEV, QA y PROD.
El código solo avanza si pasa las verificaciones del entorno anterior.

| Entorno | Rama    | Deploy                         |
|---------|---------|--------------------------------|
| DEV     | develop | Automático en cada push        |
| QA      | qa      | Merge develop -> qa            |
| PROD    | main    | Merge qa -> main (aprobación)  |

## DEV (develop)
- Deploy: cualquier programador, automático en cada push.
- Pruebas para avanzar: build + unitarias básicas.
- Política de fallo: solo notifica, no bloquea.

## QA (qa)
- Deploy: automático al hacer merge develop -> qa.
- Pruebas para avanzar: integración + E2E de flujos críticos + revisión manual.
- Política de fallo: bloquea el avance a PROD.

## PROD (main)
- Deploy: solo tras aprobación manual de la Product Owner (Ariadna).
- Pruebas: todas las de DEV y QA + smoke test post-deploy.
- Política de fallo: se activa el plan de rollback.