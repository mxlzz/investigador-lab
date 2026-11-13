# Implementación 0.2.0

Motor documental ejecutable y servidor MCP, sin paquetes externos. Requiere Node.js 24. No constituye todavía el sistema autónomo completo de los borradores de spec/.

## Ejecución

`node implementation/engine.mjs health`

`node --test tests/engine.test.mjs tests/mcp.test.mjs`

El MCP se inicia con `node implementation/mcp-server.mjs`. Conserva estado en research-state/ bajo el workspace. Su herramienta research ofrece init, projects, state, prepare, record, accept, gate y report. prepare devuelve los prompts exactos y su contrato; accept valida y confirma. El modelo lo proporciona OpenClaw, sin otra clave API ni otro SDK.

## Telegram

Ejecutar interactivamente setup-telegram.ps1 en Windows. El script verifica el bot, identifica un chat privado, pide confirmar el destino, envía una prueba y guarda el token cifrado con DPAPI para ese usuario fuera del repo. No cambiar webhooks existentes. Luego crea una tarea de Windows que revisa la cola cada cinco minutos durante un año y genera el informe desde las 20:00 de Buenos Aires. Requiere PC encendida y sesión de ese usuario disponible. La prueba real y la programación no se consideran hechas hasta ejecutar ese asistente.

Los proyectos privados no se describen por Telegram: se indica su existencia. La elegibilidad para divulgar detalles privados requiere un contrato adicional. En rechazo confirmado se reintenta; con acuse perdido se conserva uncertain y no se reenvía a ciegas. Telegram Bot API no permite consultar un historial de envíos arbitrario: no se promete entrega exactamente una vez. Los informes pendientes quedan en research-state/reports y los acuses en outbox/.

## Límites

El esquema fuente es un borrador y sus subcampos abiertos no se convierten en un contrato científico completo por validarlo. El motor comprueba estructura y referencias, no verdad semántica ni calidad de la literatura. Las búsquedas se realizan con las herramientas efectivamente conectadas a OpenClaw.

No hay ejecutor aislado ni auditor independiente automático. Tampoco un runner remoto, scheduler de ciclos científicos o publicación automática. Las operaciones experiment, remote y release se rechazan. No se considera pasada la matriz T01–T28. No hay garantías de aislamiento frente a las herramientas nativas de OpenClaw ni de presupuesto del proveedor del modelo. Cualquier ampliación deberá probarse con un proyecto y límites explícitos.

## Recuperación

La cola y el journal se conservan entre sesiones. Un journal modificado o parcialmente escrito falla de forma visible. Si existe LOCK tras una caída, comprobar primero que no siga vivo el PID guardado; conservar copia del expediente antes de recuperar. No eliminar bloqueos automáticamente. El encadenado de hashes detecta modificaciones accidentales; no es una firma contra un atacante con escritura total del workspace.

Los registros y el token no deben entrar a Git. Los cambios de implementación permanecen locales hasta decidir su publicación.
