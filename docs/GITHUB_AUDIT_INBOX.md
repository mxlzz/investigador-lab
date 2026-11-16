# Auditoría ChatGPT mediante comentarios GitHub

## Decisión y alcance instalado — 2026-11-16

El usuario autoriza que ChatGPT use la cuenta GitHub `mxlzz` como auditor y que el Investigador reciba sus comentarios. No se crea otra cuenta. Buzón inicial: https://github.com/mxlzz/investigador-lab/issues/12 . La recepción de comentarios no ejecuta ChatGPT automáticamente ni configura revisiones periódicas. Se mantiene el diseño amplio de PR #8 como trabajo pendiente: no se fusiona ni se habilitan cierres automáticos, Obsidian o releases.

Esta primera integración usa un issue central con identificador explícito de proyecto. `audit-inboxes.json` admite varios buzones, incluidos issues privados por investigación, sin cambiar el protocolo. No publicar en el buzón público pedidos, resultados o datos privados. El Investigador solo lee el buzón: sus evaluaciones se guardan localmente y se incluyen en el snapshot de resultados del proyecto, sin respuestas automáticas en GitHub.

## Identidad y confianza

Se comprueba el ID numérico **y** login del autor contra la configuración local, además del formato. No basta un nombre visible o una etiqueta en el texto. Ambos agentes usan la misma cuenta: esto no demuestra independencia del auditor ni aprobación humana. `independence_verified` permanece `false`; no se convierte el comentario en el registro legacy `audit` que exige independencia. Las revisiones son evidencia externa no confiable: no autorizan comandos, herramientas, permisos, gastos ni nuevas metas. No hay tokens en este archivo ni en el buzón.

## Formato de comentario

El comentario completo debe comenzar con el marcador y contener únicamente el JSON (con o sin bloque json):

````markdown
<!-- investigador-audit:v1 -->
```json
{
  "project": "identificador-del-proyecto",
  "audit_id": "AUD-0042",
  "audited_commit": "0123456789abcdef0123456789abcdef01234567",
  "findings": [{
    "id": "F-1",
    "severity": "high",
    "status": "open",
    "claim": "Problema observado",
    "evidence": ["URL o referencia verificable al material revisado"],
    "recommendation": "Comprobación o corrección solicitada"
  }]
}
```
````

Severidades: `critical`, `high`, `medium`, `low`, `info`. Estados: `open`, `resolved`. Cada hallazgo necesita evidencia, también para resoluciones. El commit es un SHA completo; el receptor conserva la referencia pero no certifica por sí mismo que respalde la afirmación. El Investigador debe contrastar el commit y materiales con su estado actual. Un hallazgo sobre una versión vieja no prueba un defecto vigente.

Para proponer resolución, el auditor publica un comentario o edita el anterior con el mismo `audit_id` e `id`, `status=resolved` y evidencia de la corrección. Ese comentario sigue siendo una afirmación a contrastar. La misma identidad GitHub no puede otorgar aprobación independiente ni humana para publicar. El gate de release permanece siempre cerrado sin autorización humana externa.

## Recepción y evaluación

1. Cada tick, antes de reclamar trabajo, consulta los buzones configurados. Si hay un worker vigente no lanza otro. No añade cron ni incrementa el límite de 24 turnos diarios.
2. Lee todas las páginas de comentarios (hasta 2.000; una lectura mayor se declara incompleta), valida autor, formato y proyecto exacto. No sigue URLs del comentario ni ejecuta su contenido.
3. Registra `github_audit_comment` con URL, autor, commit, versión y contenido estructurado en el journal del proyecto. Cada revisión tiene clave determinista. Relecturas no duplican y ediciones crean revisiones nuevas. Una eliminación o comentario inválido no borra hallazgos previos.
4. En proyectos habilitados, `audit_review` tiene prioridad sobre el siguiente paso y utiliza la misma sesión por proyecto. Cada turno evalúa hasta 20 revisiones. Proyectos pausados permanecen pausados.
5. El host valida decisiones `accepted`, `disputed`, `needs_clarification`, fundamentos y referencias a eventos existentes. Solo `accepted` puede solicitar una fase documental de la lista admitida, dentro del pedido original. No admite comandos o auto-resolución. Queda registrado como `github_audit_review`; el planificador retoma fases admitidas con sus contratos habituales.
6. Una corrección propuesta no cierra un crítico. El estado vigente se ordena por actualización GitHub e ID del comentario; una revisión antigua descubierta después no pisa una resolución más reciente. Críticos abiertos bloquean release, sin impedir investigar su solución.

`audit_poll(project)` permite consulta manual por MCP; `audit_status(project)` muestra pendientes, hallazgos y último resultado de recepción. `prepare` refresca los comentarios y los sobres incluyen `audit_feedback`. `health` anuncia recepción de auditoría y conserva `independent_auditor=false`.

Fallos de permisos/red/paginación quedan como `blocked` en `research-state/audit-poll.json`, nunca como ausencia de hallazgos. Comentarios marcados pero inválidos producen `needs_attention`. La recepción no consume llamadas al modelo y los errores del buzón no cuentan como fallos científicos del proyecto. No se instala un auditor autónomo ni se garantiza revisión con la PC apagada.

## Instalación y permisos

El receptor solo hace GET. Los buzones declarados `public=true` se consultan sin credenciales, verificando previamente que el repositorio siga siendo público. No es un fallback de autenticación: los buzones privados o sin esa opción reutilizan la identidad administrada System GitHub de OpenClaw. Issues Read basta para buzones privados autorizados. No ampliar ni exponer el token si GitHub devuelve 403: registrar el bloqueo y ajustar la conexión por la vía habitual. El archivo local `audit-inboxes.json` fija repositorio, issue y autores; el modelo no tiene una operación para modificar esa configuración.

Se conserva la corrección de sesiones: una clave estable por proyecto, con IDs separados por ejecución en logs/journal. No se borran chats o expedientes y no cambian modelos, presupuestos o workflows.

## Validación

Pruebas: formato y evidencia, identidad por ID/login, routing por proyecto, paginación completa, reanudación y deduplicación, ediciones fuera de orden, eliminación, fallos 403/red, rechazo de acciones arbitrarias y referencias inventadas, bloqueo crítico, cola documental, pausas y cuota. El transporte real se valida en un expediente temporal, sin ejecutar investigación científica o experimentos.

Aceptación local: 96 pruebas aprobadas. Transporte HTTPS real al comentario https://github.com/mxlzz/investigador-lab/issues/12#issuecomment-6906358921 : primera lectura importa una revisión, segunda importa cero; autor `mxlzz` / ID 107159356 verificado. Expediente temporal `audit-transport-check`; no se invocó un modelo ni se agregó una investigación real. El comentario es explícitamente una prueba de transporte, no un hallazgo científico.

La identidad administrada no pudo validarse desde la sesión de despliegue. La aceptación real corresponde al buzón público configurado sin credenciales; no acredita acceso a buzones privados ni el funcionamiento actual del token para otras operaciones. No se modificaron perfiles, ACL o claves.
