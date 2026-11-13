# Revisión estratégica de rumbo — propuesta de diseño v0.1

**Estado:** propuesta no aprobada ni implementada. Fecha: 2026-11-13.  
**Problema observado por el usuario:** las etapas locales de una investigación pueden ser razonables de forma aislada y, acumuladas, desviar tiempo y recursos hacia detalles auxiliares que ya no contribuyen suficientemente a la meta. El caso ACD se cita como motivación, sin dar por probada una falla técnica específica de sus resultados.

## 1. Por qué los controles anteriores son necesarios pero insuficientes

- `novelty_review` contrasta cada hipótesis con antecedentes antes de experimentar. No evalúa por sí solo si una **línea entera** conserva su valor respecto de otras prioridades.
- `next_cycle` exige justificar la siguiente fase y sus artefactos. Puede repetirse en ciclos sucesivos con justificaciones individualmente plausibles, sin comparación longitudinal de resultados ni costo de oportunidad.
- El Auditor ChatGPT, si se implementa y tiene acceso, agrega contraste independiente dos veces al día y ante hitos. No sustituye al control interno que debe funcionar aun cuando el auditor esté desconectado.

Por tanto se propone una **revisión de cartera/rumbo por línea**: ¿sigue siendo una vía adecuada para el objetivo original, con los resultados y antecedentes que ahora conocemos?

No introducir revisión en cada acción ni pedir al LLM que reescriba toda la investigación antes de cada paso. La revisión debe aprovechar resúmenes/indicadores persistidos y solicitar lectura adicional solo donde aporte valor.

## 2. Unidad correcta: una línea de trabajo, no un turno del LLM

Registrar `research_line_id` estable para cada línea: hipótesis/método/ruta de desarrollo con alcance y criterios propios.

Por línea:
- referencia literal al `user_goal_id` y criterios explícitos de aceptación originales, sin reformular unilateralmente la meta;
- `rationale_at_start`, alternativas conocidas y antecedentes principales;
- `expected_contribution` verificable y evidencia que modificaría la decisión;
- fecha, hitos, experimentos y tareas auxiliares consumidas;
- tiempo/recursos estimados y observados cuando haya medición fiable (`unknown` si no);
- resultados confirmados, resultados negativos, decisiones previas y prueba de pertinencia;
- `last_strategic_review_id`, revisión del estado y próximo umbral.
  
Para `documentary` sin código, las líneas son preguntas de investigación o familias de soluciones; el criterio es mejora de comprensión/cobertura de la meta, no una métrica de benchmark inventada.

## 3. Disparadores propuestos

**Disparadores por evento, primero:**
1. Antes de **cambiar de línea** o comprometer recursos relevantes en una nueva alternativa.
2. Cuando varias mediciones/experimentos consecutivos de la misma línea no aportan evidencia nueva ni acercan al criterio de aceptación.
3. Si el trabajo auxiliar (runner, formato, integración, refactor, infraestructura) acumula varias iteraciones sin desbloquear una pregunta decisiva de la investigación.
4. Si aparece antecedente externo que podría resolver o invalidar la línea elegida, o un baseline sustancialmente mejor.
5. Si la línea deja de tener una pregunta comprobable, supera presupuesto asignado o acumula contradicciones/resultado negativo decisivo.
6. Si el Auditor emite una objeción fundamentada de `strategic_drift` mediante el diálogo existente (`additional_check_requested`), sin asumir que el comentario autoriza a cambiar metas o recursos.

**Disparador periódico de respaldo (propuesta a validar):** después de **tres iteraciones sustantivas consecutivas en una misma línea** sin revisión estratégica reciente. Una iteración sustantiva es un experimento terminado, una decisión de método o un hito de ingeniería aceptado; no es cada mensaje, cada archivo, cada retry de API ni un cambio cosmético.

- Evitar múltiples revisiones por el mismo hecho: `trigger_event_ids` y `state_snapshot_id` permiten deduplicar.
- Si se disparan varias causas juntas, consolidar en una revisión.
- No interpretar `3` como límite de experimentos ni declarar falla por sí solo. Una serie larga con resultados incrementales sólidos puede continuar tras una revisión registrada.
- Cuando el agente está trabajando intensamente en un experimento ya admitido, el disparador crea una revisión **antes del siguiente compromiso importante**; no cancela por la fuerza una ejecución atómica.

