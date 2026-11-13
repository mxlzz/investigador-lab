# Despliegue Windows 0.4.0-dev — aceptación local parcial

Fuente fijada: a5babf46a353d72c81c4da21e5ab9384e7267ada, rama implementacion/investigador-local. Se aplicaron los ajustes locales de compatibilidad y validación incluidos en este cambio. No se fusionó el PR ni se publicó una versión estable.

## Trabajo realizado

- Lectura del encargo CODEX_PHASE2_INSTRUCTIONS y del runbook Windows.
- Copia privada recuperable del workspace, expedientes, configuración y definición del job anterior, fuera de GitHub.
- Actualización de implementation/, spec/, tests/, experiments/ y AGENTS del Investigador, conservando identidad, modelo y Code Mode desactivado. No se actualizó el agente principal.
- Comparación de hashes de los expedientes antes/después de copiar: sin cambios durante el despliegue. Los nuevos eventos de aceptación se conservaron después.
- MCP existente recargado, sin otro Gateway ni otro agente. El propio Investigador recuperó health.version=0.4.0-dev y consultó scheduler.
- Solo se añadió la selección no secreta del repositorio de Actions al entorno del MCP. No se obtuvo ni guardó ningún token.
- 47 pruebas automatizadas locales aprobadas, incluidas las 43 de la rama de origen y cuatro regresiones nuevas.

## Correcciones incluidas

1. Instrucciones compatibles con herramientas directas. La activación automática de Code Mode sigue deshabilitada.
2. Una sesión nueva por ciclo, con expediente persistente como memoria, para reducir el arrastre de conversación. Se observaron respuestas 429 del nivel gratuito de Gemini; no se activaron rutas pagas.
3. Errores de validación por campo en las variantes de fase, en lugar de responder únicamente oneOf. Esto permite reparación guiada de la salida.
4. El trabajador devuelve salida de error si no hay fase confirmada, aunque el modelo haya terminado su respuesta. No se contabiliza una narración como progreso.
5. La revisión documental no encola evaluation experimental por error.

## Dependencia no resuelta

El método nativo tools.github.status informa identidad efectiva unavailable y sin cuenta. Además, el proceso experimental no tiene INVESTIGADOR_GITHUB_TOKEN. La prueba MCP experiment_submit rechazó correctamente el intento con Falta autorización GitHub Actions del equipo; no hubo dispatch.

La prueba real desde Windows plan → dispatch → importación → evaluation NO se considera superada. La aceptación remota previa en CI no reemplaza esa prueba. Hace falta una credencial local protegida para ese repositorio, con Actions escritura para dispatch y lectura de runs/artefactos. Nunca pegarla en el chat ni publicarla en GitHub. Una conexión de cuenta en otra aplicación no se transfiere automáticamente a este proceso MCP/worker.

## Recuperación

Conservar la copia privada realizada antes del despliegue. Para rollback, detener próximos ticks y esperar el lease activo; restaurar únicamente implementation/, spec/ y AGENTS del Investigador y la entrada de su MCP; recargar ese MCP. No restaurar encima ni borrar research-state/, ni revertir configuración de otros agentes. Comprobar health y journal antes de reanudar el job existente. No crear otro job con la misma finalidad.

Telegram y auditoría independiente siguen fuera del alcance. Tampoco se afirma continuidad del coordinador con la PC apagada, calidad científica general ni ejecución aislada local.

## Planificación comprobada desde el Gateway

Los primeros intentos no confirmaron fase; se conservaron como fallos, sin fabricar avance. Se corrigieron argumentos omitidos, validación opaca y estado de salida engañoso. Finalmente, el worker preparó next_cycle en el host, solicitó al modelo una decisión JSON y la confirmó con el validador. La ejecución nativa final terminó con outcome=progress en 5592 ms y quedó un evento next_cycle status=ok, selected_action=null. Esto respeta el alcance documental terminado sin abrir otra meta. El diagnóstico quedó pausado al concluir. Ver la traza sanitizada WINDOWS_LOCAL_ACCEPTANCE.json.

La planificación estructurada evita pedir al modelo que reconstruya tool calls para persistir su propia decisión. El host conserva el control de validación y escritura; no se ejecutan comandos propuestos por JSON.

