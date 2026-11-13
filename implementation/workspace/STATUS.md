# Estado real — 0.3.0

- Motor documental y servidor MCP instalados.
- Búsqueda bibliográfica Crossref y recuperación de resúmenes arXiv: probadas con fuentes reales, guardando procedencia y nivel de acceso.
- Prueba técnica documental ResNet: intake, search_plan, extract_evidence, map_knowledge y report confirmados. No se ejecutaron los experimentos del paper.
- Planificador nativo OpenClaw activo cada 15 minutos; procesa proyectos elegibles mientras la PC y el Gateway estén encendidos. Sin trabajo pendiente no llama al modelo.
- Límites: un proyecto por tick, 24 intentos diarios, lease de ocho minutos, backoff y pausa tras tres fallos. Pausar/reanudar/revisitar mediante scheduler/control.
- Pruebas automatizadas y trazas sanitizadas: ver docs/LOCAL_ACCEPTANCE.md en GitHub, rama implementacion/investigador-local.
- Telegram aplazado. Auditoría ChatGPT mediante GitHub aplazada. Ejecución con PC apagada aplazada.
- Experimentos siguen bloqueados: no hay runner aislado instalado y validado; Docker y WSL no están instalados en el entorno comprobado.
- No hay sandbox total de las herramientas nativas, validación semántica automática de papers ni garantía monetaria del proveedor de modelo.

## Cambios posteriores presentes solo en GitHub hasta verificar instalación

- Búsqueda OpenAlex complementaria, planificador `next_cycle` para investigación de múltiples vueltas y rechazo de fases vacías.
- GitHub Actions validó **38 pruebas automatizadas** y un smoke test de comparación baseline/candidato en runner estándar sin secretos.
- El runner remoto experimental todavía no se integra al Gateway ni al registro de resultados; no se puede declarar que Investigador autónomo ya ejecuta y aprende de experimentos.
- Para la entrega operativa hace falta sincronizar el workspace instalado y hacer una prueba end-to-end con un encargo nuevo; preservar datos/secretos del usuario.

## Estado de la rama 0.4.0-dev

Se implementó el enlace MCP → plan aprobado → GitHub Actions → recibo recuperado → journal → evaluación y plan siguiente. Validación de identidad y hashes, prohibición de proyectos privados y registro persistente. Esta actualización está en GitHub, **no está confirmada su instalación en el Gateway**. La aprobación de pruebas automatizadas no sustituye una prueba de dispatch real ni evidencia científica general.
