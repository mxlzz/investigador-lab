# Análisis de ejecución remota gratuita y coordinación

**Estado:** diseño técnico propuesto; NO aprobado como arquitectura final.  
**Base acordada:** DEC-0010/0011 (autonomía y gasto), DEC-0012/0016 (PC libre), DEC-0017 (prioridades), DEC-0020 (informe), DEC-0023 (continuidad fuera de la PC).  
**Fecha de verificación externa:** 2026-11-12. **No se ha ejecutado ningún workflow ni configurado un servicio.**

## 1. Hechos técnicos verificados

- GitHub ofrece **uso gratuito y sin cómputo de minutos facturables** de runners estándar para repositorios públicos. Eso no equivale a disponibilidad permanente ni permite runners grandes/GPU sin su política de facturación. https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job
- GitHub-hosted runners ejecutan **jobs finitos**; el máximo documentado por job es **6 horas**. https://docs.github.com/en/actions/reference/limits
- Los eventos `schedule` se ejecutan desde la **rama predeterminada**, pueden retrasarse u omitirse con alta carga y quedan deshabilitados en repositorios públicos tras **60 días sin actividad**. La programación de Actions no garantiza una hora exacta ni actividad permanente. https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- Los eventos generados al hacer push con `GITHUB_TOKEN` no encadenan automáticamente otras ejecuciones, salvo excepciones específicas como `workflow_dispatch` y `repository_dispatch`. Diseñar continuidad sin presumir recursión por push. https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow
- Los artefactos y logs de Actions tienen **retención finita**, por defecto 90 días; no deben servir de almacenamiento histórico único. https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
- La programación interna de OpenClaw reside en el **Gateway**: con Gateway local apagado, no se disparan allí los trabajos. https://docs.openclaw.ai/automation/cron-jobs/how-it-works
- GitHub documenta riesgos concretos de ejecutar código no confiable con secretos o tokens elevados. Las evaluaciones experimentales y el acceso de escritura/Telegram deben separarse. https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target

## 2. Separación de responsabilidades (PROPUESTA)

### 2.1 Coordinación lógica
Mantener un **estado durable del proyecto**, una cola de tareas con prioridades asignadas por usuario, límites, registros y permisos. El coordinador lógico es independiente de la disponibilidad del proceso OpenClaw local; puede ser retomado por un disparador externo. La base durable **no es el historial del chat ni el disco efímero de un runner**.

### 2.2 Ejecutores
- **Local liviano:** consulta, planificación, reportes, indexación u otras acciones de baja carga admitidas mientras la PC está en uso.
- **Local intensivo:** experimentos CPU/GPU con carga importante solo tras 15 minutos de inactividad; pausa segura al detectar regreso del usuario.
- **Remoto gratuito:** trabajo finito y apto para infraestructura autorizada, p. ej. búsquedas documentales con acceso permitido, análisis estático, tests CPU, generación de índices públicos y lotes de trabajo reproducibles.
- **En espera:** experimentos que requieran GPU local, archivos no publicados, software o hardware local, o permisos no disponibles en el runner.

**No asumir** que cualquier proyecto abierto pueda migrarse a la nube por completo.

## 3. Contrato de una orden remota (PROPUESTA)

Un registro versionado `WorkOrder` antes de iniciar:
- `work_order_id`, `project_id`, `task_id`, `attempt_id`, `created_at`;
- `source_commit` y versión exacta de prompts/contratos;
- `kind`, `required_capabilities` y `allowed_executor_types`;
- `input_manifest`: hashes, referencias y política de disponibilidad;
- `required_permissions`, `approved_budget` y límites de tiempo/CPU/RAM;
- `result_destination`, `timeout_policy`, `retry_policy`;
- `idempotency_key`, `depends_on`, `lease_expires_at` y `state_revision`.

Salida `WorkResult`:
- referencia a `work_order_id` y `attempt_id`, ejecutor, inicio/fin;
- código de estado, acciones verificables, datos crudos y hashes;
- mediciones y errores, decisiones **propuestas** de siguiente acción;
- manifiesto persistido + confirmación de integridad;
- campos explícitos `incomplete`, `blocked` o `disputed` cuando corresponda.

**Regla propuesta:** ningún resultado vuelve a estado `committed` sin comprobar IDs, versión, integridad, evidencias y estado del proyecto. Reintentos reconcilian primero si existe ya el resultado; no relanzar a ciegas.

## 4. Máquina de estados de un job remoto (PROPUESTA)

`queued → admitted → leased → running → results_uploaded → verified → committed`

Otros estados posibles: `not_authorized`, `blocked_resources`, `expired`, `failed_recoverable`, `failed_terminal`, `interrupted`, `superseded`.

- Un job `leased` no equivale a trabajo completado; `lease` expirada requiere verificar artefactos externos antes de reintentar.
- Dos ejecutores no deben escribir simultáneamente el mismo `state_revision`; detectar conflictos y fusionar o posponer en vez de sobrescribir.
- No permitir que un job remoto que terminó tarde reemplace resultados de una revisión posterior del proyecto.

