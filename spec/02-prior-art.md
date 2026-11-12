# E2 — Investigación previa y cobertura de antecedentes

**Estado:** borrador técnico pendiente de revisión.  
**Requisito ACORDADO:** investigar ampliamente antes de idear/experimentar; registrar lo investigado y volver a contrastar cada propuesta (DEC-0002).

## 1. Preguntas y estrategia (PROPUESTA)

Por proyecto registrar `search_plan_id`, problema/subproblemas, términos y sinónimos, disciplinas vecinas, idiomas pertinentes, rango temporal y familias de fuentes. No limitarse a un único buscador ni inferir exhaustividad del número bruto de documentos.

Fuentes según dominio: índices académicos, citas directas/inversas, repositorios de software, benchmarks, patentes, estándares, tesis, informes técnicos, documentación de proveedores y resultados negativos accesibles. Los catálogos concretos son reemplazables y deben registrarse.

## 2. Registro **por búsqueda**

Campos de expediente propuestos:
- identificador, proyecto, pregunta, fecha/hora, origen o endpoint y versión cuando aplique;
- consulta literal, idioma, operadores, filtros, paginación/cobertura, ventana temporal;
- número de resultados observado y límite real de recuperación;
- lista de IDs/URLs/DOI y razones de inclusión/exclusión;
- errores, bloqueos, rate limits y búsquedas alternativas;
- versión del proceso que ejecutó la búsqueda y evidencia de su ejecución.

No afirmar «consultado» si solo se obtuvo un snippet y no se leyó el documento completo. Diferenciar `identified`, `metadata_read`, `abstract_read`, `full_text_read`, `code_inspected`, `replicated`.

## 3. Extracción de evidencia

Por fuente: título, autores o responsables, fecha y versión, identificador persistente, licencia/accesibilidad, alcance, métodos, entradas, parámetros, experimentos, métricas, resultados alegados, limitaciones, reproducciones externas y citas a pasajes/figuras relevantes.  

Separar **afirmación del autor** de **evidencia primaria** y de **inferencia del agente**. Toda extracción debe guardar localizador dentro de la fuente cuando sea posible (sección, página, commit, línea).

## 4. Deduplicación y equivalencia

- Identidad fuerte: DOI, arXiv ID/version, software repo+commit, ISBN cuando aplique.
- Coincidencia débil: título, autores, fecha, resumen y técnica; nunca fusionar automáticamente solo por similitud semántica.
- Versiones distintas se vinculan como variantes, preservando sus diferencias.
- Equivalencia técnica se registra como una **hipótesis de relación** que requiere evidencia, no como deduplicación bibliográfica.

## 5. Mapa de conocimiento

Nodos propuestos: fuente, método, pregunta, resultado, limitación, implementación, experimento y contradicción. Relaciones con **tipo**, justificación y confianza explícita: `supports`, `contradicts`, `extends`, `replicates`, `compares_with`, `implements`, `addresses`. La evidencia se referencia mediante IDs estables.

Una relación puede estar `proposed`, `verified`, `disputed` o `superseded`. Un enlace wiki de Obsidian permite navegar, pero **no valida** la relación.

## 6. Criterio de cobertura (PROPUESTA; NO APROBADA)

Evitar un número fijo de papers. Antes de cerrar la revisión, registrar:
- cobertura de las principales familias de métodos;
- baselines y implementaciones relevantes identificados;
- huecos y contradicciones reconocidos;
- búsqueda por sinónimos, equivalentes y redes de citas;
- búsqueda de trabajos recientes;
- tasa de nuevos antecedentes relevantes en iteraciones sucesivas;
- fuentes inaccesibles o no revisadas.

La revisión inicial puede terminar como `sufficient_for_next_step` con incertidumbres explícitas; **jamás** `complete_knowledge`. Si aparece evidencia nueva, se reabre.

## 7. Ejemplos de fallo que deben detectarse

- Paper inexistente o DOI que no corresponde al título.
- Confundir abstract con lectura íntegra.
- Concluir `novedoso` porque una búsqueda exacta no devolvió resultados.
- Resumir una superioridad sin verificar métricas/condiciones comparables.
- Omitir trabajos recientes porque el índice consultado estaba desactualizado.

## Pendientes para cerrar E2
- Elegir fuentes mínimas por categoría y reglas de acceso/pagos.
- Definir criterio de saturación/cobertura y umbrales operativos por dominio.
- Especificar cómo distinguir evidencia de alto/bajo nivel según disciplina.
- Diseñar corpus de prueba con antecedentes conocidos para medir omisiones.