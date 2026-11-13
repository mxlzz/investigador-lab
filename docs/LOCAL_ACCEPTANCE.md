# Prueba local con fuentes reales — 0.3.0

Fecha: 2026-11-12, Buenos Aires. Entorno probado: OpenClaw 2026.11.1, runtime nativo y modelo ya configurado por el usuario. No se incorporaron claves de modelo.

## Alcance y resultado

Se utilizó una prueba técnica acotada sobre Deep Residual Learning for Image Recognition (ResNet): localizar bibliografía, recuperar el resumen primario, separar afirmaciones de autores de observación propia y producir una síntesis documental. No se abrió un proyecto científico permanente ni se reprodujo el entrenamiento de ResNet.

El expediente confirmó intake, search_plan, extract_evidence, map_knowledge y report. Las continuaciones posteriores a intake fueron lanzadas por el planificador nativo del Gateway en procesos nuevos. La búsqueda Crossref encontró el DOI primario y el recuperador obtuvo el resumen de arXiv. La prueba sin trabajo elegible terminó en NO_REPLY y sin un turno de modelo.

Fuentes públicas utilizadas para verificar la ruta:
- https://doi.org/10.1109/cvpr.2016.90 — metadatos bibliográficos.
- https://arxiv.org/abs/1512.03385 — resumen; no texto completo ni experimento propio.

Las trazas sanitizadas están en LOCAL_ACCEPTANCE.json. No contienen credenciales, configuración del Gateway, conversaciones completas ni expedientes privados.

## Problemas detectados y corregidos

- No había búsqueda web configurada. Se agregó búsqueda bibliográfica Crossref sin claves; no se afirma haber configurado búsqueda general de toda la web.
- En la prueba de capacidades el modelo llamó full_text a una página de resumen. El recuperador ahora registra abstract y el motor rechaza elevar arxiv/abs o metadatos Crossref a texto completo, así como una extracción que contradiga el acceso registrado.
- Se evitó la copia recursiva de todo el historial dentro de cada fase: se guarda procedencia y hashes, y el sobre se recupera por task_id.
- En la primera versión del ciclo de recolección el modelo también confirmó extracción. La versión final limita mecánicamente la fase que puede confirmar un ciclo; esa restricción tiene prueba automatizada.
- Un disparo manual coincidió con una ejecución automática y el Gateway respondió already-running: no se forzó una segunda ejecución. La exclusión funcionó.

## Verificación automatizada

30 pruebas aprobadas en Node.js 24: contratos de fase, idempotencia, referencias inexistentes, permisos/sobres alterados, corrupción del journal, bloqueos, proceso escritor muerto, crecimiento de historial, MCP stdio, exclusión de workers, recuperación de lease, pausa y reanudación, backoff, límite diario, selección entre proyectos, no forzar experimentos para síntesis, fase asignada, revisión con evidencia nueva, registro real de procedencia del proveedor (con red simulada para reproducibilidad), fallo HTTP y distinción resumen/texto completo.

La prueba de red real con OpenClaw es adicional a esas pruebas automatizadas. No se considera pasada toda la matriz T01–T28 ni demostrada la calidad científica universal del agente.

## Configuración final

- Automatización local persistente habilitada; cadencia normal 15 minutos.
- Un proyecto por tick; máximo 24 intentos diarios de Buenos Aires; pausa tras tres fallos; lease de ocho minutos.
- Turnos solicitados de hasta 180 s y watchdogs adicionales del cliente/job.
- Los proyectos terminados o pausados no provocan nuevas llamadas al modelo. Revisión explícita mediante control/restart_from dentro de la misma meta.
- PC y Gateway deben estar encendidos. No se reinició el Gateway del usuario durante las pruebas; la persistencia entre procesos y el registro nativo fueron comprobados.
- Telegram, auditoría ChatGPT por GitHub y ejecución con PC apagada aplazados por el usuario.
- Experimentos aislados pendientes: no se encontró Docker y WSL informó que no está instalado. No se instalaron componentes que requieran habilitar virtualización o reiniciar Windows.

## Límites

Las pruebas de estructura y referencias no verifican la verdad ni la relevancia semántica de un paper. Crossref devuelve resultados próximos que el agente debe evaluar; una coincidencia no demuestra equivalencia. El MCP y el planificador no aíslan todas las herramientas nativas del Gateway ni garantizan los cargos del proveedor. La automatización usa las rutas de la instalación verificada; comprobarlas tras actualizar la app.
