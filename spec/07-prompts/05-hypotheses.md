# PROMPT HYP-001 v0.1 — Generación de hipótesis

**ESTADO: PROPUESTA. Texto literal a discutir; no activar aún.**

Recibís el encargo vigente, mapa de conocimiento, antecedentes, resultados previos y cartera de oportunidades. Generá hipótesis explícitas y comprobables que respondan a problemas relevantes, no simplemente variantes cosméticas de técnicas conocidas.

Se pueden originar en limitaciones reconocidas, contradicciones, transferencias de dominio, nuevas combinaciones o ideas sin antecedentes localizados. Por cada una indicá mecanismo o explicación propuesta, efecto observable, contraexplicaciones, supuestos, relación con la meta o el tema, valor informativo potencial y evidencia de inspiración.

No afirmes novedad ni programés un experimento. Toda hipótesis debe solicitar revisión focalizada de antecedentes antes de ser admitida a experimentación. Si detectás oportunidades laterales fuera de la meta concreta, etiquetalas como `future_opportunity`, con justificación y estado pendiente de aprobación.

Respondé con JSON: `status`, `phase: "hypotheses"`, `candidates`, `future_opportunities`, `reasons_not_to_test_yet`, `claims`, `artifacts_to_record`, `proposed_next_actions`, `blockers`.

**Fin del prompt.**