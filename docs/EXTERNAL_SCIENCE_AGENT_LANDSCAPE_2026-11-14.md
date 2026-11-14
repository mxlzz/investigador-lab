# Investigación comparativa de agentes científicos, skills y MCP existentes

**Fecha de relevamiento:** 2026-11-14. **Estado:** investigación documental; sin adopción ni implementación aprobada.  
**Propósito:** identificar capacidades ya resueltas que convenga **reutilizar, adaptar o usar como baseline** del Investigador, evitando reinventar subsistemas.  
**Base interna contrastada:** `spec/CORE_RESEARCH_LOOP.md`, `spec/05-knowledge.md`, `spec/13-revision-estrategica.md`, `spec/14-github-readable-research.md`, `docs/REFERENCE_PROJECTS.md`, `implementation/github-projects.mjs`.

## 1. Resultado principal

**No apareció un reemplazo único, comprobado y de propósito universal, que además ejecute investigación científica autónoma en OpenClaw Windows, mantenga un journal auditable, experimente con infraestructura aislada y se comunique con un Auditor externo ChatGPT.** Sí hay implementaciones públicas bastante maduras de partes críticas.

**Recomendación de arquitectura, pendiente de pruebas:** mantener por ahora la interfaz OpenClaw/GitHub y el estado existente, pero evaluar incorporación de mecanismos existentes; comparar contra sustituir el motor por RD-Agent, Sakana v3 o ResearchOS mediante una prueba idéntica antes de seguir añadiendo subsistemas propios. No asumir que más estrellas o un README equivalen a calidad científica.

### Candidatos principales

