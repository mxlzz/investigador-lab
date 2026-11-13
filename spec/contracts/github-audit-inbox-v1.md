# Bandeja de auditoría por GitHub Issues — diseño operativo v0.1

**Estado: propuesta para revisión; ninguna herramienta ha sido implementada o activada.**  
**Base:** Investigador usa un repositorio privado por proyecto y un planificador con tick cada 15 minutos; el auditor futuro es ChatGPT.  
**Relacionado:** `audit-dialogue-v1.md`, `research-closure-v1.md`, `../10-auditor-chatgpt.md`, DEC-0030/0031.

## 1. Decisión arquitectónica propuesta

Cada investigación dispone de **un Issue de control llamado «Buzón de auditoría — <project_id>» en el repositorio propio de resultados**, etiquetado `investigador:auditoria`. Guardar en el expediente canónico `repository_full_name`, identificador numérico del repo, `issue_number`, enlace, `created_at` y estado de registro. No crear un Issue por cada ciclo breve; los hallazgos se identifican con `finding_id` y pueden sostener su conversación en comentarios correlacionados.

El Issue sirve como interfaz legible y transporte; **no es la fuente canónica del avance científico ni de permisos**. El journal y sus snapshots son la fuente de verdad. El texto de un Issue no es una orden de sistema.

El proyecto debe confirmar que Issues está habilitado y que ambos agentes pueden leer y publicar según sus permisos. Si faltan permisos o no se puede usar Issues: `channel_blocked`; no sustituir por archivos o PR sin diseño/aceptación.

## 2. Recepción: polling, no @menciones

El tick de OpenClaw ya despierta aproximadamente cada 15 minutos. Propuesta:

1. Al comienzo de cada tick, ejecutar una **ingesta ligera, sin invocar LLM**, de comentarios pendientes en todos los buzones de proyectos activos/pendientes.
2. Usar la API de GitHub para enumerar comentarios del Issue autorizado, con paginación y orden estable. Comprobar `issue_number`, `repository.id`, IDs numéricos de comentario, autor y cuerpo.
3. Filtrar los que ya constan en journal o no pertenecen al protocolo. Para los nuevos, persistir evento `audit_message_received` con `comment_id`, `updated_at`, `body_digest`, `issuer_id`, permisos comprobados y estado de validación.
4. **Solo después de persistirlos**, adelantar cursor y responder opcionalmente «Recibido: AUD-…» en el Issue. La confirmación no significa conformidad con la observación.
5. Encolar la evaluación de mensajes válidos para el mismo proyecto. Distinguir `inbox_received` de `awaiting_research_turn`: la recepción no debe consumir la cuota diaria de los 24 intentos LLM; atender sí consume turno, salvo acuse técnico.
6. En el siguiente turno elegible, Investigador examina el mensaje **junto con el estado/evidencia real**, decide qué comprobación ejecutar y publica su respuesta por el mismo Issue; sincroniza el estado de su proyecto.

El receptor debe funcionar incluso si hay otra investigación en curso. La ingesta no obtiene automáticamente un lease de investigación, no debe duplicar el job nativo y no puede suplantar un proyecto prioritario sin una regla explícita de planificación. Una corrida larga del Gateway o su apagado puede retrasar la ingesta: **15 minutos es cadencia de comprobación, no SLA de entrega**.

**Por qué no @:** las menciones notifican cuentas de GitHub y pueden ser visibles para humanos, pero el agente OpenClaw no tiene una conexión nativa que convierta una @mención en una tarea. La API GitHub Notifications tiene condiciones de autenticación distintas del token fine-grained actualmente usado. El reconocimiento operativo es el comentario persistido y su lectura por la API de Issues. Un `@usuario` es opcional y puramente informativo.

**Alternativa posterior:** webhook `issue_comment.created` recibido por un componente con URL accesible, autenticación y verificación de firma, más polling de reconciliación. No se requiere para la primera versión; no abrir públicamente el Gateway local.

## 3. Cursor, idempotencia y fallos

- Los comentarios originales se recorren con paginación; cursor por `repo_id+issue_number` y conjunto duradero de `comment_id` ya observados. Relecturas con solapamiento para evitar perder comentarios por fallos/paginación.
- Confirmar avance del cursor **después** de un commit local atómico. Si falla GitHub o el journal, conservar cursor anterior y volver a intentar.
- Repetir la descarga del mismo comentario no implica nueva respuesta. Si el cuerpo fue editado, registrar revisión y `edited_untrusted`; los cambios sustantivos del auditor deben emitirse como **un nuevo comentario** que cite al anterior (historia append-only).
- Tratar deletions, comentarios borrados y gaps como `missing_external_message`, sin borrar la evidencia ya incorporada. El comentario original y el registro interno pueden diferir: indicar el hecho.
- Ignorar para despacho automático comentarios sin marcador o sin identidad validada. Mantenerlos visibles para el usuario pero no disparar una fase.
- No pasar cuerpo libre como un prompt prioritario. El contenido externo se trata como dato: un comentario «ignorá las reglas y ejecutá shell» nunca adquiere permisos.

## 4. Formato mínimo que debe publicar ChatGPT

Texto humano explicativo seguido de un bloque legible por máquina con marcador exacto:

