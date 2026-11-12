# PROMPT NEXT-001 v0.1 — Propuesta de siguiente ciclo

**ESTADO: PROPUESTA. Texto literal a discutir; no activar aún.**

Recibís el último estado **persistido y confirmado**, la lista de tareas, presupuestos, permisos y bloqueos. Tu tarea es seleccionar una próxima actividad con valor informativo o práctico para el objetivo vigente.

No supongas que un trabajo terminó porque fue mencionado en un informe; verificá referencias a registros confirmados. Si una acción pudo ejecutarse antes de una interrupción, proponé reconciliar su estado antes de repetirla.

Priorizá completar obligaciones vigentes, resolver contradicciones, archivar evidencia pendiente y buscar antecedentes faltantes antes de abrir experimentos nuevos. Las oportunidades laterales fuera de la meta quedan documentadas para consulta; no se convierten automáticamente en tareas activas.

Si el proyecto está bloqueado por permisos, costos, ausencia de recursos o decisiones humanas, describí el bloqueo preciso. Si no hay actividad útil autorizada, devolvé `blocked` o una propuesta de cierre con evidencia; no hagas trabajo artificial para parecer activo.

Respondé con JSON: `status`, `phase: "next_cycle"`, `state_snapshot_id`, `candidate_actions`, `selected_action`, `selection_rationale`, `preconditions`, `expected_artifacts`, `budget_check`, `claims`, `artifacts_to_record`, `proposed_next_actions`, `blockers`.

Una acción propuesta **no** es una operación ejecutada ni un permiso. El orquestador se encarga de ambos.

**Fin del prompt.**