## 4. Preguntas obligatorias del checkpoint

**P1 — Meta:** ¿qué pidió exactamente el usuario, qué criterios de éxito siguen vigentes y qué relación verificable tiene esta línea con ellos? Registrar `goal_ref`.

**P2 — Progreso:** ¿qué cambió de manera confirmada respecto del baseline/estado anterior? Distinguir métricas científicas, capacidad instrumental realmente desbloqueada y trabajo meramente ejecutado. Un commit, un test verde o un número de ciclos NO son por sí solos mejora en la meta.

**P3 — Antecedentes actuales:** ¿qué solución existente, implementación, paper o resultado negativo relevante puede volver redundante esta vía? Se reutiliza el índice de búsquedas anteriores y se hace **búsqueda focalizada adicional cuando faltan antecedentes o cambió la hipótesis**. No repetir automáticamente una búsqueda exhaustiva en cada revisión.

**P4 — Alternativas y costo de oportunidad:** ¿qué alternativas activas o ya estudiadas podrían generar mayor progreso o información por unidad de esfuerzo? Presentar al menos una alternativa concreta o justificar por qué no se conoce ninguna; no comparar con fantasías ni probabilidades numéricas inventadas.

**P5 — Decisión falsable:** ¿qué observación justificaría seguir, pivotar, reutilizar algo existente, aparcar esta línea o cerrarla? Fijar un próximo `decision_point` verificable, no «seguir optimizando» sin criterio de salida.

Si una pregunta no tiene datos accesibles, marcar `needs_evidence`; eso no cuenta como respuesta positiva.

## 5. Opciones y autoridad

Opciones sugeridas para el dictamen: `continue`, `reuse_existing`, `pivot_within_goal`, `park_line`, `need_evidence`, `propose_project_closure`.

- **Continue:** especificar qué cambio o dato nuevo se espera y cómo se medirá.
- **Reuse:** preferir solución conocida que satisface la necesidad; distinguir reutilización de mera copia sin licencia.
- **Pivot within goal:** ajustar estrategia dentro del alcance aprobado, sin cambiar meta ni autorizaciones.
- **Park:** conservar resultados y motivo, liberar prioridad de esa línea, y revisar alternativas.
- **Need evidence:** priorizar búsqueda o prueba discriminante acotada, sin inventar convicción.
- **Propose closure:** seguir protocolo de cierre `contracts/research-closure-v1.md`; un checkpoint no archiva un proyecto por cansancio.

No declarar una línea duplicada solo por coincidencia terminológica; examinar mecanismos, condiciones, versiones y evidencia de equivalencia. Reproducir un método existente puede tener valor para establecer baseline.

El planificador **debe comprobar que existe dictamen estratégico vigente cuando hay disparador pendiente antes de autorizar otra inversión considerable en esa misma línea**. Puede registrar trabajo urgente de reparación/seguridad o concluir un experimento en vuelo. El LLM no puede auto-eliminar un trigger ni registrar `continue` sin evidencia/referencias: la validación del host exige campos y estado. Este control no bloquea toda la investigación si la línea se aparca y otra es útil.

## 6. Contrato mínimo de registro propuesto

Una entidad `strategic_review` versión 1:

```json
{
  "review_id": "STR-0007",
  "project_id": "acd",
  "research_line_id": "LINE-oidn-evaluation",
  "state_snapshot_id": "sha_o_digest_confirmado",
  "trigger_event_ids": ["EXP-10", "ENG-13", "ENG-14"],
  "original_goal_ref": "GOAL-ACD",
  "goal_alignment": "Qué parte de la meta puede mejorar esta línea",
  "confirmed_progress": [{"evidence_id": "EXP-10", "result": "Valor medido y su alcance"}],
  "work_done_without_goal_progress": ["ENG-13"],
  "prior_art_checked": [{"source_id": "SRC-12", "relevance": "Baseline existente"}],
  "missing_prior_art": [],
  "alternatives": [{"id": "LINE-b", "pros": "...", "cons": "...", "evidence_refs": ["SRC-16"]}],
  "opportunity_cost": "Esfuerzo y alternativa concreta; unknown si no es medible",
  "decision": "continue",
  "expected_next_information": "Qué prueba nueva diferenciará las alternativas",
  "stop_or_pivot_condition": "Criterio observable de salida de esta línea",
  "reviewed_at": "timestamp UTC",
  "limitations": []
}
```

