# E4 — Experimentación y validación

**Estado:** borrador de diseño, no aprobado íntegramente.  
**Requisitos ya acordados:** evitar pruebas innecesariamente repetidas, contrastar con lo existente, conservar resultados positivos y negativos y no declarar mejoras sin evidencia (DEC-0002, DEC-0007).

## 1. Admisión a experimentación (PROPUESTA)

Un experimento solo puede programarse si existe:
- pregunta e hipótesis con ID;
- expediente actualizado de antecedentes y justificación de por qué una prueba añade información;
- protocolo de referencia o baseline, objetivos, métricas y criterio de decisión;
- recursos, riesgos y permisos compatibles con la política activa;
- estrategia de preservación y recuperación de resultados.

**Excepción etiquetada:** reproducciones de referencia, mediciones diagnósticas y pruebas exploratorias justificadas pueden no buscar una innovación; registrar explícitamente su finalidad y criterios de interpretación.

## 2. Protocolo previo

Para cada `EXP-xxxx` redactar antes de ejecutarlo:
- objetivo, hipótesis y mecanismos alternativos;
- implementación exacta a evaluar, versión de código y dependencias;
- entradas: dataset, licencia, origen, acceso y hashes; condiciones, hardware;
- baseline de literatura o implementación, criterios de comparabilidad;
- variables, parámetros y valores, semillas aleatorias, repeticiones;
- métricas primarias/secundarias y dirección deseada; márgenes/tolerancias;
- controles, ablaciones si aportan causalidad, análisis de sensibilidad;
- plan de análisis y criterio de éxito/fallo/inconcluso;
- presupuesto máximo, duración y condiciones de interrupción;
- rutas de artefactos, datos crudos y verificación de integridad.

Los parámetros no conocidos antes de ejecutar se marcan como `unspecified`, no se inventan. Si cambian luego, se abre una revisión de protocolo y se distingue exploratorio de confirmatorio.

## 3. Benchmarks justos

Comprobar que el baseline es pertinente al problema, versión, dataset y condiciones. No usar una versión obsoleta o mal configurada como única referencia para declarar superioridad.

Cuando las métricas sean incomparables, presentar resultados separados en vez de atribuir una mejora global. Si la herramienta presenta varios compromisos (calidad/velocidad/memoria/robustez), registrar frontera de Pareto o ventajas por condición según corresponda.

Conservar evidencia de reproducción de terceros o indicar claramente que se utilizaron resultados publicados no reproducidos.

## 4. Ejecución y fallos

Cada intento debe tener ID propio, iniciado/finalizado, actor/herramienta, entorno, consumo y referencia a protocolo. Estados propuestos:
`planned`, `authorized`, `running`, `interrupted`, `failed_infrastructure`, `failed_hypothesis`, `inconclusive`, `succeeded`, `archived`.

No clasificar un fallo de infraestructura como refutación científica. No promover una mejora por una sola ejecución sin comprobar consistencia/repetibilidad apropiada al campo.

## 5. Resultados y análisis

Guardar mediciones **crudas** y transformaciones para producir figuras o agregados; diferencias con baseline, dispersión/incertidumbre pertinente, costos, límites, anomalías y resultados negativos. Un gráfico sin datos crudos y procedencia es evidencia incompleta.

Comparar resultados contra protocolo y criterios definidos **antes** de la prueba. Cuando se explore de forma abierta, describir las conclusiones como exploratorias y generar una nueva prueba confirmatoria antes de afirmar mejora general.

## 6. Dictamen y publicación

Un experimento puede concluir:
- `supported`: resultados consistentes con hipótesis en el alcance evaluado;
- `not_supported`: no se observa el efecto esperado;
- `inconclusive`: evidencia insuficiente o ambigua;
- `invalid`: el método o ejecución no permite interpretar el resultado.

La decisión `promote_to_candidate` requiere referencias a pruebas pertinentes y revisión de regresión. El paso de candidato a versión estable también depende del contrato funcional y del nivel de autoridad acordado; no lo determina un prompt aislado.

## 7. Casos de prueba documental

- E01: baseline anticuado → dictamen no comparativo.
- E02: error de ejecución → `failed_infrastructure`, no `not_supported`.
- E03: cambio de parámetros post hoc → conserva revisión y carácter exploratorio.
- E04: éxito en una métrica con regresión grave en otra → no declarar superioridad general.
- E05: el resultado ya existe en literatura; usar/reproducir si aporta conocimiento, no anunciar novedad.

## Pendientes de diseño
- Clases de experimento admisibles y límites para experimentos no computacionales.
- Política de recursos y presupuesto, umbrales, repeticiones, métodos estadísticos por dominio.
- Qué evidencia exige el supervisor para autorizar `promote_to_candidate`.
- Estrategia para adquirir y almacenar benchmarks/datasets respetando sus licencias.