# Ajuste de herramientas de OpenClaw — 2026-11-12

Los logs del Gateway mostraron intentos de usar fs fuera de Node, API.read sobre STATUS.md y un describe sobre un valor incorrecto. Code Mode se activaba automáticamente para el modelo configurado; tools no tenía un override explícito. También aparecían avisos de esquema de exec para el proveedor, sin que eso pruebe por sí solo la causa de todos los errores.

Se fijó tools.codeMode.enabled=false en la instalación local y se adaptaron AGENTS.md del Investigador y el prompt del worker para usar herramientas directas cuando están expuestas. Se conserva la ruta condicional de Code Mode para una sesión que lo habilite explícitamente. No se cambiaron modelos, credenciales ni permisos de herramientas.

Verificación real mediante el Gateway, en sesiones de prueba nuevas:

| Agente | Acción | Resultado | Code Mode | Fallos de herramientas |
| --- | --- | --- | --- | --- |
| main | Leer AGENTS.md con read | ok, una llamada | false | 0 |
| investigador | Descubrir y consultar research/health | ok, versión 0.3.0 | false | 0 |

La segunda prueba utilizó tool_search, investigador__research y dispatch_action. Las respuestas se contrastaron con toolSummary y recibos de herramientas exitosas, no solo con el relato del modelo.

El cambio se aplicó sin reiniciar el Gateway. Las sesiones ya activas pueden conservar contexto anterior; iniciar un turno nuevo para comprobar la superficie actual. Reversión: retirar el override explícito o restaurar su valor anterior auto después de volver a probar. Una copia privada de la configuración anterior permanece fuera de GitHub.

No se publican archivos de configuración, registros completos, tokens ni contenidos de conversaciones. Esto verifica dos rutas concretas; no garantiza eliminar todos los fallos del modelo, del proveedor o de sesiones expiradas.
