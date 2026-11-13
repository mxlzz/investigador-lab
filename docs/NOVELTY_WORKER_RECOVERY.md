# Recuperación de la revisión de novedad

## Problema y corrección

Una propuesta aceptada en hypotheses no creaba el evento hypothesis que novelty_review necesita referenciar. El host ahora materializa literalmente cada candidato con un ID determinista y conserva sus referencias originales; una lista de referencias vacía sigue vacía. Esto registra una propuesta, no evidencia ni un resultado probado.

El contrato existente define searches_reviewed como objetos, pero la validación buscaba strings. Ahora exige objetos con search_id que apunte a una búsqueda real. También informa claramente cuando falta output.phase antes de comprobar la reserva del ciclo.

El worker prepara novelty_review y pide una sola respuesta JSON estructurada al modelo; el host valida y persiste el resultado. Esto evita secuencias repetidas de herramientas y reduce consumo de contexto. No elimina las restricciones de cuota o disponibilidad del proveedor. La preparación está dentro del manejo de errores para liberar la reserva si falla.

## Validación y despliegue

78 pruebas locales aprobadas: incluyen materialización idempotente, referencias reales y falsas, fase ausente, aceptación del worker con modelo simulado y liberación de reserva ante fallo de preparación. CI incluye la nueva suite. Los prompts y esquemas originales de spec permanecen intactos.

Se respaldaron y sustituyeron únicamente engine.mjs, mcp-server.mjs y scheduler-tick.mjs en implementation del workspace Windows existente; se recargó MCP. Para repetir la instalación, seguir REPLICAR_EN_WINDOWS.md usando la rama fix/novelty-worker basada en fix/investigador-timeouts. Los snapshots anteriores se conservan.

La intervención detuvo primero el intento anterior y comprobó su terminación en el agente y cron antes de reconciliar su reserva exacta. Después habilitó el proyecto y el job existente, sin duplicarlo ni reinicializar el expediente. Una ejecución real aceptó novelty_review y el planificador pasó a experiment_design. Esto acredita continuidad del flujo, no ejecución experimental ni resultados científicos. No se publican sesiones, credenciales o expedientes de la investigación.
