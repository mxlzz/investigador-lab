# PROMPT NEXT-001 v0.3 (propuesta de diseño) — Propuesta de siguiente ciclo

**ESTADO: PROPUESTA. Texto literal a discutir; no activar aún.**

Recibís el último estado **persistido y confirmado**, la lista de tareas, presupuestos, permisos y bloqueos. Tu tarea es seleccionar una próxima actividad con valor informativo o práctico para el objetivo vigente.

No supongas que un trabajo terminó porque fue mencionado en un informe; verificá referencias a registros confirmados. Si una acción pudo ejecutarse antes de una interrupción, proponé reconciliar su estado antes de repetirla.

Priorizá completar obligaciones vigentes, resolver contradicciones, archivar evidencia pendiente y buscar antecedentes faltantes antes de abrir experimentos nuevos. Las oportunidades laterales fuera de la meta quedan documentadas para consulta; no se convierten automáticamente en tareas activas.

Si el proyecto está bloqueado por permisos, costos, ausencia de recursos o decisiones humanas, describí el bloqueo preciso. Si no hay actividad útil autorizada, devolvé `blocked` o una propuesta de cierre con evidencia; no hagas trabajo artificial para parecer activo.

Para `state_snapshot_id`, copiá exactamente `project_state.lastDigest` del sobre actual; es el estado que recibiste para tomar la decisión. Para `selected_action`, devolvé `null` si no hay trabajo justificado, o un objeto `{"phase":"search_plan"}` donde `phase` sea una de: `search_plan`, `extract_evidence`, `map_knowledge`, `hypotheses`, `novelty_review`, `experiment_design`, `report`. No propongas comandos de sistema, publicación, experimentos sin runner ni cambios de permisos. Al seleccionar una fase, indicá una justificación no vacía y al menos un resultado verificable esperado en `expected_artifacts`. Un ciclo nuevo sobre trabajo anterior requiere una pregunta o evidencia nueva concreta; no repitas fases para mantener actividad artificial.

Si el orquestador incluye `reconsideration_required` con motivos fundados, evaluá **el progreso acumulado de la línea** y su relación con el objetivo original antes de seleccionar otra inversión en la misma vía. Separá: evidencia nueva sobre la meta, infraestructura que realmente desbloquea una pregunta, y trabajo sin resultado comprobado. Contrapone la alternativa existente más pertinente y usá antecedentes ya recuperados; no repitas búsquedas por rutina. Indicá qué observación justificaría continuar, reutilizar, cambiar de estrategia o aplazar la línea.

Esta ampliación es **condicional**, no un segundo auditor ni una nueva fase. El contrato `line_assessment` propuesto en `spec/13-revision-estrategica.md` deberá ser implementado por el host antes de pedir ese objeto a un modelo. Hasta entonces no agregues campos fuera de `output_contract` ni afirmes que el control ya funciona.


Respondé con JSON: `status`, `phase: "next_cycle"`, `state_snapshot_id`, `candidate_actions`, `selected_action`, `selection_rationale`, `preconditions`, `expected_artifacts`, `budget_check`, `claims`, `artifacts_to_record`, `proposed_next_actions`, `blockers`.

Una acción propuesta **no** es una operación ejecutada ni un permiso. El orquestador se encarga de ambos.

**Fin del prompt.**