# Estado del diseño — Investigador Lab

**Actualizado:** 2026-11-12.  
**Fase:** diseño, sin implementación autorizada.

| Etapa | Material creado | Estado |
| --- | --- | --- |
| E1 Contrato funcional | `spec/01-functional.md`, `spec/contracts/notification-delivery.md` | Informe 20:00 con reintento acordado; entrega de resultado incierto sigue abierta |
| E2 Antecedentes | `spec/02-prior-art.md`, `spec/CORE_RESEARCH_LOOP.md` | Flujo científico de punta a punta propuesto; fuentes y criterios de cobertura pendientes |
| E3 Hipótesis | `spec/03-hypotheses.md` | Borrador; admisión y equivalencia por precisar |
| E4 Experimentos | `spec/04-experiments.md` | Borrador; límites y métricas por definir |
| E5 Conocimiento | `spec/05-knowledge.md`, `spec/schemas/` | Esquema de fases discriminado en borrador; subesquemas, referencias e IDs por resolver |
| E6 Autonomía | `spec/06-autonomy.md` | Inactividad local de 15 min, pausa al regreso y prioridades humanas acordadas; límites y recuperación por concretar |
| E7 Prompts | `spec/07-prompts/`, `spec/07-prompt-contracts.md` | Prompts aún en borrador; prioridad próxima: traducir ciclo científico a instrucciones exactas y evaluables |
| E8 Infraestructura | `spec/08-deployment.md`, `docs/REMOTE_EXECUTION_ANALYSIS.md`, `spec/contracts/remote-data-admission.md` | Restricción de datos aprobada; contrato de admisión propuesto, sin implementación |
| E9 Auditoría | `spec/09-auditing.md`, `docs/AUDIT_TRIGGER_DESIGN.md`, `spec/contracts/release-audit-gate.md` | Hitos y bloqueo acordados; gate propuesto, resolución de hallazgos y contingencia pendientes |
| E10 Entrega | `handoff/` | Manifiesto/matriz preliminares; no aptos para implementar |

## Qué sí se consiguió

Se tradujeron las decisiones acordadas DEC-0001…DEC-0027 en una primera capa de documentación por capacidad. Se redactaron **borradores literales** para 12 funciones de prompts, y se dispuso una matriz inicial de pruebas. El repositorio contiene evidencia/obligaciones de trazabilidad y una base Obsidian.

## Qué NO se consiguió

- Los documentos no están aprobados ni son completos; algunos tienen incompatibilidades que deben corregirse.
- No se validó capacidad real de modelo, API, herramientas ni sandbox.
- No hay implementación funcional, guía de instalación validada, tests ejecutados ni agentes funcionando bajo estas reglas.
- No se eligió implementador, no se configuró OpenClaw, no se crearon automatizaciones ni se gastó en experimentos.

## Condición de avance

Consultar `docs/OPEN_DESIGN_QUESTIONS.md`. Solo convertir una propuesta en acuerdo tras decisión del usuario, y solo congelar especificación cuando se hayan resuelto pendientes y probado coherencia.