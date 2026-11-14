# Cómo operar Auditor ChatGPT desde Proyectos y tareas programadas — propuesta v0.1

**Solo diseño. No crea tareas, proyectos de ChatGPT ni cuentas de GitHub.** Actualización: 2026-11-13.

## 1. Decisión arquitectónica propuesta

Usar **un proyecto ChatGPT «Auditores»** como interfaz humana, con instrucciones compartidas y **un chat opcional por investigación** para conversar, pedir revisiones especiales y estudiar los hallazgos.

El **servicio automático** es distinto: **una tarea programada de ChatGPT/Work que se ejecuta dos veces al día**, y que revisa un registro de proyectos activos desde GitHub. No crear un GPT personalizado por proyecto ni una tarea programada por investigación. Ni un proyecto de ChatGPT ni un chat equivalen por sí solos a un proceso autónomo en espera de eventos.

El estado persistente reside en GitHub y en los journals de Investigador, no en el historial de un chat. Cada auditoría se ejecuta contra el snapshot actual con SHA y el cursor de la auditoría anterior, incluso si el chat fue archivado.

## 2. Alta de una investigación (sin «inicializar» manualmente un segundo agente)

Cuando OpenClaw crea una investigación mediante `research_start` y establece el repo de resultados:

1. Crea/reutiliza el Issue «Buzón de auditoría — <project_id>» en ese repo, cuando la cuenta tenga permisos `Issues`.
2. Registra en un **índice de auditorías privado** `project_id`, repo ID, ruta, Issue number, fase, visibilidad, estado `active`, último commit exportado y último cursor de auditoría.
3. Verifica si el actor técnico del Auditor tiene acceso a ese repo privado; si no, registra `audit_access_pending`, sin cambiar visibilidad del proyecto.
4. No crea necesariamente un chat nuevo de ChatGPT: ChatGPT no ofrece en este diseño un API validada para crear un chat de proyecto y ligarlo a una tarea de manera automática. El usuario puede abrir uno para examinar la investigación cuando quiera.

**Índice privado de control**: una ubicación tipo `auditor-control` (repo privado nuevo dedicado) o almacén de configuración controlado, no una lista de repositorios privados en `investigador-lab` público. La decisión de repositorio y permisos se cerrará al implementar. Registrar altas/bajas idempotentemente por `project_id`, con trazabilidad de identidad y manifest.

## 3. Estructura de ChatGPT propuesta

```text
Proyecto ChatGPT: Auditores
  Instrucciones comunes: protocolo / severidad / prohibiciones / GitHub como fuente
  Chat: Investigación «QuickSort vs MergeSort» (opcional, revisión interactiva)
  Chat: Investigación «Denoiser ACD» (opcional, revisión interactiva)
  Chat: Auditoría general / casos escalados (opcional)

Programadas (independiente de la lista de chats):
  Auditoría global — 09:00 y 19:00 Buenos Aires (HORARIOS PROPUESTOS)
    → GitHub: leer índice privado de proyectos
    → encontrar cambios desde cursor de cada uno
    → evaluar evidencia realmente accesible
    → escribir comentario estructurado en Issue de auditoría correspondiente
    → guardar audit_cycle/cursor y resultados
```

Los chats no son los receptores obligatorios de notificaciones del sistema. Un usuario puede utilizar sus conversaciones dentro del proyecto para pedir una auditoría profunda, discutir una interpretación o consultar el estado sin depender de que una tarea programada recupere la conversación original.

## 4. Contrato operativo de la tarea global

Cada ejecución:

1. Obtener la lista de proyectos `active`, `closure_proposed` y hallazgos abiertos desde el índice.
2. Buscar el último `audit_cycle_id` confirmado y la ventana desde la anterior corrida; si una ejecución fue omitida, examinar todos los deltas restantes dentro de límites razonables.
3. Fijar un SHA de cada proyecto ANTES de leer evidencias, y registrar la lista exacta de artefactos leídos.
4. Dar preferencia a proyectos con experimentos nuevos, cierres propuestos, hallazgos críticos o cambios no auditados. Si algún proyecto queda para el siguiente lote, registrar `not_checked_due_to_budget` (no `passed`).
5. Emitir comentarios mediante `github-audit-inbox-v1.md`, que el Investigador recupera en el tick siguiente, sin depender de mención `@`.
6. Persistir resultado y cursor **después** de confirmar la escritura; ante caída, reintentar con idempotencia por `audit_cycle_id`/ID de mensaje.
7. Entregar al usuario un resumen breve de qué revisó, qué no pudo revisar y qué requiere intervención. No repetir el informe narrativo del Investigador.

