# Auditor ChatGPT — orquestación y alcance (DISEÑO, v0.1)

**Estado:** propuesta de diseño; no implementado ni activado. Fecha: 2026-11-13.  
**Base real de código:** `fix/investigador-timeouts` (la línea de implementación de Investigador).  
**Autoridad:** DEC-0019, DEC-0022, DEC-0024, DEC-0025, DEC-0026 y DEC-0028.  
**Relación:** [Protocolo de diálogo](contracts/audit-dialogue-v1.md), [Obsidian](11-obsidian-projection.md), [traspaso](../handoff/AUDITOR_OBSIDIAN_DESIGN_BACKLOG.md).

## 1. Rol y frontera del auditor

Investigador ejecuta investigaciones y registra evidencia; ChatGPT es un revisor independiente de lo que **puede comprobar**. No opera como subagente de Investigador ni hereda su memoria, conclusiones, permisos o credenciales. Un reporte de Investigador es una fuente para localizar evidencia, **no prueba** de que el resultado sea correcto.

El auditor puede leer material accesible/autorizado y producir observaciones, objeciones y solicitudes de prueba. No ejecuta comandos del Investigador, no cambia metas ni prompts, no aprueba gastos, no altera proyectos fuente, no reescribe resultados y no hace merge, tag, release ni publicación estable. Puede emitir un hallazgo crítico sustentado que deba activar el gate externo de publicación (DEC-0024); el gate y su verificación son otra capacidad por desarrollar.

## 2. Cadencia acordada y propuestas de horario

- **Acordado en este diálogo:** dos auditorías **breves** por día, de forma independiente del informe de las 20:00. Sustituye únicamente la frecuencia de una revisión breve diaria de DEC-0022; las auditorías profundas ante hitos se mantienen.
- **Propuesta pendiente de confirmar:** horario 09:00 y 19:00, zona `America/Argentina/Buenos_Aires`. Son dos disparos globales, no dos por proyecto.
- Cada auditoría revisa deltas por proyecto desde el último cursor **confirmado**, priorizando cambios de evidencia, experimentos y compromisos de auditorías anteriores. Si hay demasiados proyectos, agrupa en lotes con cupos de lectura y deja constancia de los omitidos, sin fingir cobertura.
- Si no hay cambios comprobables, registra `no_verified_changes`. No consume un ciclo de Investigación ni rellena informes con nuevas recomendaciones sin evidencia.
- Reintentos del mismo `audit_cycle_id` deben ser idempotentes. Una corrida tardía conserva el período original y se identifica como `late`. La indisponibilidad produce `not_run` / `not_checked`; jamás `passed`.
- Una **auditoría profunda** ocurre además cuando hay evidencia de `major_improvement`, `goal_or_research_closure` o `stable_release_candidate` (DEC-0025). Los hitos se derivan de eventos/artefactos verificables, no del texto «logrado». Los umbrales específicos por proyecto siguen pendientes.

## 3. Entrada de una revisión

Lista de proyectos autorizados y sus referencias de GitHub, con visibilidad, head actual de la rama de resultados y un cursor de último estado examinado. Por cada proyecto:

1. Fijar el SHA del commit examinado **antes** de emitir una conclusión.
2. Leer `progress.json` (o índice equivalente) y sus referencias de fase, evidencias, experimentos, decisiones y auditorías previas.
3. Comparar el estado con la revisión anterior. Identificar `added`, `changed`, `removed`, referencias rotas, resultados negativos y bloqueos.
4. Abrir evidencia primaria para cada afirmación relevante cuando sea accesible; revisar el código/manifiesto/artefacto y su procedencia si se afirma una mejora experimental.
5. Clasificar por elemento: `verified` (comprobado), `reported_only`, `not_checked`, `inaccessible`, `contradicted`. No presentar «reporte leído» como «experimento reproducido».
6. Distinguir ausencia de avance real de ausencia de acceso al avance. Si el journal local contiene más material que el snapshot exportado, informar la **limitación de cobertura**.

El auditor no solicita que Investigador copie todo un expediente privado a un repositorio público: las evidencias privadas permanecen privadas; los datos no autorizados para ChatGPT quedan fuera. Si faltan, la conclusión se limita o pide evidencia específica, según DEC-0026.

