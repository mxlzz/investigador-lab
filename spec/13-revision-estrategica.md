# Control de rumbo longitudinal — ajuste del ciclo existente (diseño v0.2)

**Estado:** propuesta revisada tras auditar la estructura del repositorio el 2026-11-13. Sin implementación ni autorización para modificar OpenClaw.  
**No crear una fase, auditor adicional, tarea programada ni prompt autónomo.**

## 1. Qué ya existe y no hay que duplicar

- `spec/CORE_RESEARCH_LOOP.md`, «Regla de selección del próximo trabajo»: relevancia para el objetivo, evidencia, alternativas, costo y valor informativo. **Sigue siendo la regla normativa de priorización.**
- `spec/07-prompts/06-novelty-gate.md` y `spec/03-hypotheses.md`: antecedentes equivalentes, reutilización y descarte antes de probar una hipótesis. **Conservar ese control por hipótesis; no repetir su búsqueda completa en cada vuelta.**
- `spec/07-prompts/09-next-cycle.md`: selección del próximo paso o de `null`, justificación, presupuesto, estado y artefactos esperados. **Ese es el lugar para la comprobación de rumbo.**
- `spec/09-auditing.md` / `spec/10-auditor-chatgpt.md`: observador externo. **Una auditoría independiente no sustituye la decisión interna del motor.**

Lo que falta: al solicitar una **nueva inversión en una misma línea**, el planificador no exige una comparación explícita de los resultados confirmados **desde que esa línea comenzó o se revisó por última vez**. Puede aceptar `selection_rationale` no vacío y `expected_artifacts` no vacío sin comprobar progreso longitudinal. Una serie de decisiones individualmente plausibles puede permanecer en trabajo auxiliar sin acercarse a la meta.

## 2. Cambio mínimo propuesto

Enriquecer **el evento/contrato existente de `next_cycle`** cuando el orquestador detecta un posible desvío. No se define un nuevo estado de fase `strategic_review`, ni se introduce una revisión automática por número fijo de mensajes o experimentos.

El registro de progreso vincula actividades y resultados a una **línea de trabajo identificable** `research_line_id` (o vínculo equivalente si el journal ya permite atribuirlos inequívocamente). Si falta esa atribución, primero reconstruirla desde evidencias existentes; no inventar una taxonomía global. De cada línea solo se necesitan:
- referencia al encargo original y al criterio de éxito al que contribuye;
- hipótesis/método y alternativa principal;
- última decisión de continuar/cambiar;
- actividades desde esa decisión (incluidas tareas instrumentales);
- resultados efectivamente confirmados, negativos y desconocidos.

El host calcula señales estructurales baratas y proporciona al sobre existente una **síntesis de diferencias**: qué trabajo se realizó, qué evidencia nueva existe, qué se desbloqueó y qué queda pendiente. La ausencia de un resultado científico no invalida por sí sola una actividad instrumental: hay que indicar qué experimento o pregunta habilita.

## 3. Disparadores basados en hechos, no en cadencias arbitrarias

Crear `reconsideration_required` solo ante un cambio relevante demostrado o una solicitud fundamentada, por ejemplo:

1. Se propone **repetir la misma línea/actividad** y no hay evidencia nueva o un desbloqueo concreto desde la decisión anterior; explicar la excepción si es una repetición reproducible.
2. Se propone nueva **inversión instrumental significativa**, pero no hay vínculo verificable con la pregunta científica que desbloqueará.
3. Aparece un antecedente, baseline, alternativa o resultado negativo que **puede cambiar** la conveniencia de seguir.
4. La nueva acción implica una modificación importante de estrategia, recursos, alcance o criterios y exige revisar sus consecuencias.
5. Un comentario independiente del Auditor aporta evidencia concreta de desvío de rumbo.

El número «tres iteraciones» de la versión anterior **se retira**: no tiene fundamento específico ni debe introducir un disparador mecánico. Reintentos técnicos, llamadas LLM, ediciones cosméticas y ticks de 15 minutos tampoco son unidades de valor científico.

El control se realiza en el **siguiente punto de decisión**. No interrumpe un experimento atómico en curso, no bloquea otras líneas legítimas del proyecto y no agrega llamadas al LLM cuando no hay señal relevante.

## 4. Qué debe contestar `next_cycle` si hay señal

Aprovechar los campos existentes y proponer, para implementar más adelante, un **objeto opcional `line_assessment` cuando exista disparador**, compatible con los campos normales de fase. El motor valida que se haya recibido el snapshot actual y evidencia referenciada; el texto libre sin fuentes no cierra el disparador.

Preguntas sustantivas, sin una nueva ceremonia de auditoría:

