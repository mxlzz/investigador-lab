# Auditoría transversal del repositorio y ajuste del diseño — 2026-11-13

**Estado:** inspección documental/código y revisión de duplicaciones. Solo cambios de diseño; **sin instalación ni modificación del runtime**.  
**Ramas inspeccionadas:** `main`, `fix/investigador-timeouts` (base PR #8), `design/auditoria-dialogo-obsidian` y las PR posteriores `fix/novelty-worker` (#9) y `fix/gemini-fallbacks` (#10).

## Cobertura y alcance real

Se inventarió **todo el árbol** de la rama de diseño (143 entradas de GitHub al inicio de esta auditoría) y el árbol de su base (133 entradas). Se contrastaron especificaciones científicas, decisiones, guías, prompts, contratos, schemas, el motor real (`engine.mjs`, `scheduler.mjs`, `scheduler-tick.mjs`), integración GitHub/ejecutor, suites de tests y documentos de instalación/aceptación. No se inspeccionó la computadora local, los expedientes privados, los datos experimentales no publicados ni el historial literal de chats Codex. Las pruebas automatizadas del código existente están en GitHub Actions; pasar CI no constituye prueba de que un nuevo diseño ya esté implementado.

**Pregunta de auditoría:** ¿el control estratégico añadido al PR #8 introduce funciones redundantes o contiene una capacidad ausente que merece desarrollo?

## Hallazgos, evidencia y resolución

| ID | Importancia | Hallazgo | Evidencia directa | Disposición |
| --- | --- | --- | --- | --- |
| RA-01 | Alta | **Duplicación de evaluación de relevancia/alternativas:** v0.1 del control estratégico repetía preguntas y estados ya cubiertos. | `spec/CORE_RESEARCH_LOOP.md`, «Regla de selección»; `spec/03-hypotheses.md`; `spec/07-prompts/06-novelty-gate.md`; `spec/07-prompts/09-next-cycle.md`. | **Corregido en PR #8:** sustituir v0.1 por un complemento longitudinal de `next_cycle`, sin fase nueva ni cron propio; eliminar `12-strategic-review.md`. |
| RA-02 | Alta | **Cadencia de tres iteraciones sin fundamento:** podía generar trabajo administrativo adicional y bloquear progresos útiles. | v0.1 de `spec/13-revision-estrategica.md`, decisión DEC-0034 original. | **Corregido:** disparos solo ante hechos relevantes, sin umbral fijo de tres. |
| RA-03 | Alta | **El nuevo prompt independiente y la edición de `09-next-cycle.md` tocaban inputs del runtime:** el motor carga los prompts desde `spec/07-prompts/`. Un PR «solo documentación» que cambia esos archivos **sí puede cambiar el comportamiento** al desplegarse. | `implementation/engine.mjs` (`PROMPTS`, `envelope`, hashes). | **Corregido:** se restauró literalmente el `09-next-cycle.md` vigente y se retiró el archivo `12-strategic-review.md`; la ampliación futura se documenta en `spec/13-revision-estrategica.md`, fuera de la ruta operativa. |
| RA-04 | Alta | **Falta validación longitudinal del host:** un `next_cycle` actual admite `selection_rationale` y `expected_artifacts` no vacíos sin exigir evidencia del progreso de la línea desde la decisión anterior. | `implementation/engine.mjs` (`accept` de `next_cycle`); schema `phase-result.schema.json`; `tests/scheduler.test.mjs`. | **Pendiente de implementación:** atribución de actividades/resultados por línea, señales derivadas del journal y un `line_assessment` condicional validado por el host. No basta agregar instrucciones de texto. |
| RA-05 | Media | **Frecuencia del auditor inconsistente:** documentación histórica afirmaba una revisión breve al día; DEC-0028 acordó **dos** por día. | `spec/09-auditing.md`, `docs/AUDIT_TRIGGER_DESIGN.md`, `handoff/ACCEPTANCE_MATRIX.md`, `spec/contracts/release-audit-gate.md`. | **Corregido en documentos vigentes de diseño:** dos revisiones breves al día más profundas por hito. No se crearon tareas. DEC-0022 conserva su texto histórico y DEC-0028 lo amplía. |
| RA-06 | Media | **Duplicación de formato de mensajes entre Auditor y buzón:** coexistían `audit-dialogue/0.1` e `investigador-audit/1`. El ejemplo reutilizaba `FND`, ya reservado para hallazgos de investigación. | `spec/contracts/audit-dialogue-v1.md`, `github-audit-inbox-v1.md`, `spec/05-knowledge.md`. | **Corregido a nivel de diseño:** un envelope propuesto `investigador-audit/1` y prefijo `AUD-FIND-` para objeciones; Issue queda como transporte, journal como estado. JSON Schema definitivo aún pendiente. |
| RA-07 | Alta | **Inconsistencia de criterio de meta cumplida:** DEC-0007 menciona disponer de versión estable, mientras DEC-0019 permite declarar cumplimiento sin autorizar todavía publicación estable. | `docs/DECISIONS.md`; `spec/contracts/research-closure-v1.md`. | **Pendiente de decisión**: distinguir con precisión versión estable interna, candidata a release, `goal_met` y publicación. No se cambió un acuerdo previo por inferencia. No autorizar cierre `goal_met` por comentario hasta aclarar esta relación. |
| RA-08 | Media | **Base de diseño atrasada frente a implementación:** PR #8 nace de `fix/investigador-timeouts`; PR #9 corrigió persistencia/contratos de novedad, PR #10 añadió fallback del proveedor y tiempos. | PR #9 `fix/novelty-worker`, PR #10 `fix/gemini-fallbacks` y sus pruebas. | **Pendiente** al abrir implementación: partir del último commit validado, reconciliar contratos con esos PR, y no aplicar ciegamente parches de diseño sobre una versión previa. |
| RA-09 | Media | **Identidad GitHub del Auditor y acceso a tareas programadas no verificados:** una cuenta común no autentica roles; una tarea de ChatGPT programada no equivale por sí sola a acceso de escritura autónomo sobre Issues privados. | `spec/contracts/auditor-github-identity-v1.md`, `spec/12-auditores-chatgpt-operacion.md`. | **Ya asentado, no duplicar implementación:** prueba E0 de acceso, escritura y actor independiente antes del circuito autónomo. |
| RA-10 | Baja | **Documentos históricos con estados desactualizados** (algunos dicen «no implementado» para componentes que ya están en ramas posteriores). | `docs/DESIGN_STATUS.md`, `spec/08-deployment.md`, documentación local de versiones previas frente a `docs/IMPLEMENTATION_LOG.md` / PR #9–#10. | Conservar como registro de diseño fechado y añadir referencia al estado actual en el traspaso. Evitar reescribir el historial como si esos documentos describieran el estado operativo actual. |

## Qué queda de verdad por hacer respecto del «desvío de rumbo»

Una sola capacidad nueva propuesta, no implementada: **en la selección de otro ciclo importante sobre la misma línea, exigir comparación de resultados acumulados y oportunidad alternativa fundada en evidencia** cuando hay una señal de repetición/desvío. Se integra en `next_cycle`, no crea su propio agente, prompt o reloj.

El control de novedad por hipótesis sigue igual; no añade búsqueda de Internet redundante. El Auditor ChatGPT puede advertir un desvío, pero el host/Investigador decide según datos y alcance aprobado.

**No se debe medir éxito por el número de prompts, revisiones, commits, pruebas verdes o sugerencias escritas.** Para comprobar esta capacidad nueva habrá que ejecutar los casos R01–R08 de `spec/13-revision-estrategica.md` con evidencias reales.

## Orden recomendado de trabajo posterior (en otro chat)

1. **Primero:** cerrar RA-07 (definición de cierre/meta) y comprobar E0 de identidad y acceso del Auditor; ambos afectan autoridad.
2. **Para el control de rumbo:** incorporar atribución de eventos por línea e input acumulado, añadir la extensión condicional `line_assessment` al schema/host y recién entonces modificar el prompt vigente. Probar R01–R08 con casos adversos y avances útiles.
3. **Integración:** reconciliar el cambio con PR #9/#10 y cualquier rama posterior de código; instalar sobre la versión efectiva de OpenClaw sin sobrescribir expedientes.
4. **No hacer en esta rama:** crear segunda tarea de investigación, un tercer auditor, duplicar búsquedas por hipótesis, inventar costos, introducir un contador fijo de iteraciones o afirmar una capacidad no demostrada.

## Resultado de esta auditoría

**Ajuste necesario y realizado al diseño:** reducir la propuesta de «revisión estratégica» a un cambio puntual de seguimiento longitudinal. Se corrigieron además dos inconsistencias del protocolo del Auditor y la frecuencia documental. Los conflictos de autoridad y los cambios que requieren código permanecen expresamente pendientes.  
**No se ejecutó ninguna investigación científica ni se cambió el motor instalado.**
