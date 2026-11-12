# Investigador Lab

**Estado:** diseño preliminar — no hay implementación funcional ni experimentos ejecutados.
**Fecha inicial:** 2026-11-12.

Infraestructura universal de investigación y desarrollo autónomo, coordinable desde OpenClaw. Recibe **una meta o un tema**, investiga el conocimiento previo, detecta vacíos, propone hipótesis, verifica antecedentes antes de experimentar, implementa, evalúa y conserva trazabilidad.

## Principios

1. **Antecedentes antes de hipótesis:** una idea nueva para el agente no implica una contribución original al campo.
2. **Segunda búsqueda antes de experimentar:** toda propuesta se somete a una revisión focalizada de equivalencias y resultados existentes.
3. **Evidencia antes de afirmaciones:** distinguir fuente, observación, inferencia e hipótesis; conservar resultados negativos.
4. **Reproducción justificada:** reproducir resultados externos cuando aporta verificación o una comparación necesaria.
5. **Trazabilidad:** fuente → hallazgo → hipótesis → experimento → decisión → cambio de código/versiones.
6. **Persistencia fuera de la conversación:** registros en Git; datos voluminosos en almacenamiento persistente referenciado por hashes.
7. **Autonomía controlada:** trabajar por ciclos con permisos, límites de recursos, aislamiento y auditoría.

## Documentación

- [Visión y alcance](docs/VISION.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Protocolo de investigación](docs/RESEARCH_PROTOCOL.md)
- [Plan de especificación y entrega a Codex](docs/DESIGN_TO_CODEX_PLAN.md) — etapa actual: diseño\n- [Hoja de ruta de implementación propuesta](docs/ROADMAP.md) — aún no autorizada
- [Decisiones](docs/DECISIONS.md)
- [Proyectos de referencia](docs/REFERENCE_PROJECTS.md)
- [Mapa de conocimientos para Obsidian](vault/Inicio.md)

## Abrir en Obsidian

Cloná o descargá el repositorio en una carpeta local. En Obsidian elegí **Open folder as vault / Abrir carpeta como bóveda** y seleccioná la subcarpeta `vault/`. Las notas Markdown tienen enlaces internos. Para recibir cambios de GitHub hay que sincronizar la copia local; Obsidian no realiza automáticamente un `git pull`.

## Alcance actual

Este repositorio contiene **especificaciones y registros iniciales de ejemplo**, no un agente autónomo operativo. Todavía no se integró AI Scientist v3 ni se validó la configuración de OpenClaw. Toda etapa de implementación requerirá pruebas.