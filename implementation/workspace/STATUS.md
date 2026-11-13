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
