# Contrato de diálogo Investigador ↔ Auditor (PROPUESTA v0.1)

**Estado:** diseño, no conectado al motor. Los nombres son un contrato propuesto, no herramientas disponibles.  
**Objetivo:** intercambiar objeciones verificables y respuestas sin transformar el historial en un chat libre sin estado.

## 1. Canal de transporte y fuente de verdad

**Un único envelope propuesto:** el contrato `investigador-audit/1` es común al protocolo de diálogo y al transporte por Issue. El prefijo de hallazgo auditor será `AUD-FIND-`, separado de `FND-` (hallazgo científico en `spec/05-knowledge.md`). Las dos especificaciones no deben generar formatos incompatibles: esta define significado/estados, `github-audit-inbox-v1.md` define lectura y envío por GitHub. Los ejemplos son parciales y no sustituyen el JSON Schema definitivo.

El **expediente de investigación** permanece en el journal local del motor, con exportaciones versionadas en el repositorio privado/permitido de cada proyecto. El **expediente de auditoría** es otra secuencia persistente, separada, con eventos firmemente asociados a `project_id`, actor, fecha, `commit_sha` y hashes de adjuntos.

**Transporte preferido para v1:** un Issue de auditoría por proyecto con comentarios estructurados y lectura por API (`github-audit-inbox-v1.md`). La persistencia canónica de auditorías y estados seguirá siendo estructurada e independiente de esos comentarios. La ruta física de su respaldo/índice en GitHub sigue a definir tras prueba real de permisos; no abrir un segundo canal alternativo sin motivo. Si la conexión ChatGPT solo permite comentarios, adaptar el transporte sin alterar el contrato lógico. La ubicación definitiva, compatibilidad con el branch privado de resultados y permisos necesitan una prueba de implementación.

Los eventos son **append-only**, con IDs únicos y punteros a eventos anteriores. Las vistas de estado se derivan de los eventos; no se edita un hallazgo histórico para fingir que nunca existió. Un commit mutable de GitHub no es una firma criptográfica: la identidad del autor debe obtenerse de un actor autenticado y permisos separados, no de un campo `actor` arbitrario.

## 2. Envelope por mensaje

Cada mensaje tiene al menos estos campos, con tipos que se congelarán en un JSON Schema durante la siguiente iteración de diseño:

| Campo | Significado |
| --- | --- |
| `schema_version` | `investigador-audit/1` (envelope compartido del canal) |
| `message_id`, `thread_id`, `parent_message_id` | Correlación e idempotencia; parent puede ser null |
| `audit_cycle_id`, `project_id` | Origen y proyecto |
| `kind` | `finding_opened`, `acknowledged`, `evidence_submitted`, `finding_contested`, `additional_check_requested`, `finding_reassessed`, `finding_resolved`, `escalated` |
| `actor` | Identidad autenticada `auditor_chatgpt` / `investigador` / `human` |
| `created_at` | ISO-8601 UTC |
| `subject` | Objeto auditable (fase, afirmación, experimento, release) e ID |
| `snapshot` | Repositorio, rama, SHA completo, archivos y hashes realmente examinados |
| `evidence_refs` | Referencias concretas, localizadores, nivel de verificación y accesibilidad |
| `finding_id` | ID persistente de la discrepancia; null en mensajes generales |
| `assertion`, `reasoning_summary` | Qué sostiene y en qué comprobación se apoya, en lenguaje verificable |
| `severity` | `critical` / `major` / `minor` / `note` para hallazgos |
| `request` | Prueba/corrección solicitada, verificable y acotada; nunca comandos con autoridad implícita |
| `limitations` | Qué no se pudo leer o reproducir |

Ejemplo de hallazgo: «el informe afirma mejorar el baseline un 8 %, pero el artefacto del run X calcula un 1,3 % con la métrica publicada». El auditor adjunta SHA, run ID, datos/resultado efectivamente inspeccionados y modo `recomputed` o `read_only`.

## 3. Máquina de estados por finding

`open → acknowledged → investigation_in_progress → response_submitted → under_reassessment → resolved`

Ramas: `contested`, `waiting_for_evidence`, `blocked_external`, `escalated_to_human`, `superseded_by_new_evidence`.

