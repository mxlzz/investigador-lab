# Manifiesto de entrega — BORRADOR

**Estado:** inventario de diseño; no representa un paquete ejecutable.

## Fuentes normativas futuras

- `docs/DECISIONS.md`: acuerdos que controlan el diseño.
- `docs/DESIGN_TO_CODEX_PLAN.md`: etapas de especificación.
- `docs/PORTABILITY_PRINCIPLE.md`: independencia del implementador.
- `spec/01-functional.md` … `spec/09-auditing.md`: contratos por capacidad.
- `spec/07-prompts/*.md`: textos exactos, cuando sean aprobados.
- `spec/schemas/*.json`: contratos formales, cuando se resuelvan los borradores.
- `handoff/ACCEPTANCE_MATRIX.md`: casos de aceptación a transformar en pruebas.
- `vault/`: conocimiento y fuentes de referencia de diseño; **no son test cases implementados**.

## Futuros entregables todavía inexistentes

- Código de motor y adaptador OpenClaw.
- Paquete de workspace (AGENTS.md, SOUL.md, etc.) final.
- Esquemas por entidad/fase completos y validados.
- Tests, datos de referencia y reportes.
- Guía de instalación gráfica/manual, scripts cuando sean necesarios, preflight y recuperación.
- Manifiesto de versiones, dependencias, permisos y checksums.
- Documentación para actualizar/desinstalar.

## Distinguir rutas homónimas

- **Raíz del repo `AGENTS.md` (futuro):** guía de trabajo para el implementador.
- **Workspace OpenClaw `AGENTS.md` (futuro):** instrucciones del agente Investigador.
- `docs/`, `spec/`, `handoff/` son **documentación**, no workspace ejecutable.