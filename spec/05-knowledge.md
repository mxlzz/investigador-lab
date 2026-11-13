# E5 — Memoria, mapa de conocimiento y trazabilidad

**Estado:** borrador, aspectos centrales acordados: conservar investigación completa y hacerla consultable en Obsidian; tecnología detallada por cerrar.

## 1. Dos objetivos simultáneos

1. **Consulta humana:** Obsidian como lector de Markdown y enlaces, con portada, búsquedas, filtros y mapas por proyecto.
2. **Consumo por agentes:** registros estructurados con entidades, IDs, relaciones y estados explícitos. Un enlace `[[...]]` no constituye por sí solo una prueba ni una relación tipificada.

El mapa no debe depender del recuerdo del LLM; debe ser reconstruible desde el almacenamiento persistente y auditable mediante queries.

## 2. Clases propuestas de registro

| Entidad | ID ejemplo | Datos fundamentales |
| --- | --- | --- |
| Proyecto | PRJ-0001 | objetivo original, modalidad, alcance, revisiones |
| Búsqueda | SRCH-0001 | consulta literal, filtro, fecha, fuente, resultados |
| Fuente | SRC-0001 | identificadores persistentes, versión, estado de lectura |
| Hallazgo | FND-0001 | afirmación, localizador, evidencia, confianza/procedencia |
| Pregunta | Q-0001 | interrogante, contexto, relaciones |
| Hipótesis | HYP-0001 | predicción y diferencia frente a lo conocido |
| Oportunidad | OPP-0001 | derivación lateral, relación a proyecto, prioridad |
| Experimento | EXP-0001 | protocolo, código, artefactos, dictamen |
| Decisión | DEC-0001 | alternativas, razones, evidencia, autoridad y versión |
| Auditoría | AUD-0001 | revisión independiente, hallazgos y resolución |
| Entrega | REL-0001 | versión, commit, criterios satisfechos |

**Advertencia de nombres:** `DEC` se usa actualmente para decisiones del **diseño del sistema** en `docs/DECISIONS.md` y aparece también propuesto para decisiones **internas de una investigación**. Es una colisión semántica a resolver: propuesto distinguir `SYSDEC` de `PRJDEC` o utilizar un prefijo con ámbito; no renumerar historia hasta acordarlo.

## 3. Campos mínimos transversales (PROPUESTA)

`id`, `type`, `project_id`, `created_at` en UTC, `updated_at`, `status`, `origin`, `author_kind` (human/agent/tool/external), `model_or_tool_version` cuando aplique, `source_refs`, `related_ids`, `content_digest`, `supersedes` si corresponde y `confidence_notes` en lenguaje natural.

No mezclar la certeza de un hecho externo con la confianza de un modelo. Una URL en notas no prueba que se haya visitado.

## 4. Procedencia y grafo (PROPUESTA)

Los vínculos se guardan con `source_id`, `relation_type`, `target_id`, `basis` (IDs/localizadores) y `validation_status`. Las relaciones se pueden revisar/refutar sin borrar el historial.

Ejemplos:
`SRC-014 supports FND-007`; `EXP-025 tests HYP-004`; `EXP-025 compared_with EXP-012`; `REL-003 includes_commit <sha>`; `AUD-004 challenges DEC-019`.

Se puede mapear a W3C PROV para exportaciones interoperables; no imponer PROV-O completo si añade costo no justificado.

## 5. Archivos y estructura (PROPUESTA)

- `vault/`: Markdown legible, YAML frontmatter simple, enlaces Obsidian.
- `records/`: registros estructurados y snapshots de decisiones/búsquedas.
- `projects/<id>/` o repositorio propio por proyecto, con límites claros de publicación.
- `evidence-index/`: manifiestos de artefactos externos, hashes, tamaños, formatos y políticas de acceso.
- `memory/`: resúmenes y procedimientos validados, regenerables desde registros y con procedencia.
- `runs/`: estados de ejecución, reanudación y diagnósticos.

**Git no es almacén adecuado para datos pesados arbitrarios.** Guardar solo evidencia ligera, manifiestos y resúmenes versionables; datasets/artefactos voluminosos en almacenamiento persistente, con estrategia de backups. Logs de GitHub Actions y cachés no constituyen el archivo histórico.

## 6. Integridad y persistencia (PROPUESTA)

- Escrituras transaccionales o confirmadas: no declarar una etapa archivada hasta verificar existencia e integridad de registros críticos.
- Cada registro debe referenciar un artefacto comprobable o indicar `missing`/ `inaccessible`; distinguir ausencia de validación.
- Enmiendas mediante nueva revisión/versiones y marca `superseded`, no sobrescribir silenciosamente resultados históricos.
- Guardar hashes reproducibles de artefactos y su política de retención.
- En repositorio público publicar solo contenido expresamente permitido: nunca credenciales, datos personales, rutas privadas, texto no redistribuible, logs sensibles o secretos.
- Copias de seguridad independientes de GitHub para resultados esenciales.

## 7. Obsidian

Markdown/YAML con propiedades atómicas (listas simples, IDs como texto) y enlaces `[[ruta/archivo]]`. Obsidian Graph View muestra enlaces de notas, no valida conocimiento. Para acceder a modificaciones remotas hay que actualizar la copia local por Git o sincronizador, no asumir sincronización automática.

## 8. Casos de aceptación

- K01: una pregunta puede recorrer enlaces `SRC → FND → HYP → EXP → DEC → REL` y recuperar evidencias.
- K02: refutar un hallazgo conserva su versión histórica y sus dependencias.
- K03: archivar/restaurar tras interrupción sin usar conversaciones anteriores.
- K04: objeto externo faltante queda marcado como incompleto.
- K05: abrir `vault/` con Obsidian, navegar por enlaces sin plugin propietario.
- K06: un dataset de acceso restringido jamás se publica en un repo público.

## Pendientes para cerrar E5

- IDs y scopes definitivos; formato formal JSON Schema/YAML para registros.
- Sincronización Obsidian, almacenaje externo, backups y retención.
- Nivel de reproducción de textos externos (resúmenes vs copias) y política de licencias.
- Estrategia de indexación y búsqueda semántica que complemente Markdown sin duplicar la fuente de verdad.
## Continuación de diseño (2026-11-13)

La consulta en Obsidian se detalla en `spec/11-obsidian-projection.md`: vault como proyección generada por proyecto, sin reemplazar el journal ni exportar automáticamente información privada a repositorios públicos. La proyección todavía no está implementada.