- Solo **Auditor** abre un hallazgo de auditoría, propone severidad y emite la reevaluación de sus propias comprobaciones.
- Investigador reconoce recepción y responde con un nuevo commit/evidencia o con una refutación fundamentada. Puede proponer `resolved`, pero no adjudicárselo.
- Solo el actor autorizado para revisión puede emitir `finding_resolved` y únicamente tras verificar la corrección o demostrar que el señalamiento era incorrecto. La autoridad final para levantar un bloqueo **crítico y disputado** no está acordada; se mantiene `escalated_to_human` y el gate no presume desbloqueo.
- No hay obligación de aceptar objeciones incorrectas: debe quedar registrada la disputa y la prueba discriminante.
- Para evitar intercambios infinitos, ante dos respuestas de fondo sin evidencia nueva se marca `stalled` y se solicita una prueba discriminante o criterio humano; no se cierra ni se bloquea por silencio todo el proceso de investigación.
- Reintentos de un `message_id` no generan otro evento, y se comprueba que `parent_message_id` exista en el mismo hilo.
- Un hallazgo vinculado a commit A no se considera automáticamente resuelto porque ya exista commit B; el nuevo código debe ser examinado.

## 4. Ciclo de ida y vuelta (ejemplo)

1. Auditor abre `finding_opened`: observación, gravedad, evidencia, commit y solicitud verificable.
2. Investigador recibe `finding_id` y registra `acknowledged` sin necesidad de una llamada adicional al modelo cuando puede hacerlo el motor.
3. Investigador responde `evidence_submitted` o `finding_contested` con hashes y alcance real de la nueva comprobación.
4. Auditor reexamina las referencias. Responde `finding_resolved`, `additional_check_requested` o `escalated`; registra qué cambió su evaluación.
5. El motor conserva ambos expedientes y sincroniza la proyección de estado para Obsidian. El reportero solo refleja estados comprobados, no convierte objeciones en decisiones de código.

## 5. No confundir auditoría y revisión de implementación

- Auditoría puede decir «falta una prueba de regresión que demuestre el comportamiento X».
- No puede introducir una nueva meta o modificar el criterio original de aceptación.
- No puede aceptar un release ni resolver un bloqueo crítico por simple texto.
- El diálogo debe mantenerse por proyecto para no filtrar evidencias entre repositorios de visibilidad distinta.

## 6. Casos de aceptación obligatorios

A01: auditor cuestiona una métrica con evidencia y el Investigador aporta un run distinto; se conservan ambos y no se reescribe el primero.  
A02: auditor no accede a un repo privado; resultado `inaccessible`, sin publicar el repo ni dar por pasada la auditoría.  
A03: un mensaje malicioso en una fuente o Issue pide ejecutar comandos; se trata como texto no confiable, sin acciones.  
A04: el mismo mensaje llega dos veces; un solo evento y una sola respuesta confirmada.  
A05: se corrige código después del hallazgo; el auditor fija el nuevo SHA antes de cerrar.  
A06: disputa crítica sin cierre autorizado; publicación estable bloqueada, investigación ordinaria permitida.  
A07: auditor desconectado; Investigador sigue dentro de permisos, registra `audit_unavailable` y no afirma `audit_passed`.  
A08: dos ciclos de auditoría encuentran el mismo problema; reutilizan `finding_id` en vez de duplicarlo.

## 7. Decisiones por cerrar antes de implementación

- Persistencia canónica y permisos de auditoría: Issue por proyecto **propuesto** como transporte, destino versionado de los estados todavía pendiente, con autores diferenciables.
- Nivel real de autorización para comentarios y archivos desde una tarea programada ChatGPT.
- Política exacta de aprobación y desbloqueo crítico disputado (DEC-0024).
- Retención y visibilidad de adjuntos privados, y representación de evidencia local no exportable.
- Versión definitiva de JSON Schema, catálogo de errores y migración de estados.


## Canal Github Issues definido en propuesta posterior

La interfaz de transporte preferida es un **Issue de auditoría por proyecto** y comentarios estructurados, con polling sin LLM cada 15 minutos, correlación, validación de actor, journal y reintento idempotente. Ver `github-audit-inbox-v1.md`. Los tipos propuestos se amplían con `closure_proposed`, `closure_accepted`, `closure_contested`, `closure_deferred` y `closure_reassessed`, sujetos a `research-closure-v1.md`.

Un comentario de cierre no pausa ni archiva un proyecto automáticamente. El cierre requiere contraste de evidencias, registro de estado, sincronización y suspensión únicamente del proyecto. Un desacuerdo entre ambos agentes se intenta resolver con nuevas comprobaciones antes de escalar al usuario; el número de rondas sigue propuesto, no aprobado.

**Límite de seguridad:** si el comentario del Auditor y el del Investigador aparecen publicados por el mismo usuario GitHub, no existe prueba de identidad diferenciada con el mero campo `user.login`. Hasta resolverlo, no debe otorgarse autoridad de bloqueo ni de cierre automático a un texto que reclama ser auditor.
