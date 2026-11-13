# Núcleo científico de Investigador — diseño operativo

**Estado:** especificación de diseño en revisión. Contiene requisitos ya acordados (véanse DEC-0002, 0006, 0007, 0008, 0010, 0019 y 0024–0026) y reglas operativas **propuestas** para hacerlos implementables. **No es una implementación ni autoriza ejecutar experimentos ahora.**

## Objetivo

Investigar y desarrollar de forma autónoma, con rigor y capacidad de aprender de lo ya descubierto por otros. El resultado esperado es progreso **real y demostrable** en la meta o conocimiento que se le encomienda, no volumen de texto, número de llamadas al LLM ni cantidad de experimentos ejecutados.

Un encargo puede ser: 
- **Meta:** «desarrollá un denoiser que supere métodos relevantes bajo criterios comprobables». El usuario establece la finalidad; el agente estudia, propone rutas técnicas, realiza experimentos autorizados, compara y mejora iterativamente.
- **Tema:** «investigá qué posibilidades tienen los agentes que aprenden en entornos abiertos». El agente estudia el campo, forma preguntas y desarrolla líneas justificadas dentro del tema.

**No imponer al usuario un formulario técnico inicial** para comenzar. Si el encargo es amplio, el agente puede investigar antecedentes y proponer criterios de calidad para concretarlo. Solo pide una decisión humana cuando cambia la meta o requiere permiso/recurso que no tiene.

## Ciclo principal

### 1. Comprender y delimitar el problema

Recuperar encargo **literal** y criterios explícitos. Identificar qué quiere conseguir el usuario, qué está sin precisar, qué datos hay disponibles y qué restricciones ya están aprobadas.

**Salida mínima:** una síntesis del encargo, preguntas de investigación, criterios explícitos y puntos por esclarecer. Si el usuario pide «mejor», «más avanzado» o «innovador», **no** se presupone una única métrica; el agente identifica dimensiones relevantes y métodos de comparación antes de proclamar superioridad.

### 2. Investigar lo que ya existe

Buscar y contrastar sistemáticamente: publicaciones, código fuente, benchmarks, implementaciones, resultados negativos accesibles, documentación, tesis y trabajos relacionados por otros nombres. Localizar no solo soluciones directas sino técnicas de disciplinas vecinas transferibles.

- Distinguir **hallado**, **revisado**, **verificado experimentalmente** y **no accesible**.
- Comparar mecanismos, no solo nombres. Una variante terminológica puede ser el mismo método.
- Identificar qué está resuelto, qué requiere mejora, qué falla y bajo qué condiciones.
- Identificar implementaciones reutilizables y sus restricciones/licencias.
- Incluir conocimiento reciente y reabrir la búsqueda cuando aparezcan técnicas nuevas.

**Salida mínima:** mapa de familias de métodos, mejores alternativas pertinentes, implementaciones y datasets disponibles, resultados comparables, fallas, contradicciones, incertidumbres y fuentes rastreables.

**Regla acordada:** la ausencia de trabajos encontrados no permite afirmar originalidad.

### 3. Elegir una estrategia con fundamento

A partir de lo investigado, proponer líneas posibles:
- **Adoptar** una solución existente si ya satisface lo pedido.
- **Reproducir o adaptar** una técnica para establecer un baseline justo o comprobar su transferencia a otro dominio.
- **Combinar o mejorar** mecanismos existentes si hay una hipótesis técnica plausible y valor esperado.
- **Investigar una pregunta abierta** si realmente falta evidencia.
- **Descartar o aplazar** propuestas redundantes, no comprobables o fuera de recursos.

La elección debe indicar **qué problema resuelve, por qué esa alternativa, qué evidencia existe, qué se espera aprender y qué recursos requiere**. No hace falta que una idea sea novedosa para ser útil; sí hace falta no adjudicarle originalidad injustificada.

### 4. Contrastar antecedentes de cada hipótesis

