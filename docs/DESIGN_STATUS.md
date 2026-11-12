# Estado del diseño — Investigador Lab

**Actualizado:** 2026-11-12.  
**Fase:** diseño, sin implementación autorizada.

| Etapa | Material creado | Estado |
| --- | --- | --- |
| E1 Contrato funcional | `spec/01-functional.md` | Borrador; decisiones de interacción pendientes |
| E2 Antecedentes | `spec/02-prior-art.md` | Borrador; criterios de cobertura por cerrar |
| E3 Hipótesis | `spec/03-hypotheses.md` | Borrador; admisión y equivalencia por precisar |
| E4 Experimentos | `spec/04-experiments.md` | Borrador; límites y métricas por definir |
| E5 Conocimiento | `spec/05-knowledge.md`, `spec/schemas/` | Borrador; esquemas inconsistentes e IDs por resolver |
| E6 Autonomía | `spec/06-autonomy.md` | Borrador; presupuesto/permisos/agenda por resolver |
| E7 Prompts | `spec/07-prompts/`, `spec/07-prompt-contracts.md` | Textos v0.1 redactados; no aprobados ni validados |
| E8 Infraestructura | `spec/08-deployment.md` | Borrador; plataforma/versiones y paquetes pendientes |
| E9 Auditoría | `spec/09-auditing.md` | Borrador; autoridad y cadencia pendientes |
| E10 Entrega | `handoff/` | Manifiesto/matriz preliminares; no aptos para implementar |

## Qué sí se consiguió

Se tradujeron las decisiones acordadas DEC-0001…DEC-0009 en una primera capa de documentación por capacidad. Se redactaron **borradores literales** para 12 funciones de prompts, y se dispuso una matriz inicial de pruebas. El repositorio contiene evidencia/obligaciones de trazabilidad y una base Obsidian.

## Qué NO se consiguió

- Los documentos no están aprobados ni son completos; algunos tienen incompatibilidades que deben corregirse.
- No se validó capacidad real de modelo, API, herramientas ni sandbox.
- No hay implementación funcional, guía de instalación validada, tests ejecutados ni agentes funcionando bajo estas reglas.
- No se eligió implementador, no se configuró OpenClaw, no se crearon automatizaciones ni se gastó en experimentos.

## Condición de avance

Consultar `docs/OPEN_DESIGN_QUESTIONS.md`. Solo convertir una propuesta en acuerdo tras decisión del usuario, y solo congelar especificación cuando se hayan resuelto pendientes y probado coherencia.