## 5. Seguridad y publicación (PROPUESTA)

1. Verificar que cada insumo está habilitado para salir a runner remoto y, si corresponde, a repositorio público. Datos privados o material con licencia restrictiva quedan fuera.
2. Separar **ejecución de código experimental** de **envío a Telegram / escritura al repositorio**. El proceso que ejecute código no confiable no recibe secretos, tokens de publicación ni permisos de release.
3. Tokens de menor privilegio por repositorio/proyecto y almacenamiento seguro; nunca copiar secretos a prompts, PRs, logs o artefactos.
4. No permitir acceso a la PC mediante el mero hecho de que exista una conexión GitHub; la migración de archivos se diseña separadamente.
5. Establecer un techo de costo `0` por proyecto para servicios pagos salvo autorización explícita. Un job etiquetado `free` debe comprobar que usa la clase gratuita permitida.

## 6. Entrega diaria y supervisión (PROPUESTA)

- **Informe 20:00 Buenos Aires (DEC-0020):** objetivo de publicación consolidada; un disparador remoto puede crearlo y enviarlo incluso con la PC apagada, **si** dispone de registros actualizados y credenciales mínimas autorizadas para Telegram.
- **No se puede prometer entrega exactamente a las 20:00 si se depende solo de `schedule` de Actions**, porque la plataforma permite retrasos y omisiones. Diseñar ventana tolerable, reintentos y deduplicación de informes; distinguir hora prevista de la real.
- **Auditoría breve diaria (DEC-0022):** debe identificar qué eventos verificables fueron revisados y qué acceso tuvo. La auditoría profunda se activa ante un **hito definido y validado** en vez de ejecutarse sin evidencia.
- Si el componente de auditoría de ChatGPT no puede ser activado automáticamente por los mecanismos permitidos, **no simular una auditoría realizada**; registrar la pendiente para su ejecución autorizada posterior.

## 7. Matriz preliminar de elegibilidad

| Tipo de tarea | PC apagada, runner gratuito | Condición |
| --- | --- | --- |
| Investigación bibliográfica pública | Posible | Conectividad/fuentes, permisos y cuota API autorizados |
| Extracción de metadatos / enlaces | Posible | Licencias y acceso |
| Tests unitarios CPU y análisis estático | Posible | Dependencias compatibles, datos y código admitidos |
| Entrenamiento intensivo GPU | Generalmente no en runner estándar | Requiere otro recurso autorizado |
| Procesamiento de material privado solo local | No | Sin autorización para transferencia |
| Persistencia de una sesión interactiva OpenClaw local | No | El Gateway local está apagado |
| Informe consolidado por Telegram | Posible | Scheduler, datos persistidos y bot autorizado |
| Aprobación humana de release estable | No automática | Decisión humana (DEC-0019) |

## 8. Alternativas de coordinación que requieren evaluación

**Alternativa A — Agenda periódica remota y trabajos discretos:** un workflow autorizado reevalúa cola y ejecuta lotes acotados. Fácil de reanudar; latencia y precisión horaria limitadas.

**Alternativa B — Despachador durable remoto separado:** servicio siempre activo que coordina workers locales/remotos. Mejor continuidad, pero contradice objetivo de gratuidad si no existe un servicio free realmente apto y estable.

**Alternativa C — Híbrido event-driven con disparadores manuales/API:** eventos permitidos más reconciliación periódica. Reduce polling, exige controlar permisos, recursión de workflows y fallos de entrega.

**Estado:** **ninguna alternativa aprobada**. Investigar en detalle antes de congelar el diseño.

## 9. Pruebas de aceptación a concretar

- R01: PC apagada, job público CPU compatible → avanza sin OpenClaw local.
- R02: job necesita archivo privado local → no se dispara ni publica datos.
- R03: ejecutor remoto se interrumpe → checkpoint y estado reconciliados, sin duplicación.
- R04: dos ejecuciones intentan confirmar misma revisión → una detecta conflicto.
- R05: entrega de informe retrasada → se reporta hora real y se evita duplicado.
- R06: runner gratuito no disponible → no selecciona automáticamente runner pago.
- R07: token o secreto no disponible → bloquea envío/autenticación; no expone contenido.
- R08: cambio de versión de prompts en mitad de un job → resultado conserva versión exacta.

## Pendientes que requieren decisiones humanas

- Cuáles datos privados pueden enviarse a remoto y bajo qué alcance.
- Si el informe de Telegram debe depender de GitHub Actions aun cuando esto no asegure puntualidad exacta.
- Grado de supervisión/auditoría exigible antes de promover un resultado candidato.
- Configuración del bot/destino Telegram y permisos de lectura/escritura del repositorio.

**Este documento no contiene workflows ejecutables ni requiere configurar OpenClaw.**
