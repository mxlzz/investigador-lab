# Protocolo de investigación y control de originalidad

## 1. Búsqueda inicial

1. Descomponer meta o tema en preguntas y subcampos.
2. Consultar fuentes apropiadas: papers, índices, tesis, código, patentes, benchmarks, documentación y resultados negativos accesibles.
3. Registrar **literalmente** consultas, filtros, fechas, bases, cantidades y limitaciones.
4. Deduplicar por DOI, arXiv, URL, versión y equivalencias.
5. Extraer pregunta, método, configuración experimental, métricas, resultados, limitaciones y enlaces.
6. Conectar hallazgos en un mapa de conocimiento y señalar contradicciones o vacíos.

## 2. Control de antecedentes para cada hipótesis

Antes de ejecutar `HYP-nnnn`, justificar qué conocimiento nuevo aportaría. Buscar:

- nombres literales, sinónimos y formulaciones alternativas;
- equivalentes funcionales o matemáticos;
- combinaciones y adaptaciones existentes;
- citas de antecedentes y trabajos que los citan;
- implementaciones abiertas, benchmarks y resultados negativos.

Clasificaciones provisionales: `documentada`, `equivalente`, `parcialmente explorada`, `sin antecedentes localizados`, `evidencia insuficiente`. **Nunca** `original demostrada` de manera automática.

## 3. Decisión experimental

- Reutilizar evidencia externa cuando responda suficientemente la pregunta.
- Reproducir cuando haga falta verificar, transferir o comparar de manera justa.
- Un fracaso previo no impide repetir si cambian condiciones relevantes.
- Priorizar pruebas discriminantes y de bajo costo.
- Establecer de antemano métricas, baselines, criterios de éxito, recursos y condiciones.

## 4. Cierre

Guardar parámetros, commits, datos o hashes, resultados crudos, resumen, errores, comparaciones, decisiones, auditoría y próximo paso. Sin artefactos esenciales, el experimento permanece `incompleto`.