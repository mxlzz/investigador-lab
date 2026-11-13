# Recuperación del paso experimental en Windows

Fecha: 2026-11-13. OpenClaw 2026.11.1, workspace instalado del investigador.

## Causa comprobada

El planificador pausó experiment_plan después de tres intentos sin un evento experiment_plan confirmado. Los turnos hicieron llamadas incompletas (sin key/data), volvieron a leer state y terminaron con narrativa, no con un plan. También hubo 429 del proveedor; ampliar tiempos o cambiar de modelo no resuelve una capacidad ausente.

El worker exigía publicar scripts y un manifiesto antes de registrar el plan, pero el MCP solo permitía leer fuentes, sincronizar avances y registrar planes ya publicados. Faltaba el publicador. Además, un diseño con hypothesis_id inventado había pasado la validación sintáctica y habría sido rechazado al registrar el plan.

## Cambio implementado

* experiment_design usa una respuesta estructurada y el host valida que su hipótesis exista y tenga revisión de novedad compatible. Los prompts y esquemas originales de spec permanecen intactos.
* experiment_plan pide una propuesta JSON acotada con scripts Node 24, baseline/candidato, métrica, metodología y datos públicos. El host calcula rutas, manifiesto y SHA256. No pide al modelo que invente commits o hashes.
* ExperimentPublication valida visibilidad pública, novedad, diseño, métrica, presupuesto cero, rutas y tamaños antes de escribir. Rechaza patrones conocidos de credenciales; esto no sustituye una auditoría del código.
* Publica exclusivamente una rama determinista experiment/<project>-<digest> en el repositorio experimental configurado. Incluye el runner instalado de confianza, no una versión elegida por el modelo. No cambia main, workflows, releases ni fuerza referencias.
* Una intención durable conserva la propuesta antes de publicar. Si se pierde una confirmación de GitHub, recupera la referencia y verifica cada archivo contra el commit exacto. Solo entonces registra el plan. Un error de lectura o un contenido distinto impide aceptarlo.
* experiment_publish expone la misma operación mediante MCP. Las ejecuciones programadas la realizan desde el host, sin secuencias repetidas de herramientas del modelo. Los scripts se ejecutan únicamente en GitHub Actions.
* Una evaluación encolada pasa primero por plan, dispatch y poll. Un diseño nuevo no reutiliza planes de diseños anteriores.
* Durante la aceptación real, evaluation repitió llamadas accept sin key/envelope. Se detuvo su turno exacto y se comprobaron agent.wait y cron terminales antes de reconciliar su reserva. evaluation y report ahora reciben un sobre estructurado y el host confirma la salida; evaluation debe referenciar la key del resultado verificado. No se repite el dispatch.
* El modelo luego devolvió el ID lógico del experimento en vez de la key del recibo. El host normaliza esa referencia únicamente si identifica un resultado verificado único; rechaza ausencia o ambigüedad y no modifica los hallazgos. Se recuperó la respuesta ya generada comprobando que el estado seguía siendo el mismo, se aceptó la evaluación y se avanzó al informe sin otra llamada al modelo para esa evaluación.

## Despliegue y réplica

Usar la guía REPLICAR_EN_WINDOWS.md con la rama fix/experiment-publication, que incluye las correcciones anteriores. En una instalación existente:

1. Pausar temporalmente el job existente y comprobar que no haya reserva activa. Respaldar implementation y scheduler.json en un lugar privado.
2. Instalar engine.mjs, scheduler.mjs, scheduler-tick.mjs, mcp-server.mjs y el nuevo experiment-publication.mjs. Conservar los demás módulos y el runner instalado.
3. Recargar MCP. Conservar el repositorio experimental, identidad administrada y tiempos configurados; no copiar credenciales desde otra PC.
4. Reanudar desde experiment_design si el diseño previo referencia una hipótesis inválida, mediante Scheduler.control con restart_from. Preservar eventos anteriores; no reescribir el journal para aparentar éxito.
5. Habilitar el mismo job y ejecutar pasos acotados hasta comprobar publicación, dispatch e importación. Un dispatch incierto se consulta por request_id: no se duplica.

Los proyectos privados siguen sin poder publicar experimentos en infraestructura pública. La publicación es código experimental, no una release estable. El rollback restaura los módulos respaldados con el job detenido; no borra el historial ni vuelve a enviar un experimento ya solicitado.

## Evidencia de aceptación

86 pruebas locales aprobadas. Se verifican referencias inventadas, proyectos privados, rutas fuera del directorio permitido, patrones de secretos, métricas incompatibles, recuperación de confirmación perdida, contenido remoto alterado, idempotencia, bloqueo estructurado, dependencias de evaluación, aceptación de evaluación/informe por el host y normalización no ambigua de IDs. CI incluye la nueva suite.

En la instalación real: diseño nuevo aceptado con hipótesis existente; propuesta generada por el modelo y publicada por el host; plan registrado tras lectura independiente; dispatch único; Actions finalizado success; artefacto verificado e importado; evaluación e informe aceptados. Código público fijado en a16996100a4af642a9de1fcd284a135f19631d9d. Ejecución: [43519292261](https://github.com/mxlzz/investigador-lab/actions/runs/43519292261). El proyecto quedó habilitado con cero fallos consecutivos.

Esto prueba el circuito experimental Windows → GitHub → Windows. No prueba superioridad general de un algoritmo: el primer script generado mide un caso sintético aleatorio, no toda la cobertura del diseño. La diferencia de heapUsed no equivale a memoria total asignada y puede estar afectada por GC y almacenamiento de typed arrays. La evaluación debe conservar estas limitaciones y proponer controles adicionales. No se publican tokens, sesiones o expedientes privados.