| Proyecto y código | Encaje real | Fortalezas verificables en repo/paper | Límite relevante | Licencia observada |
| --- | --- | --- | --- | --- |
| [Sakana AI — AI-Scientist-v3](https://github.com/SakanaAI/AI-Scientist-v3) | **Muy alto** para experimentación computacional | Pipeline idea→experimento→evaluación→ablaciones→sealed evaluation→paper; Docker; inspectores; skills de memoria y evidencia; tests | Optimización de código/tareas con evaluación concreta; no reemplaza una investigación documental abierta. Usa agentes con permisos amplios dentro de sandbox. | Apache-2.0 |
| [Microsoft — RD-Agent](https://github.com/microsoft/RD-Agent) | **Muy alto** para ciclo hipótesis→implementación→feedback | Iteración R (research) y D (development); escenarios de ML, data, finanzas; benchmarks y trazas; proyecto mantenido y MIT | Orientado a R&D basado en datos; repositorio declara **Linux solamente**, Docker en escenarios habituales | MIT |
| [DIG-ResearchOS](https://github.com/MengkunLiang/DIG-ResearchOS) | **Muy alto** como referencia del expediente/ciclo científico | Artefactos persistentes, síntesis entre papers, portafolio de hipótesis, auditoría de mecanismos, contratos para ejecutor externo, resumibilidad, skills especializadas | Trabajo importante aún ligado a gates humanos y un ejecutor externo; preprint técnico del 22/10/2026 **sin peer review**; **sin licencia de repositorio detectada (GitHub license:null y sin LICENSE raíz)**. No copiar código/skills hasta aclarar permisos | **No constatada** |
| [CKM-HypoGen](https://github.com/TaoJinkai/ckm-hypogen) | **Alto** para conocimiento creciente e hipótesis | Skills portables `SKILL.md`, plugin, ingesta incremental, conflictos/cross-topic links, hipótesis y benchmark temporal contra trabajos posteriores; mecanismos para investigación recurrente | Benchmark referido a temas de ML/arXiv; el 6,4% publicado corresponde a 55 coincidencias sobre 863 hipótesis y **no prueba descubrimiento original**. Compatibilidad exacta de sus skills con OpenClaw por validar | MIT |
| [AIDE ML](https://github.com/WecoAI/aideml) | **Alto** para exploración de código | Árbol de programas y mutaciones con selección según evaluación, visualizador, historial de candidatos y métricas; aplicado en benchmarks ML | Requiere objetivo y métrica ejecutable, no resuelve bibliografía/hipótesis científica multidominio | MIT |
| [Future-House PaperQA2](https://github.com/Future-House/paper-qa) | **Alto** como lectura de literatura | Ingesta PDF/documentos/código, metadatos, citas, búsqueda y respuestas sustentadas, detección de contradicciones; proyecto activo | No ejecuta experimentos ni prioriza líneas de desarrollo por sí solo | Apache-2.0 |
| [OpenScholar](https://github.com/akariasai/openscholar) | **Alto** como síntesis bibliográfica | Investigación publicada en Nature (feb 2026) y código de RAG científico con 45M papers y modelo propio; evaluado con ScholarQABench | Reproducción integral de retriever/corpus requiere infraestructura de datos/modelos; no es motor completo | Apache-2.0 |
| [GPT Researcher](https://github.com/assafelovic/gpt-researcher) y [MCP](https://github.com/assafelovic/gptr-mcp) | **Alto** para *deep research* web | Planner, investigadores paralelos, >20 retrievers, informes con fuentes y modo MCP | Enfocado en investigación documental por pedido y reportes, sin loop nativo de experimentos científicos reproducibles | Apache-2.0 (repo base) |
| [keyless-research-mcp](https://github.com/EgiStr/keyless-research-mcp) | **Alto** como acceso a fuentes | Busca arXiv/OpenAlex/Crossref/Europe PMC/DOAJ, citas, OA full text, fallos parciales visibles, sin API keys obligatorias | Componente de herramientas, no agente ni evaluador de hipótesis. Adopción pequeña; probar funcionamiento | MIT |
| [semantic-scholar-mcp](https://github.com/ckgerteis/semantic-scholar-mcp) | **Alto** para grafos bibliográficos | Recomendaciones por papers semilla, citas en ambas direcciones, recibos de búsquedas encadenados por hash y fixtures | Sólo Semantic Scholar y sujeto a límites/condiciones de su API; no representa el grafo científico propio | MIT |
| [Agent Laboratory](https://aclanthology.org/2025.findings-emnlp.320/) | **Medio-alto** como referencia metodológica | Publicación revisada (Findings EMNLP 2025); literatura→experimentos→paper, feedback humano entre etapas | Más orientado a proyecto ML entregable que a investigación abierta y continua; probar antes de adoptar | Verificar repo exacto |
| [Google Co-Scientist](https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/) | **Alto** como patrón conceptual | Generador, reflection/peer review, proximity/clustering y ranking por debate de hipótesis; trabajo publicado Nature mayo 2026 | **No se verificó implementación oficial pública reutilizable** del sistema completo; clones no equivalen a código de Google | No aplicable |

**Otros revisados:** Sakana AI-Scientist-v2 (búsqueda arborescente sin plantillas y menor tasa de éxito que v1 en algunos contextos), CMBAgents (planning/control en cosmología), [scholarly-mcp](https://github.com/M-Romdhani/scholarly-mcp), [research-mcp](https://github.com/hampikamayuq/research-mcp), [paper-search-mcp](https://github.com/upascal/paper-search-mcp) y [Co-Scientist no oficial](https://github.com/Ahmad-Jaradat-Space/Co-Scientist). No son primeras opciones sin pruebas de equivalencia/calidad/licencia.

## 2. Componentes concretos cuyo código conviene estudiar, no reescribir a ciegas

### 2.1. Bitácora, progreso y control de rumbo: Sakana v3 `memory-log`

- Código/ficha: https://github.com/SakanaAI/AI-Scientist-v3/blob/main/src/agents/skills/memory-log/SKILL.md
- Produce `memory.md` *append-only* y JSONL con paso, timestamp, evidencia y acción siguiente.
- Genera `conclusions.md` para **próximos trabajadores**, sin cronología: orientaciones vigentes y caminos que ya probaron ser infructuosos. Sólo se cambia ante contradicción, categoría nueva, giro Do/Don't o refinamiento sustantivo. Ese *update gate* evita producir resúmenes vacíos.
- **Traslado conceptual:** nuestro `events.jsonl` ya existe; no añadir un segundo journal. Generar `BITACORA.md` y un `CONCLUSIONES.md` de estrategia como vistas del journal, con comprobación de eventos y cambios significativos. Contrastar con DEC-0034/0035.

### 2.2. Evidencia verificable: Sakana v3 `scientific-evidence`

- https://github.com/SakanaAI/AI-Scientist-v3/blob/main/src/agents/skills/scientific-evidence/SKILL.md
- Usa tokens `@evidence[[...]]`, sidecars `.prov.json`, `ledger.jsonl`, verificador y estados `resolved/anchored/dangling`.
- **Traslado conceptual:** serviría para validar links entre `RESULTADOS.md`, tablas, figuras, datasets y experimentos. No confundir enlace existente con verificación semántica/causal. Considerar adaptar contrato, no duplicar registro canónico.

### 2.3. Novedad y transferencia entre dominios: ResearchOS

- https://github.com/MengkunLiang/DIG-ResearchOS/blob/main/researchos/agent_guidance/novelty-audit/SKILL.md
- https://github.com/MengkunLiang/DIG-ResearchOS/blob/main/skills/cross-domain-idea-studio/SKILL.md
- `novelty-audit`: mecanismo causal, consultas por método/tarea/mecanismo, comparación de dominios y fuerza de evidencia; un indicio mecánico de colisión no se interpreta como dictamen.
- `cross-domain-idea-studio`: plan de búsqueda puente, matriz de evidencia entre dominios, fichas de mecanismo transferible y riesgos de traslación; gate humano antes de consolidar una dirección. **Muy afín a conexiones inesperadas**.
- **Traslado conceptual:** reforzar el `novelty_review` y el grafo propuesto `map_knowledge.proposed_edges` existentes; no añadir una fase paralela. **No copiar los archivos por falta de licencia confirmada.**

### 2.4. Conocimiento que cambia con nuevas publicaciones: CKM-HypoGen

- https://github.com/TaoJinkai/ckm-hypogen/blob/main/skills/metabolism/SKILL.md
- `metabolism`: ventana incremental de arXiv/OpenAlex, deduplicación de IDs, lectura de texto, actualización de `knowledge/_index.md`, evidencias confirmantes/contradictorias y cross-topic links. Produce hipótesis *solo si aparecen preguntas plausibles* y bitácora diaria.
- `research-subscription`: seguimiento recurrente y deduplicación; nuestra cron/OpenClaw ya cubre la programación, no es necesario clonarla.
- **Traslado conceptual:** ingesta incremental de literatura y grafo cambiante; sería una evolución más útil que agregar otra ronda de prompts de «reflexión».

### 2.5. Mejor núcleo de experimentación: AIDE / RD-Agent / Sakana v3

- Para hipótesis con métrica: usar árbol/historia de intentos, variantes, errores, baseline, selección basada en datos y condición de parada. `AIDE` es referencia directa de búsqueda experimental sin obsesión por microarreglos.
- RD-Agent ofrece el ciclo científico-industrial R↔D completo y mayor adopción. Su instalación oficial está centrada en Linux/Docker; no asumir compatibilidad Windows nativa con el OpenClaw instalado.
- Sakana v3 tiene stages aislados, ablaciones, evaluación final sellada y `Run Inspector`. Es probable que parte de nuestra lógica de runner se beneficie de estudiar estos contratos en vez de extender un smoke test sintético.

### 2.6. Mejoras rápidas de acceso a antecedentes: MCP/PaperQA

- Antes de desarrollar más buscadores propios, comparar `keyless-research-mcp` y `paper-qa` contra los adaptadores Crossref/OpenAlex/arXiv que hoy tiene Investigador.
- Prueba focal: cobertura de diez preguntas científicas con antecedentes conocidos, capacidad de obtener texto completo, trazabilidad DOI/commit/sección, deduplicación, citas hacia atrás/adelante, calidad ante falla parcial y costo.
- No instalar 4 MCP similares a la vez: cubrirían las mismas APIs y complicarían idempotencia, cuotas y procedencia.

## 3. Lo que NO se puede afirmar con esta revisión

- No se ejecutó el código de terceros ni se reprodujeron sus benchmarks localmente.
- Las cifras de rendimiento son reportes de autores; no equivalen a una comparación controlada contra nuestro Investigador.
- El preprint ResearchOS no está revisado por pares, y el repo no expone licencia reconocida. Su documentación puede orientar arquitectura, pero no autoriza reutilización de código.
- Los skills son instrucciones más herramientas. Copiar `SKILL.md` no hace aparecer sus APIs, runners, archivos y credenciales; hay que validar dependencias reales.
- Ningún sistema examinado cumple demostrablemente por sí solo **todos** los requisitos de OpenClaw Windows, autonomía recurrente, proyecto abierto/objetivo, experimentalización aislada, GitHub legible y auditor ChatGPT.

## 4. Prueba comparativa antes de elegir arquitectura

**B0 — Inventario:** documentar qué requisitos ya cubre cada candidato y qué no. Licencia, sistema operativo, herramientas, modelos, costo esperado, estados exportados, recuperación, evidencia y gates.

**B1 — Investigación documental acotada (todos):** mismo problema, 10 antecedentes conocidos ocultos para el evaluador, búsqueda real, lectura y citas verificables, detección de redundancia, conocimiento persistido, resumen humano en GitHub.

**B2 — Ciencia computacional (AIDE, RD-Agent, Sakana v3, nuestro Investigador):** misma tarea y datos públicos, baseline congelado, presupuesto máximo de tiempo/tokens comparable; medir tasa de ejecución válida, errores, mejora real y decisiones de detener/pivotar.

**B3 — Memoria y rumbo:** interrumpir y reanudar; introducir antecedente que invalida una línea; medir si reutiliza conocimiento ya obtenido, corrige el plan y no repite trabajo innecesario. Contrastar `memory-log`, CKM y nuestro journal.

**B4 — Revisión independiente:** un auditor recibe snapshot/evidencia, encuentra una discrepancia implantada, publica hallazgo, recibe una respuesta y verifica corrección sin reescribir historial.

**Decisión posterior:** (a) mantener Investigador con módulos externos; (b) sustituir el motor y preservar OpenClaw/GitHub como interfaz; (c) abandonar componentes propios redundantes. Elegir por pruebas de cobertura y costo de integración, no por prestigio.

## 5. Prioridad sugerida para revisión de código

1. `SakanaAI/AI-Scientist-v3/src/agents/skills/memory-log` y `scientific-evidence`: parecen resolver exactamente dos necesidades recientes, con licencia Apache-2.0.
2. `TaoJinkai/ckm-hypogen/skills/metabolism` y su benchmark temporal: conexiones/incrementos, licencia MIT.
3. `WecoAI/aideml` + `microsoft/RD-Agent`: comparar alternativas de búsqueda experimental y estado.
4. `ResearchOS` (arquitectura/skills y licencia antes de reutilizar).
5. `PaperQA2` + un MCP bibliográfico keyless: búsqueda/comprobación de fuentes, evitando reimplementar APIs.

**Este documento es un relevamiento de candidatos, no una decisión de adopción.** No autoriza instalar, cambiar el agente, fusionar PRs ni copiar código no licenciado.

## 6. Fuentes primarias

- Sakana v3 código y docs: https://github.com/SakanaAI/AI-Scientist-v3 ; paper https://arxiv.org/abs/2610.18933
- Microsoft RD-Agent código: https://github.com/microsoft/RD-Agent ; paper https://arxiv.org/abs/2404.11276
- AIDE código: https://github.com/WecoAI/aideml ; paper https://arxiv.org/abs/2502.13138
- ResearchOS código: https://github.com/MengkunLiang/DIG-ResearchOS ; preprint https://www.preprints.org/manuscript/202610.2216
- CKM código: https://github.com/TaoJinkai/ckm-hypogen ; paper https://arxiv.org/abs/2604.12243
- PaperQA2: https://github.com/Future-House/paper-qa
- OpenScholar: https://github.com/akariasai/openscholar ; paper https://www.nature.com/articles/s41586-025-10072-4
- GPT Researcher: https://github.com/assafelovic/gpt-researcher ; MCP https://github.com/assafelovic/gptr-mcp
- keyless MCP: https://github.com/EgiStr/keyless-research-mcp
- S2 citations MCP: https://github.com/ckgerteis/semantic-scholar-mcp
- Agent Laboratory (peer reviewed): https://aclanthology.org/2025.findings-emnlp.320/
- Google Co-Scientist paper: https://www.nature.com/articles/s41586-026-10644-y
