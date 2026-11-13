# Integración experimental — matriz mínima de aceptación

| Caso | Evidencia requerida |
| --- | --- |
| Plan privado bloqueado | `experiment_plan` rechaza `visibility=private` |
| Plan incompleto bloqueado | Falta revisión de novedad, hipótesis, diseño, commit o SHA256 |
| Dispatch no duplicado | La solicitud persiste antes de la llamada HTTP y un nuevo intento reutiliza `request_id` |
| Ejecución vinculada | El run es `workflow_dispatch` del repo/workflow autorizados con título que contiene exactamente el `request_id` |
| Recibo verificado | Run `success`, artefacto único, ZIP acotado, SHA cuando disponible, ID, commit, manifiesto, métrica y signo de mejora concordantes |
| Integridad del expediente | Registro `experiment_result` idempotente; intento de `record(...,experiment_result)` continúa bloqueado |
| Evaluación | `evaluation` solo acepta un evento `experiment_result` existente |
| No bloquea innecesariamente | `experiment_poll` pendiente no consume turno del LLM ni fabrica fallo |
| Prueba remota real | GitHub Actions ejecuta baseline + candidate y guarda recibo descargable |
| Prueba Windows integral | Solo se marca cumplida tras dispatch real desde el Gateway y evaluación recuperada |

**Estado de pruebas:** pruebas unitarias sobre API simulada y runner real en CI verifican piezas del circuito. Falta ejecutar el circuito contra la API real desde el OpenClaw instalado en Windows y registrar sus IDs de run y resultados. No mezclar la muestra sintética de infraestructura con evidencia de descubrimiento o superioridad científica.