Las dos ejecuciones son revisiones del **conjunto** de investigaciones, no dos auditorías profundas multiplicadas por cada repo. Las auditorías profundas siguen disparadas por hitos según DEC-0025 y requieren una orden específica con snapshot, evidencias y criterios de aceptación.

**Nota de capacidad:** ChatGPT documenta tareas programadas que pueden usar apps conectadas, incluso GitHub cuando está disponible. También ofrece tareas por evento en Work ante **actividades compatibles de pull requests**, no se debe asumir un trigger nativo de comentarios de Issues. Los accesos, permisos, aprobación de acciones y ejecución realmente autónoma deben probarse en E0. Un envío que se pausa para aprobación humana no satisface una auditoría totalmente autónoma; debe registrarse `waiting_for_approval`.

## 5. Por qué no «un GPT personalizado / una automatización por proyecto»

- Los GPTs personalizados no admiten Scheduled tasks en la documentación actual (2026-11-13).
- Una tarea creada dentro de un Proyecto ChatGPT **no puede acceder a los archivos cargados o guardados en ese proyecto**; por tanto, la fuente de auditoría serán los commits GitHub recuperados por herramienta, no adjuntos internos.
- El número de tareas activas es limitado por plan (por ejemplo, la documentación actual informa 5 para Plus), por lo que generar dos tareas por cada proyecto no escala.
- El historial de cada chat es útil para el **usuario** pero no prueba que una tarea programada vaya a reanudar exactamente ese chat y lea todo su contexto.

El modelo por proyecto-chats se mantiene como experiencia de consulta opcional. Un índice central y un contrato uniforme garantizan continuidad independientemente de cuántos chats existan.

## 6. Separar usuarios y agentes: antes del primer comentario

Véase `contracts/auditor-github-identity-v1.md`. La cuenta GitHub que inicia sesión en el conector determina cómo se atribuyen los comentarios. No basta una instrucción «presentate como Auditor». Antes de activar `finding_resolved`, `closure_proposed` o bloqueos críticos debe verificarse actor técnico independiente o un mecanismo de autorización equivalente aceptado.

## 7. Prueba de factibilidad mínima E0

Sin crear un sistema general primero, el implementador en el otro chat debe probar sobre un **repo privado de prueba**:

1. Tarea de ChatGPT/Work ejecutada a una hora futura que lea el repo por su ID, abra una fuente y fije su SHA.
2. Publicación de un comentario de prueba con marcador y un ID de auditoría, bajo cuenta de GitHub distinguible de Investigador. Comprobar si solicita aprobación y si queda bloqueada cuando el usuario no está.
3. Desde OpenClaw, recibir ese comentario y guardar `comment_id` en expediente una sola vez.
4. Otra ejecución programada que lea la respuesta de Investigador y mantenga mismo `finding_id`, cursor e identidad.
5. Comprobar que no reveló contenido privado fuera del repo y que no cambió visibilidad ni permisos.

Si falla alguno: registrar el **bloqueo concreto**, distinguir incapacidad de lectura, de escritura, de programación o de identidad, y regresar al diseño. No crear una cuenta adicional hasta saber que su conexión puede utilizarse en la tarea.

## 8. Documentación oficial consultada (2026-11-13)

- https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt
- https://help.openai.com/en/articles/10169521-projects-in-chatgpt
- https://help.openai.com/es-419/articles/11487775-connected-apps-in-chatgpt

**Decisiones pendientes:** horario concreto, continuidad en fines de semana, cupo/orden de auditoría con muchos repositorios, registro privado, identidad distinguible de la app GitHub conectada, política ante aprobación pendiente.
