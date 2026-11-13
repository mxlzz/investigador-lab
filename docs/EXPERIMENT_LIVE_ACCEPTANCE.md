# Aceptación real de la integración experimental — 2026-11-12 / 13 (UTC)

**Resultado: PASÓ el circuito remoto en GitHub Actions.** Esto valida el punto 1 sin depender de una instalación local; no valida todavía el punto 2 en Windows.

## Referencias reproducibles

- Commit del código/experimento utilizado: `749c5880d823f8ced7bee5119e4768fe9946c3a5` (rama `implementacion/investigador-local`).
- Controlador de aceptación que invocó GitHub API: https://github.com/mxlzz/investigador-lab/actions/runs/43350881884 — `success`.
- Workflow de experimento realmente despachado: https://github.com/mxlzz/investigador-lab/actions/runs/43350903439 — `success`.
- Request ID del expediente: `b8bd2ae6-d7eb-4704-b626-5203725db020`.
- Clave de resultado experimental importado: `experiment-result-56896cad17d968007a231ea7`.
- CI Node.js: https://github.com/mxlzz/investigador-lab/actions/runs/43350881800 — **43 aprobadas, 0 fallidas**.
- Workflow `.github/workflows/investigador-experiment.yml` habilitado en rama predeterminada `main` mediante commit `ebb64305d3d12fbcb5e35ac6eef95f0687109ff2`, sin fusionar PR #2.

## Cadena confirmada

1. Proyecto público sintético de infraestructura con hipótesis/antecedentes/diseño de prueba registrados en un expediente temporal.
2. `experiment_plan` y manifiesto fijados al commit y hash SHA256.
3. `experiment_submit`: llamada real a `workflow_dispatch` con credencial temporal de GitHub Actions, sin token de usuario persistente.
4. GitHub creó la corrida `43350903439`; runner aislado del PC ejecutó los scripts públicos baseline y candidate y publicó un artefacto.
5. `experiment_poll`: recuperó listado de runs, artefacto de esa corrida, descargó ZIP y verificó su identidad, su digest, el manifiesto, el commit, el ID de solicitud y las métricas.
6. El motor incorporó un solo `experiment_result` y una fase `evaluation` vinculada a su clave real.

## Valores observados

| Métrica en prueba sintética | Baseline | Candidate | Diferencia favorable |
| --- | ---: | ---: | ---: |
| MSE | 0,25 | 0 | 0,25 |

El valor corresponde únicamente a dos funciones deliberadamente diferentes sobre datos pequeños y públicos. **No demuestra mejora científica general ni comparación válida de modelos reales.**

## Pendiente separado — punto 2

Falta actualizar el Gateway y el MCP instalados en la PC de Windows, configurar credencial local de Actions con permiso acotado, y ejecutar **otro dispatch real desde el OpenClaw instalado**, verificando que persista en su expediente existente. Seguir `docs/WINDOWS_DEPLOYMENT_RUNBOOK.md`.

No están hechos el merge del PR #2, una publicación estable, ni una prueba científica no sintética.
