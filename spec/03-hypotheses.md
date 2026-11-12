# E3 — Hipótesis, creatividad y contraste de originalidad

**Estado:** borrador.  
**Requisito ACORDADO:** cada idea se contrasta con lo existente antes de experimentar; las oportunidades laterales se preservan y no desplazan la meta (DEC-0002, DEC-0006).

## 1. Expediente de hipótesis (PROPUESTA)

Cada hipótesis tiene:
- pregunta concreta y mecanismo causal o explicación esperada;
- resultados observables que la apoyarían o refutarían;
- supuesto de partida y fuente de inspiración, si existe;
- diferencias con métodos existentes, expresadas operacionalmente;
- alcance y condiciones (no prometer que funciona fuera de ellas);
- costo/riesgo y valor de información de una prueba;
- vínculos a fuentes, hallazgos, preguntas y proyectos.

Una propuesta de combinación de métodos debe describir las interacciones que la distinguen de simplemente usar ambos por separado.

## 2. Revisión focalizada obligatoria (PROPUESTA)

Antes de convertir hipótesis → experimento:
1. Construir varias consultas: nombres, sinónimos, conceptos equivalentes, formulación matemática, aplicaciones y variantes combinatorias.
2. Revisar antecedentes directos e indirectos, resultados negativos, implementaciones y baselines.
3. Identificar condiciones que cambian las comparaciones (dataset, escala, versión, hardware, objetivos, métricas).
4. Clasificar: `documentada`, `equivalente`, `parcialmente_estudiada`, `sin_antecedente_localizado`, `evidencia_insuficiente`.
5. Documentar consultas, fuentes, límites y argumento **por qué la prueba produciría información nueva**.
6. Separar «novedad para el agente» de «novedad para la literatura»; esta última nunca se declara garantizada.

## 3. Puertas de decisión (PROPUESTA)

- **Reutilizar**: literatura/implementación resuelve el problema, con procedencia y límites.
- **Reproducir**: hace falta verificar, trasladar de contexto o establecer baseline justo; describir explícitamente que es una reproducción.
- **Diferenciar**: método relacionado pero condiciones o mecanismo sustancialmente distintos; definir qué diferencia se comprueba.
- **Experimentar**: antecedente insuficiente para responder a una pregunta valiosa y testable.
- **Posponer**: evidencia o recursos insuficientes; guardar expediente completo.
- **Descartar**: duplicación sin valor informativo o contradicción decisiva; no borrar.
- **Escalar**: requiere autorización, revisión de seguridad o acceso fuera de alcance.

## 4. Ordenación de oportunidades (PROPUESTA)

Utilidad esperada para la meta/tema, calidad de antecedentes, valor informativo, verificabilidad, costo, riesgos, incertidumbre y dependencia de otros experimentos. Evitar convertir una puntuación arbitraria en verdad científica: conservar razones y sensibilidad de la prioridad.

## 5. Derivaciones laterales (ACORDADO)

Una oportunidad surgida de otro trabajo se registra como `opportunity` vinculada al punto de origen y se comunica al usuario. Si pertenece fuera de la meta concreta, queda en cartera; no se ejecuta como un proyecto independiente hasta autorización. Puede recibir una revisión documental preliminar para fundamentar su interés.

## 6. Contrapruebas (BORRADOR)

- H01: dos artículos usan nombres distintos para un procedimiento equivalente.
- H02: el método se probó en otras condiciones; distingue novedad de transferencia.
- H03: una reproducción está justificada pese a antecedentes existentes.
- H04: una idea lateral prometedora no desplaza la investigación principal.
- H05: un paper afirma un beneficio que no sostienen sus datos.
- H06: no encuentra antecedentes; registra `sin antecedente localizado`, jamás `original`.

## Pendientes
- Cómo se asigna un presupuesto de comprobación por hipótesis.
- Cuándo una revisión adicional es suficiente para tomar una decisión.
- Si una hipótesis puede realizar experimentos puramente exploratorios sin métrica previa y con qué restricciones.
- Cómo arbitrar conflictos entre agentes evaluadores.