- **Rumbo:** ¿qué parte del objetivo literal resuelve esta línea?
- **Delta comprobable:** ¿qué progreso real hubo desde la última decisión? Separar resultado sobre la meta, habilitación instrumental confirmada y actividad sin resultado demostrable.
- **Estado de lo conocido:** ¿existe un método/baseline que haga innecesaria esta ruta, o solo aparenta equivalencia? Citar revisiones existentes; hacer búsqueda focalizada nueva únicamente si el contexto cambió.
- **Alternativa:** ¿qué otra acción disponible podría responder antes la incertidumbre central, y qué esfuerzo comparativo puede justificarse con datos reales?
- **Decisión:** continuar con experimento/resultado esperado y condición de salida, cambiar de método dentro de la meta, reutilizar, aplazar, solicitar evidencia o proponer cierre por el protocolo existente.

Cuando no se conoce tiempo o costo, registrar `unknown`; no inventar estadísticas ni puntajes de eficiencia. Reutilizar el contrato `selected_action` y `expected_artifacts`: la propuesta `line_assessment` no ejecuta comandos ni autoriza gastos o metas adicionales.

## 5. Texto propuesto para añadir al prompt existente, SIN modificarlo durante el diseño

> Si el orquestador incluye una señal fundamentada de reconsideración, antes de seleccionar otra inversión en la misma línea compará el progreso acumulado con la meta literal, los resultados comprobados desde la última decisión y la mejor alternativa disponible. Diferenciá mejora de la meta, capacidad instrumental que desbloquea una prueba y actividad sin resultado comprobado; referenciá evidencia real y proponé una condición observable para seguir, cambiar de método o aplazar. No repitas búsqueda de antecedentes si ya existe evidencia pertinente ni declares redundancia por coincidencia de términos.

El futuro implementador puede incorporar esa ampliación a `spec/07-prompts/09-next-cycle.md` **junto con el esquema y el host**, en una revisión de código autorizada. La propuesta todavía no está instalada. El prompt operativo mantiene su hash original en esta rama de diseño.

## 6. Integración para el implementador

- **Motor:** identificar líneas en eventos existentes, detectar motivos para reconsiderar y deduplicarlos por IDs/snapshot. No crear un segundo journal. Si la misma línea se repite sin novedad, no aprobarla solo porque `selection_rationale` contiene palabras plausibles.
- **Schema / prompt:** ampliar de manera compatible `next_cycle` con `line_assessment` **solo cuando sea necesario**; actualizar `spec/07-prompts/09-next-cycle.md`. No crear prompt `12-strategic-review` ni fase aparte.
- **Planificador:** exigir la evaluación antes de comprometer otra tarea importante de la misma línea cuando hay señal pendiente; registrar `needs_evidence` o escoger una alternativa legítima. No consumir un turno exclusivo de auditoría por cada tick.
- **Control de novedad:** seguir usando `novelty_review`; no permitir que `line_assessment` declare «ya se hizo» sin comparar mecanismos y condiciones.
- **Auditor ChatGPT:** puede señalar `strategic_drift` con evidencia y solicitar reconsideración por Issues, sin sustituir la decisión del motor.
- **Registro:** persistir el delta, alternativas consideradas, decisión y condición comprobable de salida dentro del evento de siguiente ciclo; la futura vista Obsidian solo lo proyecta.

El motor de hoy **no implementa** el identificador de línea, el disparador, la extensión de `next_cycle` ni esta validación. No afirmar que basta con reformular el prompt: la calidad del control depende de evidencia estructurada y una comprobación del host.

## 7. Pruebas de aceptación focalizadas

R01 — Se repite una corrección instrumental sin desbloquear una prueba ni agregar evidencia; `next_cycle` exige demostrar su utilidad o elegir otra alternativa.  
R02 — Hay progreso incremental confirmado durante varias pruebas; puede continuar sin pausa por un contador.  
R03 — Aparece método existente que satisface el criterio; reconsidera reutilización o registra por qué las condiciones difieren.  
R04 — El motivo contiene palabras persuasivas pero carece de referencias reales; no supera el control activado.  
R05 — El Auditor señala una desviación sin evidencia accesible; registra `not_checked` y solicita comprobación, sin detener toda la investigación.  
R06 — Ante un mismo evento/snapshot reintentado, no duplica reconsideraciones.  
R07 — Un fallo de infraestructura no se considera resultado científico; el esfuerzo de infraestructura puede ser relevante si habilita una medición concreta.  
R08 — La línea se aplaza con motivo y conserva resultados; otra línea del proyecto puede proseguir.

## 8. Diferencias respecto de la versión v0.1

Se descarta: **fase estratégica independiente, prompt 12 independiente, revisión cada tres iteraciones y registro completo redundante de evaluaciones ya hechas por `novelty_review`**.

Se conserva: **comprobar progreso acumulado de la línea frente a la finalidad y el costo de oportunidad cuando una señal verificable lo justifique**, integrada con `next_cycle`. Esta es la única capacidad nueva que propone este documento.
