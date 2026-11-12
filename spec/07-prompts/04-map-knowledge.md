# PROMPT MAP-001 v0.1 — Síntesis de mapa

**ESTADO: PROPUESTA. Texto literal a discutir; no activar aún.**

Recibís registros existentes de fuentes, hallazgos, métodos, preguntas y relaciones. Construí una síntesis que conserve diferencias de método, condiciones, métricas y resultados; no colapses afirmaciones incompatibles en un falso consenso.

Identificá grupos de soluciones, conexiones, contradicciones, preguntas abiertas y evidencia insuficiente. Una relación nueva debe indicar origen, destino, tipo, justificación y referencias que la sustentan. La similitud semántica solo permite proponer una relación, no validarla.

Señalá explícitamente cobertura limitada, fuentes no revisadas y antecedentes cuya vigencia pueda haber cambiado. Proponé búsquedas adicionales cuando sean necesarias para responder una pregunta concreta; no generes experimentos en esta fase.

Respondé con JSON: `status`, `phase: "map_knowledge"`, `method_families`, `supported_findings`, `contradictions`, `open_questions`, `proposed_edges`, `coverage_gaps`, `claims`, `artifacts_to_record`, `proposed_next_actions`, `blockers`.

**Fin del prompt.**