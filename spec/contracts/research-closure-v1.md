# Propuesta de cierre de investigación desde el Auditor — diseño v0.1

**Estado: propuesta no implementada.** El cierre por `goal_met` requiere resolver la discrepancia existente entre DEC-0007 (menciona disponer de versión estable) y DEC-0019 (permite declarar cumplimiento antes de publicar versión estable). Este documento no resuelve esa autoridad por su cuenta. El campo `schema_version` comparte el envelope `investigador-audit/1` del protocolo de comentarios; el ejemplo omite campos para legibilidad y no es un JSON Schema completo. Aplica al diálogo en `github-audit-inbox-v1.md` y al protocolo `audit-dialogue-v1.md`.  
**Principio acordado:** primero intentar resolver desacuerdos entre Investigador y Auditor usando evidencia; solo escalar al usuario cuando no logren resolverlos. El usuario no debe ser consultado automáticamente por cada duda.

## 1. ¿Puede un comentario del Auditor pedir cerrar una investigación?

**Sí.** Se propone el mensaje estructurado `kind: "closure_proposed"`. Es una **propuesta auditable**, no un comando de interrupción.

Ejemplo humano:
> «La meta declarada parece cumplida: el resultado en EXP-48 supera el baseline definido y la aceptación técnica del commit X pasó. Propongo cerrar esta investigación como goal_met, con las limitaciones indicadas.»

Ejemplo de campos del bloque formal:

```json
{
  "schema_version": "investigador-audit/1",
  "message_id": "audmsg-0028",
  "project_id": "algoritmos-ordenamiento",
  "kind": "closure_proposed",
  "closure": {
    "outcome": "goal_met",
    "target_project_revision": "sha del snapshot exacto",
    "criteria_refs": ["CRIT-01", "CRIT-02"],
    "evidence_refs": ["EXP-48", "TEST-91"],
    "rationale": "Todos los criterios comprobables de aceptación están satisfechos.",
    "known_limits": ["Comparación restringida al conjunto de datos declarado"]
  }
}
```

`outcome` es uno de:

| Resultado | Qué significa | Regla |
| --- | --- | --- |
| `goal_met` | La meta está cumplida conforme a criterios explícitos y pruebas | Cierre autónomo posible si el Investigador comprueba criterios y no hay contradicción crítica relevante |
| `research_concluded` | Una exploración o estudio llega a una conclusión justificada, incluso negativa | Cierre autónomo posible con cobertura y límites documentados; no fingir logro |
| `no_viable_path` | No hay continuidad técnica defendible dentro de recursos/alcance actuales | **Proponer pausa fundamentada**, no declarar logro ni archivar como terminado sin justificación adicional |
| `out_of_scope` | El trabajo excede el encargo | Corregir el alcance o descartar esa tarea; no cerrar toda la investigación por una desviación puntual |

La palabra `close`, una @mención, el título de un Issue o la etiqueta `closed` de GitHub **no son por sí solos instrucciones del motor**.

## 2. Proceso exacto propuesto

1. **Recepción:** la bandeja valida el comentario, su actor y `project_id`. Registra `closure_request_received`, sin cambiar el estado del proyecto.
2. **Inspección propia:** Investigador obtiene el estado actual, los criterios aprobados, runs, evidencia, hallazgos críticos y trabajos pendientes. Comprueba si el comentario se refiere al snapshot vigente o a uno obsoleto.
3. **Respuesta autónoma:** si concuerda con evidencia comprobable, registra `closure_accepted` y arma un expediente de cierre; si no, `closure_contested` con contraevidencia; si requiere resultado pendiente, `closure_deferred` con la dependencia exacta. No acepta por deferencia al Auditor.
4. **Revisión del Auditor:** revisa la respuesta y la evidencia nueva. Si hay acuerdo, puede emitir `closure_reassessed` / `finding_resolved`. Si hay desacuerdo, pide una **prueba concreta** y ambos intentan resolverlo antes de escalar.
5. **Sin acuerdo tras dos rondas sustantivas:** si no hay evidencia discriminante disponible o la prueba requeriría permisos nuevos, registrar `closure_disputed` y elevar al usuario con: propuesta inicial, postura de Investigador, evidencia a favor/en contra, qué impediría decidir y alternativas. No decidir por inercia ni repetir prompts vacíos.
6. **Finalización:** la investigación solo queda `closed` cuando el motor ha confirmado la causa de cierre, generado un resumen final, guardado el checkpoint y comprobado la sincronización del expediente de cierre. Si la sincronización falla: `closing_sync_pending`, reintento posterior; no anunciar «cerrada y archivada».
7. **Suspensión programada:** al registrar `closed`, deshabilitar **solo el proyecto** en su scheduler; mantener el job global, el resto de proyectos y su historial. No borrar Issues, repositorios, datos ni experimentos. Registrar vínculo de auditoría y causa.
8. **Comunicación:** informar al usuario en el resumen de progreso disponible y mediante un aviso importante cuando proceda; un cierre no equivale a autorización de release ni a publicación estable.

