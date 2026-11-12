# Referencias técnicas verificadas para el diseño

**Consulta:** 2026-11-12.  
**Advertencia:** documentación externa cambia; volver a comprobar al congelar la especificación para implementación.

## OpenClaw: límites relevantes

1. Workspace y archivos de instrucciones: https://docs.openclaw.ai/concepts/agent-workspace
   - El workspace es directorio de trabajo; no es sandbox.
   - Contexto inyectado puede recortarse; los prompts largos no deben depender de estar siempre completos.
   - La configuración y credenciales del Gateway residen fuera del workspace.
2. Agente y archivos de arranque: https://docs.openclaw.ai/concepts/agent
   - Archivos típicos: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `BOOTSTRAP.md`; otros dependen de versión.
3. Sandboxing: https://docs.openclaw.ai/gateway/sandboxing
   - Desactivado por defecto; solo algunas herramientas quedan aisladas y no constituye una garantía absoluta.
4. Permisos de herramientas: https://docs.openclaw.ai/gateway/security/tool-permissions
   - Controles distintos para filesystem, herramientas y comunicaciones entre agentes; permisos de una instancia no se infieren del workspace.
5. Automatizaciones: https://docs.openclaw.ai/automation/cron-jobs/how-it-works
   - Las ejecuta el Gateway y depende de su disponibilidad; los jobs programados persisten en estado interno.
6. Ventanas de operación y carga: https://docs.openclaw.ai/automation/cron-jobs/schedules
   - Permite ventanas horarias y `idleOnly` en determinadas modalidades; requiere validar compatibilidad real.
7. Subagentes: https://docs.openclaw.ai/tools/subagents
   - Sesiones separadas; costes/contextos propios y riesgos de delegación que deben limitarse.

## Revisión de investigación existente

- The Agentic Scientist, Sakana AI (v3): https://pub.sakana.ai/agentic-scientist/
- Código: https://github.com/SakanaAI/AI-Scientist-v3
- Publicación: https://arxiv.org/abs/2610.18933

Límite declarado por los autores: búsqueda bibliográfica tardía, durante preparación del manuscrito y no integrada suficientemente en ideación; no hay pipeline fiable para convertir investigaciones publicadas en baselines del estado del arte. Esto **no** significa que el problema ya esté resuelto por nuestro diseño, solo identifica requisitos y riesgos.

## GitHub / Codex

- Guía de `AGENTS.md` en Codex: https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide
- El fichero del repositorio orientará al **implementador**, no será el `AGENTS.md` operativo de OpenClaw.

## Obsidian

- Propiedades YAML: https://obsidian.md/help/properties
- Grafo: https://obsidian.md/help/plugins/graph
- Portabilidad Markdown: https://obsidian.md/help/data-storage

## Contratos estructurados

- Composición JSON Schema: https://json-schema.org/understanding-json-schema/reference/combining
- Extensión de objetos cerrados: https://json-schema.org/understanding-json-schema/reference/object

## Riesgos de vigencia

No fijar comandos ni rutas GUI definitivos sin comprobar la instalación concreta. El producto puede cambiar entre la fecha de diseño y la de implementación.