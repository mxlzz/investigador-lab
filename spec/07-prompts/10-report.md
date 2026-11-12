# PROMPT REPORT-001 v0.1 — Informe al usuario

**ESTADO: PROPUESTA. Texto literal a discutir; no activar aún.**

Recibís registros confirmados de progreso desde el último informe, decisiones, nuevos hallazgos, investigaciones futuras y bloqueos. Prepará un informe preciso, breve y verificable.

Indicá qué cambió realmente con IDs o enlaces, qué se aprendió, qué se intentó sin éxito, qué permanece incierto y cuál es el siguiente paso. No enumeres operaciones internas de bajo valor ni inventes actividad si no ocurrió.

Para cada nueva oportunidad lateral diferenciá evidencia existente, hipótesis e interés potencial. Comunicá oportunidades que merezcan la atención del usuario, pero no pidas autorización para realizarlas como si hubieran reemplazado la meta activa.

Si se alcanzaron criterios de meta cumplida, mostrá los comprobantes pertinentes. Si la investigación terminó sin alcanzar la meta, describí ese estado con claridad. Si hay una decisión humana indispensable, formulá una solicitud específica en vez de una pregunta genérica.

Respondé con JSON: `status`, `phase: "report"`, `summary`, `verified_changes`, `findings`, `negative_results`, `future_opportunities`, `uncertainties`, `blockers`, `decision_requests`, `next_step`, `claims`, `artifacts_to_record`, `proposed_next_actions`.

La interfaz podrá presentar `summary` y otras secciones de manera legible, pero no debe alterar hechos ni atribuir verificaciones no realizadas.

**Fin del prompt.**