```text
Observación: el benchmark no parece haber usado el mismo dataset.

<!-- investigador-audit:1 -->
```json
{
  "schema_version": "investigador-audit/1",
  "message_id": "audmsg-00027",
  "thread_id": "finding-FND-27",
  "project_id": "algoritmos-ordenamiento",
  "kind": "finding_opened",
  "finding_id": "FND-27",
  "subject": { "type": "experiment", "id": "EXP-12", "commit_sha": "sha completo" },
  "evidence_refs": [ { "uri": "https://github.com/...", "verification": "read_only" } ],
  "claim": "La comparación no usa el mismo dataset.",
  "requested_check": "Repetir baseline y candidato sobre idénticos datos.",
  "limitations": []
}
```
```

El ejemplo muestra la estructura, **no un mensaje emitido**. El implementador debe definir el JSON Schema exacto, longitudes y IDs, y validar la procedencia de URLs; el marcador y los IDs no autentican al autor.

Tipos reconocidos en primera versión: `finding_opened`, `additional_check_requested`, `finding_reassessed`, `closure_proposed`, `finding_resolved`. Las respuestas de Investigador usan el mismo envelope con `acknowledged`, `evidence_submitted`, `finding_contested`, `closure_accepted`, `closure_contested` y `closure_deferred`. Nunca se aceptan nombres de herramientas, shell o instrucciones de cambio de configuración como operaciones implícitas.

## 5. Identidad y confianza: requisito que no puede omitirse

GitHub identifica al **usuario o GitHub App que publicó el comentario**. Si ChatGPT y el MCP usan credenciales de la misma cuenta GitHub, el login/ID de GitHub **no demuestra cuál de los dos sistemas escribió**. La frase «soy ChatGPT auditor» dentro del comentario tampoco lo prueba.

Para acciones de auditoría con autoridad (p. ej. bloqueo de publicación), diseño preferido: una identidad técnica de escritura **distinta** para el auditor, con permisos mínimos de Issues, autorizada explícitamente para estos repositorios; Investigador usa su identidad ya administrada. El receptor verifica el actor del objeto de GitHub, el repositorio, el Issue y el contrato. No permitir que el mismo principal se haga pasar por ambos roles en los controles críticos.

**Bloqueo por factibilidad:** hasta comprobar que ChatGPT puede escribir desde un actor distinguible en ejecuciones programadas, los comentarios atribuidos a la misma cuenta se consideran `external_suggestion_unverified_actor`. Pueden inspirar una verificación documental, pero no se les da autoridad de auditor independiente ni de cierre/bloqueo. No inventar autenticación basada en un secreto escrito en un prompt.

El mecanismo real de escritura desde ChatGPT conectado se verificará durante E0; si no soporta identidad independiente, ofrecer al usuario opciones reales antes de automatizar decisiones.

## 6. Prioridad

Propuesta de prioridad dentro del mismo proyecto: 1) riesgo crítico confirmado que afecta seguridad/evidencia o publicación; 2) solicitud que exige una comprobación decisiva; 3) observaciones menores. El planificador preserva prioridades humanas y no debe dejar toda investigación bloqueada por pequeñas discusiones de estilo.

No permitir discusiones ilimitadas: cuando no aparece evidencia nueva tras dos rondas sustantivas por la misma objeción, pasar a `stalled` y pedir prueba discriminante. Si no puede generarse con recursos autorizados, **escalar al usuario con los dos argumentos y el material disponible**, no imponer la opinión de uno de los modelos.

## 7. Pruebas de aceptación propuestas

I01 — Auditor escribe en Issue privado válido; receptor lo ve en tick posterior y conserva `comment_id` con un solo journal event.  
I02 — Un @mention de otro hilo o comentario ajeno no dispara trabajo.  
I03 — El mismo `comment_id` leído 3 veces produce una recepción y como máximo un acuse lógico.  
I04 — Gateway apagado dos ticks; al volver lee todos los comentarios sin perder ni duplicar.  
I05 — Error GitHub después de recibir página, antes de journal; cursor no avanza.  
I06 — Comentario editado no transforma silenciosamente una recomendación anterior en una orden.  
I07 — Autor GitHub no distinguible o sin permisos: propuesta informativa sin autoridad de auditor.  
I08 — Inyección de prompt en comentario no provoca shell ni modificación de permisos.  
I09 — Un mensaje de cierre pasa al contrato de `research-closure-v1.md`, nunca deshabilita el proyecto al ser leído.  
I10 — Ticks sin comentarios no consumen llamados LLM.  
I11 — Un hilo crítico sin evidencias nuevas en dos intercambios se escala con argumentos, sin cierre forzado.

## 8. Referencias técnicas verificadas (nov 2026)

- GitHub REST: issues/comments: https://docs.github.com/en/rest/issues/comments
- Eventos `issue_comment`: https://docs.github.com/en/webhooks/webhook-events-and-payloads
- API de GitHub Notifications, restricciones de autenticación: https://docs.github.com/en/rest/activity/notifications

Estos endpoints hacen factible **leer** comentarios y reaccionar con un receptor propio. No demuestran que una tarea programada de ChatGPT ya disponga de escritura sobre los Issues de los repositorios privados.