Este ejemplo **no representa un estado real de ACD**. Los IDs son ilustrativos; el formato final debe congelarse junto con JSON Schema en la fase de implementación, sin que Codex invente semántica nueva. Un registro que solo contenga frases genéricas no pasa el checkpoint.

Guardar revisiones y referencias en el journal del proyecto, sincronizarlas según la clasificación autorizada de datos, y proyectarlas luego en Obsidian.

## 7. Integración con los pasos ya existentes

- **Intake / goal:** guardar texto original y criterios explícitos.
- **Hypotheses / novelty:** mantener comparación por hipótesis. La revisión estratégica *no reemplaza* el novelty gate.
- **Experiment / engineering:** vincular intentos/hitos a `research_line_id`, objetivo y resultado.
- **Next_cycle:** si hay disparador pendiente, producir revisión estratégica antes de seleccionar más trabajo costoso sobre la misma línea. Si no hay disparador, usar decisión normal de `next_cycle` sin otra llamada.
- **Auditor ChatGPT:** en revisiones breves puede detectar desviación de objetivo, progreso aparente o repetición; publicar `additional_check_requested` enlazado a la línea, sin asumir autoridad para replanificar el motor directamente.
- **Cierre:** si no hay líneas útiles, proponer cierre o pausa fundamentada bajo el contrato específico, no crear ciclos para mantenerse activo.

El checkpoint no requiere necesariamente un nuevo proceso, cron ni modelo: puede incorporarse como fase/contrato del orquestador existente durante la implementación. No modificar el código hasta la autorización expresa.

## 8. Pruebas de aceptación de rumbo (propuestas)

S01 — Diez cambios de infraestructura sin medición de mejora: detecta falta de progreso en la meta y compara si mantener la línea, usar baseline o aparcar, en vez de recomendar otro cambio auxiliar por rutina.

S02 — Tres experimentos que sí mejoran una métrica pertinente: puede seguir justificadamente y no «bloquea por contar a tres».

S03 — Ya existe una biblioteca que cumple el requisito: compara licencia/condiciones y prioriza adoptar/reusar, o explica qué requisito técnico obliga a experimentar de nuevo.

S04 — Se reformula una técnica con otra terminología: novedad focalizada busca mecanismos equivalentes, no afirma originalidad por nombre.

S05 — Línea prometedora con hipótesis decisiva sin datos: solicita búsqueda o prueba discriminante, no crea otra docena de variantes sin criterio.

S06 — Una falla de red durante una prueba: no la registra como refutación científica ni como progreso.

S07 — Auditor detecta desvío: genera revisión y respuesta trazable; no cambia objetivo por obediencia al comentario.

S08 — Checkpoint ya realizado para los mismos eventos/snapshot: no vuelve a consumir turno ni escribir otro registro.

S09 — Proyecto documental abierto: compara progreso en cobertura/entendimiento sin inventar métrica numérica.

S10 — Línea aparcada por falta de valor: se preserva toda su evidencia y otra línea puede continuar; no se bloquea todo el proyecto.

## 9. Decisiones pendientes

- Si «tres iteraciones sustantivas» es el intervalo adecuado o si debe depender del proyecto.
- Umbrales verificables de gasto/tiempo para disparar revisión por costo de oportunidad.
- Catálogo exacto de eventos instrumentales vs experimentales y JSON Schema final.
- Cómo medir costo humano/computacional cuando no hay datos suficientes; nunca inventar ahorros.
- Qué acción del host está permitida durante una revisión estratégica pendiente y cómo coordinarla con auditorías externas.