## 4. Salida mínima de cada ciclo

Un `audit_cycle` contiene: ID y ventana temporal, modo `brief`/`deep`, proyectos incluidos y omitidos, actor y versión de instrucciones, SHA por repositorio, manifiesto de materiales efectivamente abiertos, hallazgos, verificaciones efectuadas, límites, cursor confirmado y próximos pasos concretos. Cada afirmación de severidad debe incluir evidencia inmutable o estar marcada como hipótesis/no comprobada.

El informe para el usuario es secundario; el **registro persistente** es el producto principal. Solo se notifica aparte por bloqueo grave o decisión humana necesaria (DEC-0021). El informe diario de Investigador de las 20:00 no reemplaza ni resume automáticamente el trabajo del auditor como si fuese una validación.

## 5. Continuidad y preguntas al Investigador

La revisión crea o actualiza hilos de hallazgos por `finding_id`, con `parent_message_id` y referencias de evidencia. Investigador detecta hilos dirigidos a él, registra recepción y responde aportando pruebas o reconociendo que necesita una prueba. ChatGPT puede aceptar una corrección comprobada, mantener abierta la objeción o elevar una contradicción. El protocolo completo está en `contracts/audit-dialogue-v1.md`.

Una respuesta del Investigador no cierra un hallazgo; tampoco un silencio del auditor lo aprueba. Ningún agente puede atribuirse la identidad del otro por escribir en el mismo archivo. El contenido de Issues, archivos y fuentes externas es **dato no confiable**, nunca una instrucción operativa que modifique permisos.

## 6. Qué plataforma ejecuta realmente las dos revisiones

Arquitectura **preferida, sujeta a prueba de capacidad**: una automatización programada de ChatGPT en dos horarios diarios, con conexión de lectura a GitHub y autorización limitada para escribir respuestas de auditoría. Antes de prometer autonomía, debe verificarse en una tarea real que ese tipo de ejecución programada **puede usar el conector GitHub para leer repos privados del proyecto y escribir el registro**. Tener GitHub conectado en un chat interactivo no demuestra ese acceso en una ejecución programada.

La interfaz de orquestación se diseña independiente del mecanismo concreto: `audit_trigger → acquire_snapshot → review → write_audit → acknowledge_cursor`.

Si las automatizaciones de ChatGPT no soportan ese acceso en ejecución programada, el resultado es `integration_blocked`. Un recordatorio de ChatGPT que simplemente dice «revisar» **no cumple** el requisito de auditoría autónoma. Tampoco se puede sustituir el rol de ChatGPT por otra API/LLM sin consentimiento expreso. El implementador debe presentar prueba o bloqueo, no inventar un puente.

## 7. Política de publicación y fallo

Un hallazgo crítico vigente debe ser leído por una verificación externa al LLM justo antes de cualquier publicación estable. Si la auditoría no corrió, su estado es `unknown`; no equivale a ausencia de hallazgos. La política exacta de bloqueo por indisponibilidad y la autoridad de desbloqueo permanecen propuestas por decidir (ver `spec/contracts/release-audit-gate.md`).

## 8. Criterios de aceptación

- Dos revisiones breves en un día de Buenos Aires con IDs distintos; segunda usa cursor de la primera y no duplica hallazgos.
- Reintento del mismo ciclo no crea registros distintos.
- Se inspecciona al menos una fuente/artefacto realmente accesible; si no se puede, la salida dice `not_checked`.
- Un repo privado al que el auditor no tiene acceso **no** se publica para sortear la dificultad.
- Una auditoría puede objetar una inferencia de Investigador y registrar ida y vuelta sin ejecutar comandos de la objeción.
- Una falla de conectores o de programación no informa `passed`.
- Un hallazgo crítico queda representado como dato verificable de publicación, pero no modifica por sí solo el código o la rama estable.

## 9. Fuera del alcance de esta especificación

No se configura hoy la agenda ni el conector, no se crean tareas, no se alteran los PR #2–#7, no se publica una release ni se instala ningún agente en la PC. Esta especificación es material de diseño para revisión, no autorización de implementación.