El estado `closed` es administrativo y científico; no equivale al estado `closed` del Issue GitHub, que es una interfaz conversacional. Se puede mantener el Issue disponible para reapertura o auditorías históricas.

## 3. Restricciones que preserva

- DEC-0019: Investigador puede declarar autónomamente **meta cumplida** cuando satisface criterios verificables; sigue sin permiso para publicar releases estables.
- DEC-0024: un hallazgo crítico que invalida la evidencia necesaria impide afirmar `goal_met` hasta resolverlo; el gate de publicación estable conserva bloqueo independiente.
- Una exploración abierta sin criterios definidos no se cierra simplemente porque el auditor considere aburrida la investigación. Puede declarar una conclusión parcial con límites y proponer pausa, o pedir especificación.
- `no_viable_path` genera revisión de alternativas y posible pausa, no un «fracaso definitivo» inventado.
- Ninguna ejecución remota se cancela a mitad de una unidad atómica sin el procedimiento de cancelación permitido. Los trabajos en vuelo y sus recibos deben reconciliarse antes de cerrar.
- Un comentario sin identidad de auditor comprobada no tiene autoridad; se trata como sugerencia a contrastar.
- Para reabrir, exigir un evento `research_reopened` motivado por nueva evidencia, cambio legítimo de alcance o instrucción humana; no borrar el resultado de cierre anterior.

## 4. Modelo de estado propuesto

`active → closure_proposed → verifying_closure → [closure_contested | closure_deferred | closing_sync_pending] → closed`

Ramas:
- `closure_contested → checking_new_evidence → verifying_closure`
- `closure_contested → escalated_to_human` si falla resolución autónoma
- `closure_deferred → active` cuando se desbloquea trabajo objetivo
- `closing_sync_pending → closed` tras sync y comprobación externa
- `closed → reopened` con motivo y revisión nueva, nunca eliminando historial

Estados no deben ser introducidos por texto del modelo directamente: transiciones controladas y eventos comprobados.

## 5. Qué significa «resolver primero entre ambos»

No es negociar una opinión ni darle al auditor la última palabra. La resolución automática requiere **nueva evidencia, repetición de cálculo o corrección verificable**; cualquiera de los dos puede reconocer una equivocación. El actor que observó el hallazgo debe reexaminar su nueva versión; si no hay acceso, registrar `not_checked`.

Cuando dos rondas no aporten evidencia que distinga las hipótesis, la conversación termina en `escalated_to_human` con un resumen compacto. Este umbral de dos rondas es una **propuesta de diseño**, modificable sin alterar el principio de resolución autónoma previo a escalamiento.

## 6. Casos de aceptación a implementar después

C01 — Comentario `closure_proposed` llega: no pausa automáticamente el proyecto.  
C02 — Evidencias completas de meta cumplida, snapshot correcto y sin crítica invalidante: cierre registrado, checkpoint íntegro, sync confirmado y solo ese proyecto deshabilitado.  
C03 — Auditor solicita cierre con commit antiguo: Investigador revalida contra el actual y contesta, sin cierre ciego.  
C04 — Auditor propone «cerrar por falta de progreso», pero hay experimento pendiente: se difiere y no se inventa conclusión.  
C05 — Un comentario de GitHub no autorizado con «cerrar»: no produce transición.  
C06 — Auditor y Investigador discrepan; dos pruebas con resultado nuevo resuelven el caso sin intervención humana.  
C07 — Dos intercambios sin evidencia nueva y sin prueba autorizada: único escalamiento al usuario, con ambas posiciones.  
C08 — Error de GitHub en cierre: `closing_sync_pending`, no pérdida ni duplicación de journal.  
C09 — Issue marcado `closed` en GitHub pero journal en `active`: investigación permanece activa; discrepancia visible.  
C10 — Cierre de meta con hallazgo crítico que cuestiona su evidencia: se rechaza `goal_met`; publication gate sigue bloqueado.  
C11 — Investigación cerrada no deshabilita el scheduler de otros proyectos ni elimina archivos.  
C12 — Nueva evidencia reabre con vínculo al cierre original, sin sobrescribirlo.

## 7. Pendientes de diseño (no inventar autoridad)

- Quién resuelve un **bloqueo crítico de publicación estable** disputado (separado del cierre de la investigación). Mantener autoridad humana si las pruebas autónomas no alcanzan.
- Reglas exactas para considerar «investigación concluida» cuando la modalidad es tema exploratorio abierto.
- Formato definitivo del paquete de cierre y política de reanudación.
- Si el Auditor podrá escribir con una identidad GitHub distinguible desde una automatización ChatGPT.
