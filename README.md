> **Instalación y réplica en Windows:** [guía completa](docs/REPLICAR_EN_WINDOWS.md), [respaldos Gemini y presupuestos](docs/GEMINI_FALLBACKS.md) y [publicación experimental y recuperación](docs/EXPERIMENT_PUBLICATION_RECOVERY.md). La rama `fix/experiment-publication` reúne la instalación actual. Los snapshots anteriores conservan sus versiones históricas; no asumir que `main` contiene la implementación.

# Investigador Lab

**Estado:** investigación documental, continuidad y repositorios por proyecto instalados en Windows. Circuito experimental real de publicación, dispatch en GitHub Actions e importación verificada confirmado; ver [evidencia y límites](docs/EXPERIMENT_PUBLICATION_RECOVERY.md). No se declara completo todo el alcance de investigación autónoma.
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
- [Plan de especificación y entrega a Codex](docs/DESIGN_TO_CODEX_PLAN.md) — etapa actual: diseño
- [Estado y pendientes del diseño](docs/DESIGN_STATUS.md)
- [Especificaciones E1–E9 y prompts en borrador](spec/README.md)
- [Casos de aceptación del futuro sistema](handoff/ACCEPTANCE_MATRIX.md)
- [Guía de portabilidad y futura instalación](docs/PORTABILITY_PRINCIPLE.md)
- [Análisis técnico de continuidad remota (propuesta)](docs/REMOTE_EXECUTION_ANALYSIS.md)
- [Auditorías y disparadores por hito (propuesta)](docs/AUDIT_TRIGGER_DESIGN.md)
- [Referencias técnicas verificadas](docs/TECHNICAL_REFERENCES.md)
- [Hoja de ruta de implementación propuesta](docs/ROADMAP.md) — aún no autorizada
- [Decisiones](docs/DECISIONS.md)
- [Proyectos de referencia](docs/REFERENCE_PROJECTS.md)
- [Mapa de conocimientos para Obsidian](vault/Inicio.md)

## Abrir en Obsidian

Cloná o descargá el repositorio en una carpeta local. En Obsidian elegí **Open folder as vault / Abrir carpeta como bóveda** y seleccioná la subcarpeta `vault/`. Las notas Markdown tienen enlaces internos. Para recibir cambios de GitHub hay que sincronizar la copia local; Obsidian no realiza automáticamente un `git pull`.

## Alcance actual

La referencia de Windows incluye el motor MCP, el planificador, lectura de repositorios fuente y creación/sincronización de repositorios por investigación. La guía de réplica documenta sus versiones, credenciales propias, configuración, pruebas y rollback. Las especificaciones originales y documentos históricos conservan propuestas que aún no están implementadas. No hay integración completa de AI Scientist v3, auditor independiente, Telegram activo ni ejecución con la PC apagada.

