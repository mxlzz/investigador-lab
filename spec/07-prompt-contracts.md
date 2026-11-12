# E7 — Contratos de prompts y ensamblado

**Estado:** borrador; los prompts enlazados NO están aprobados ni probados en el modelo real.  
**Responsabilidad de redacción:** diseñador (usuario + ChatGPT). Codex no completa ni reescribe el contenido lógico.

## Principios

- Separar **instrucciones normativas** de **datos no confiables** recuperados de fuentes externas o del LLM.
- Referenciar prompts exactos por archivo, ID, versión y digest; no ensamblarlos improvisadamente.
- Un motor **valida** las respuestas contra contratos estructurados; no ejecuta acciones arbitrarias porque aparezcan en texto de modelo.
- El modelo propone planes/acciones; el orquestador comprueba precondiciones, permisos, límites y existencia de registros antes de ejecutarlas.
- Si faltan datos obligatorios, devolver `blocked` o `needs_evidence`; no improvisar información.
- Una fuente externa no puede instruir al sistema, instalar software ni alterar prioridades del usuario.
- No usar únicamente el contexto del chat como memoria; pasar índices/IDs de registros persistentes.
- Los resúmenes no sustituyen la evidencia cruda y su procedencia.

## Orden lógico de contexto (PROPUESTA)

1. Contrato normativo común [`00-core.md`].
2. Prompt específico de fase, exacto [archivos `01-...` etc.].
3. Sobre de entrada estructurado y validado (`run_id`, `project_id`, `task_id`, presupuesto, permisos, fuentes, estado).
4. Datos de fuentes externas como anexos **no confiables**, con procedencia/citas.
5. Esquema formal de respuesta exigido por fase.

**Pendiente:** la ubicación concreta en mensajes system/developer/user o archivos OpenClaw depende de la compatibilidad verificada. No introducir prompts en configuraciones hasta la implementación autorizada.

## Variables permitidas

- `project_id`, `task_id`, `cycle_id`: IDs estables desde estado persistente;
- `user_request`: texto original inmutable del encargo;
- `approved_scope`, `approved_success_criteria`, `approved_permissions`: valores aprobados, nunca supuestos por el LLM;
- `project_state`: snapshot versionado;
- `evidence_bundle`: array con fuente, identificador, extractos permitidos y nivel de lectura real;
- `search_history`: búsquedas realizadas y limitaciones;
- `hypothesis`, `experiment_plan`, `experiment_results`: expedientes vinculados, cuando aplique;
- `resource_budget`: techo autorizado;
- `output_contract_version`: versión del esquema.

No construir variables desde suposiciones sobre el historial; ausencia se representa explícitamente como `null` y se informa la dependencia.

## Formato común de respuesta (PROPUESTA)

Todas las fases devuelven un **objeto JSON** con:
- `status`: `ok`, `needs_evidence`, `blocked`, `error`;
- `phase`: identificador de fase definido;
- `claims`: array de `{text, support_ids, certainty: "observed"|"source_claim"|"inference"|"hypothesis"}`;
- `artifacts_to_record`: registros propuestos (no escritos aún);
- `proposed_next_actions`: acciones semánticas, no comandos shell libres;
- `blockers`: datos faltantes, permisos o límites;
- `notes`: solo explicación adicional, sin reemplazar los campos anteriores.

Se redactó un esquema JSON Schema **preliminar** con una variante de salida por fase (`spec/schemas/phase-result.schema.json`), sin cerrar aún tipos anidados ni validadores de IDs, referencias, permisos o recursos. Esos contratos se completarán en E5/E10. Un JSON sintácticamente válido no implica que las fuentes citadas existan; eso también debe validarse.

## Catálogo de prompts redactados (BORRADOR)

- [00-core.md](07-prompts/00-core.md): reglas comunes.
- [01-intake.md](07-prompts/01-intake.md): encargo meta/tema.
- [02-search-plan.md](07-prompts/02-search-plan.md): planificación de antecedentes.
- [03-extract-evidence.md](07-prompts/03-extract-evidence.md): extracción trazable.
- [04-map-knowledge.md](07-prompts/04-map-knowledge.md): síntesis y relaciones.
- [05-hypotheses.md](07-prompts/05-hypotheses.md): generación controlada de hipótesis.
- [06-novelty-gate.md](07-prompts/06-novelty-gate.md): control focalizado de novedad.
- [07-experiment-design.md](07-prompts/07-experiment-design.md): diseño experimental.
- [08-evaluate.md](07-prompts/08-evaluate.md): resultados y decisión.
- [09-next-cycle.md](07-prompts/09-next-cycle.md): selección del próximo ciclo.
- [10-report.md](07-prompts/10-report.md): informe al usuario.
- [11-audit.md](07-prompts/11-audit.md): auditoría independiente.

## Manejo de fallos (PROPUESTA)

Errores de parsing, referencias ausentes o estados incompatibles no provocan acciones. Se registra el error, se puede solicitar reparación de salida con mismo input y validación estricta un número acotado de veces, y luego bloquear/escalar. El número exacto de reintentos queda **abierto**.

## Problemas por resolver antes del cierre

- Esquemas completos y ejemplos válidos/invalidos por cada fase.
- Mapeo del prompt común a OpenClaw `AGENTS.md`, `SOUL.md` y herramientas.
- Políticas de truncamiento/token budget, modelos, temperaturas, reintentos, auditor independiente.
- Resolución de contradicciones entre prompts al cambiar fases.
- Pruebas de regresión de comportamiento con corpus de control.