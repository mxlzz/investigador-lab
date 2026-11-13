# Contrato preliminar — Auditoría y publicación estable

**Estado:** diseño propuesto; reglas de autoridad acordadas en DEC-0019, DEC-0022, DEC-0024, DEC-0025; estructuras y estados aún no aprobados. **No es código.**

## Fronteras de responsabilidad

- **Investigador:** reúne evidencia, compara con criterios y puede declarar `meta_cumplida` (DEC-0019).
- **Auditor de ChatGPT:** examina evidencias, documenta hallazgos, ejecuta dos revisiones breves por día (DEC-0028) o revisión profunda ante mejoras importantes/cierres/candidatos estables (DEC-0022/25). Puede emitir bloqueo por error crítico fundamentado (DEC-0024).
- **Usuario:** conserva la autorización para publicar una versión estable (DEC-0019).
- **Control de publicación:** mecanismo externo al prompt; comprueba condiciones y registros antes de un merge, tag estable o release.

**Regla acordada:** un agente no puede publicar una versión estable mientras exista un bloqueo crítico aplicable sin resolver; tampoco basta que la auditoría no haya detectado problemas para suplir autorización humana.

## Expediente de candidato estable (PROPUESTA)

Campos necesarios para evaluar un lanzamiento:
- `release_candidate_id`, `project_id`, `source_commit`, `artifact_digests`;
- `goal_id`, `goal_verdict_id`, `criteria_version`;
- lista de pruebas/experimentos con IDs y resultados reproducibles;
- `audit_snapshot_id` y `audit_status`, además del último hito profundo;
- `approval_status` ligado a usuario, candidato y commit **exactos**;
- `critical_findings` con IDs, evidencias y estado de resolución;
- `publication_attempts` y `publication_state`, con revisiones optimistas.

Un visto bueno para la versión A **no** puede reutilizarse automáticamente para publicar una versión B cuyo código o artefacto haya cambiado.

## Transiciones de publicación (PROPUESTA)

`candidate_prepared → pending_deep_audit → audit_passed_or_findings → awaiting_user_approval → release_eligible → publishing → published`

Ramas:
- `critical_finding_open → blocked_by_audit`
- `audit_unavailable → status_unknown` (política aún por definir)
- `candidate_changed → audit_revalidation_needed`
- `publication_interrupted → reconcile_external_state`

Nunca interpretar `audit_passed` como `meta_cumplida` ni `meta_cumplida` como `release_eligible`: son hechos independientes.

## Contrato preliminar de hallazgo crítico (PROPUESTA)

`finding_id`, `candidate_ref`, `auditor_identity`, `audited_commit`, `severity`, `claim`, `evidence_refs`, `verification_level`, `disputed_by`, `status` (`open`, `under_review`, `resolved`, `not_applicable`, `disputed`), `resolution_refs`.

**Pendiente de decisión:** la facultad exacta de determinar que un hallazgo quedó `resolved` y si un error crítico disputado continúa bloqueando. No asumir que la autoridad del auditor para bloquear equivale a autoridad exclusiva para desbloquear.

## Puerta de publicación (PROPUESTA DE CONTRATO)

`release_eligible` debe verificar **simultáneamente**:
1. autorización explícita del usuario vinculada a candidato y revisión;
2. ausencia de hallazgos críticos aplicables **abiertos**;
3. artefactos/código/versiones íntegros y pruebas de aceptación exigidas;
4. permisos y presupuesto operativos;
5. estado de auditoría válido según política acordada (todavía por resolver si una auditoría pendiente bloquea por defecto).

El control debe reexaminar estas condiciones **justo antes** de publicar para evitar condiciones de carrera o aprobaciones obsoletas.

## Auditoría profunda: clases de hito acordadas

- `major_improvement`: mejora importante acreditada; pendiente definir magnitud por criterio/metas de proyecto.
- `goal_or_research_closure`: meta cumplida, cierre justificado sin éxito o conclusión exploratoria.
- `stable_release_candidate`: candidato concreto a versión estable.

El mismo commit puede producir dos hitos; registrar ambos y definir después si se agrupan en una auditoría profunda con alcance suficiente. Los hitos no se declaran únicamente por frases del modelo: se verifican registros de evidencia.

## Casos de aceptación por desarrollar

- G01: cumplimiento validado con bloqueo crítico abierto: no publica, pero conserva dictamen de meta.
- G02: usuario autorizó la revisión A; cambios en revisión B: la autorización no se hereda.
- G03: auditor leyó solo un resumen: no afirma replicación ni acceso a datos crudos.
- G04: cierre de meta y candidato estable coinciden: se auditan ambas condiciones sin duplicar costos de revisión injustificadamente.
- G05: release interrumpido después de API externa: reconciliar antes de repetir.
- G06: auditor indisponible: registrar estado desconocido y aplicar **política aún por decidir**, no improvisar permiso.

## Decisiones humanas pendientes

1. ¿Quién verifica y levanta bloqueos críticos tras la corrección?
2. ¿La auditoría no disponible bloquea por defecto una publicación o puede aprobarla el usuario por excepción?
3. ¿Cómo se define de manera comprobable una mejora importante por proyecto?
4. ¿A qué repositorio/ramas se aplica exactamente la restricción de publicación estable?