Antes de una prueba nueva, realizar una **revisión focalizada de equivalentes**: sinónimos, reformulaciones matemáticas, código, combinaciones y antecedentes en aplicaciones vecinas.

**Salida:** referencia de las búsquedas realizadas, resultado de comparación, diferencias reales y justificación de qué información aportaría la prueba. La reproducción de una técnica conocida está permitida cuando tiene valor como baseline o control (DEC-0002).

### 5. Diseñar y ejecutar la prueba apropiada

El agente prepara un experimento con:
- hipótesis y predicción observable;
- baseline actualizado y condiciones de comparación justas;
- entradas/datasets, versión de código, dependencias y entorno;
- métricas pertinentes y criterio para interpretar resultados;
- costos, límites y permisos ya autorizados;
- datos crudos, parámetros, logs, errores y artefactos reproducibles.

**Acordado:** cuando el sistema funcione, podrá desarrollar código y ejecutar pruebas de forma autónoma dentro de sandbox, presupuesto y recursos aprobados (DEC-0010). **No está autorizado ahora**: seguimos definiendo el producto.

Un fallo de infraestructura no refuta la hipótesis. Una mejora aislada no demuestra superioridad general.

### 6. Evaluar, aprender y decidir

Comparar resultados con las referencias apropiadas. Identificar aciertos, regresiones, casos límite y explicaciones alternativas. Si el resultado es ambiguo, diseñar una prueba discriminante en lugar de declarar éxito.

Tras cada ciclo, decidir fundadamente si conviene:
- continuar una línea;
- modificar la hipótesis;
- volver a la literatura;
- aprovechar otro método;
- conservar un resultado negativo;
- preparar una versión candidata;
- suspender o concluir la investigación según criterios acordados.

**La evaluación del siguiente paso debe usar resultados reales, no la evaluación optimista del propio modelo.**

### 7. Persistir conocimiento y continuar

Archivar hallazgos, preguntas, hipótesis, código, experimentos, decisiones y oportunidades futuras con referencias estables. La base debe poder consultarse desde Obsidian y ser leída por el agente para retomar sin reconstruir la conversación.

Con meta concreta, una idea lateral se conserva en cartera y comunica sin desviar la misión (DEC-0006). Con tema abierto, el agente puede abrir nuevas preguntas dentro del alcance.

Una decisión de cierre se basa en criterios y evidencia, no en cansancio, cantidad arbitraria de iteraciones o satisfacción conversacional.

## Regla de selección del próximo trabajo (PROPUESTA)

El planificador debe favorecer la **acción autorizada que más ayude a resolver la incertidumbre crítica o mejorar el resultado**, considerando:
1. relevancia para el objetivo del usuario;
2. evidencia que falta y diferencia entre alternativas;
3. resultados previos y dependencias;
4. coste/tiempo y recursos disponibles;
5. probabilidad de obtener información útil y posibilidad de verificarla.

Si un paper ya ofrece una respuesta suficiente, no hace falta replicarlo por rutina. Si hace falta un baseline comparable, reproducir puede ser la mejor acción. No obligar a recorrer todas las etapas en cada vuelta cuando una simple consulta o prueba controlada resuelve una cuestión.

## Ejemplo de extremo a extremo: denoiser (ILUSTRATIVO; SIN RESULTADOS REALES)

**Entrada:** «Desarrollá un denoiser que mejore a las alternativas actuales sin perder detalles».

**Conducta esperada:**
1. Identificar que «mejorar» podría significar detalle, artefactos, fidelidad, robustez, tiempo, memoria, características de escenas y compatibilidad. Presentar criterio propuesto, no inventar definición única.
2. Revisar estado del arte de denoising para render y alternativas disponibles —incluidas implementaciones en Blender, OIDN y otras pertinentes— con **versiones, evidencia y condiciones actuales**.
3. Seleccionar un conjunto comparativo razonable de imágenes/escenas, niveles de muestras y tipos de ruido. Reservar imágenes de control no utilizadas para ajustar parámetros cuando corresponda.
4. Reutilizar algoritmos abiertos pertinentes si su licencia y compatibilidad lo permiten. Identificar qué se ha intentado antes y cuáles son los puntos débiles reales.
5. Formular varias hipótesis técnicas específicas y revisar antecedentes de cada una.
6. Ejecutar las pruebas con benchmarks correctos y scripts/entornos reproducibles.
7. Conservar resultados peores y mejores, iterar solo sobre líneas justificadas y explicar dónde mejora o pierde respecto de las referencias.
8. Declarar `meta_cumplida` únicamente si se satisface el contrato medible acordado; requerir aprobación humana y gate de auditoría para versión estable.

**No sería aceptable:** empezar creando un denoiser desde cero sin estudiar precedentes, compararlo con una baseline mal configurada, declarar victoria por una imagen bonita ni seguir iterando eternamente sin medir progreso.

## Ejemplo: tema abierto (ILUSTRATIVO)

**Entrada:** «Investigá agentes autónomos que aprenden a interactuar con mundos abiertos».

1. Mapear sistemas existentes, métodos de memoria, aprendizaje, planificación, experimentos y limitaciones.
2. Elegir preguntas investigables dentro del tema, fundamentando por qué son importantes y qué ya está resuelto.
3. Construir diseños de pruebas con valor informativo si los recursos lo permiten; si no, producir síntesis y preguntas fundadas.
4. Registrar conexiones entre proyectos y descubrimientos laterales sin transformarlos unilateralmente en productos o compromisos ajenos al tema.
5. Entregar avances y revisión de agenda; no inventar el requisito de crear software específico.

## Pruebas funcionales prioritarias (PROPUESTA)

- **C01 — Antedecente directo:** se proporciona un método que ya resuelve la meta → Investigador detecta y evalúa reutilizarlo.
- **C02 — Nombre distinto, misma solución:** identifica que la variante no es novedosa, o deja claramente pendiente la verificación.
- **C03 — Sin literatura suficiente:** no proclama originalidad, informa cobertura y plan de ampliación.
- **C04 — Baseline injusto:** detecta que no se puede atribuir superioridad.
- **C05 — Experimento desfavorable:** conserva resultados, explica qué hipótesis se debilita y replanifica.
- **C06 — Hallazgo imprevisto fuera de meta:** archiva oportunidad y no abandona el objetivo activo.
- **C07 — Reanudación:** nuevo ciclo recupera hipótesis, código y resultados de archivos sin depender del chat.
- **C08 — Éxito sin publicación:** reconoce meta cumplida si pruebas y criterios lo avalan, pero no publica release estable sin autorización ni sin resolver bloqueo crítico.

## Qué sigue por definir sin molestar al usuario por trivialidades

Detallar los prompts literales y la selección de herramientas necesarias para este ciclo, especificar modelos/contratos estrictos y preparar pruebas de aceptación reproducibles. Las decisiones genuinamente fundamentales (definición de la meta, compromisos de calidad o recursos nuevos) se consultarán al usuario; la organización interna, archivos e incidencias triviales se resuelven técnicamente y se documentan.

**Este documento es un diseño propuesto, no un resultado científico ni un sistema operativo.**


## Adenda de diseño — control estratégico longitudinal (propuesta 2026-11-13)

Los controles de antecedentes por hipótesis y de `next_cycle` no sustituyen una revisión de **línea completa frente a meta y alternativas**. Se propone `spec/13-revision-estrategica.md`: checkpoint disparado por cambios importantes, progreso insuficiente, repetición instrumental, nuevos antecedentes o costo de oportunidad, con intervalo de respaldo aún por aprobar. Puede recomendar reutilizar, pivotar o aparcar una línea y debe preservar el historial. Está en diseño: **no modifica la implementación actual**.
