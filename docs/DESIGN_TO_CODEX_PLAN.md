# Plan de diseño para entregar Investigador a Codex

**Estado:** plan de trabajo definido; especificaciones funcionales y prompts aún incompletos.  
**Fecha:** 2026-11-12.  
**Fase:** diseño exclusivamente. **No autoriza implementación**, cambios en OpenClaw, cron, pruebas operativas ni trabajo de Codex.

## Objetivo y división de responsabilidades

Diseñar un agente universal de investigación y desarrollo: recibe **metas** o **temas**, revisa en profundidad antecedentes, genera y verifica hipótesis, desarrolla experimentos justificados, compara con soluciones existentes, conserva resultados negativos y oportunidades laterales, y registra todos los pasos de modo reproducible y consultable en Obsidian/GitHub.

- **Usuario + ChatGPT:** investigación previa, selección de criterios, todas las decisiones funcionales, todos los prompts exactos, reglas de operación, datos, permisos y criterios de aceptación.
- **GitHub:** fuente de verdad de las decisiones acordadas y especificaciones versionadas. Distinguir propuesta, acordado, descartado, pendiente y validado.
- **Codex (fase posterior):** implementa la especificación *cerrada*. Puede elegir detalles de ingeniería que no alteren el comportamiento. No diseña prompts, no inventa reglas ni resuelve ambigüedades funcionales por cuenta propia; informa bloqueos para que se resuelvan en diseño.
- **OpenClaw (fase posterior):** plataforma de ejecución de Investigador; no se configura ni modifica hasta autorización expresa.

Ver [DEC-0005](DECISIONS.md), [DEC-0006](DECISIONS.md), [DEC-0007](DECISIONS.md) y [DEC-0008](DECISIONS.md). Las etapas de este documento son **etapas de especificación**; [ROADMAP.md](ROADMAP.md) describe una hoja de ruta preliminar de *implementación*, no el trabajo que se ejecuta ahora.

## Orden de prioridad y criterio para pedir decisiones al usuario

El orden operativo del trabajo de diseño privilegia **E1–E4 y E7**: experiencia del encargo, antecedentes, hipótesis, experimentación, evaluación y prompts. La autonomía, almacenamiento y tecnología de soporte se diseñan para **servir a ese ciclo**, sin convertir incidencias de mensajería o detalles de APIs en el centro del proyecto.

Resolver técnicamente lo ordinario (reintentos, codificación, formatos, estructura interna, temporizadores, errores recuperables) y presentarlo como especificación revisable. Solicitar decisiones al usuario solamente si afectan la finalidad del Investigador, el presupuesto, la privacidad, una autorización, o una elección científica significativa. No convertir cada detalle del diseño en una pregunta.

Documento principal del comportamiento: [`spec/CORE_RESEARCH_LOOP.md`](../spec/CORE_RESEARCH_LOOP.md).

## Método de trabajo por etapa

1. Recuperar las decisiones existentes y evidencias de referencia.
2. Delimitar preguntas aún no resueltas; investigar alternativas actuales cuando resulte necesario.
3. Debatir opciones y consecuencias con el usuario; no convertir una propuesta del asistente en acuerdo.
4. Registrar en GitHub **solo decisiones realmente acordadas**, con fecha, estado, justificación y relaciones. Mantener hipótesis y alternativas aparte.
5. Redactar la especificación exigible y sus ejemplos, esquemas o casos límite.
6. Revisar consistencia, ambigüedad y trazabilidad; declarar qué queda pendiente.
7. Marcar la etapa **cerrada para diseño** solo si sus criterios de salida se cumplen.

Los documentos podrán corregirse por decisiones posteriores; las sustituciones conservarán historial y motivo.

## Etapas y entregables

### E1. Contrato funcional y experiencia de uso
**Definir:** entrada como meta concreta o tema abierto; alcance inicial; expectativas; autonomía permitida; comunicaciones; capacidad de priorizar; cartera de investigaciones futuras; estados de meta cumplida, investigación cerrada y concluida sin éxito; manejo de encargos simultáneos y cambios del usuario.  
**Entregable:** `spec/01-functional.md`, escenarios completos con entradas/salidas.  
**Salida:** cada caso habitual y límite tiene comportamiento explícito; lo no definido está listado.

### E2. Investigación documental del estado del arte
**Definir:** selección adaptable de fuentes por disciplina; estrategias de búsqueda léxica/semántica, citas, código, patentes, resultados negativos; registro literal de consultas, filtros, cobertura y fechas; deduplicación; clasificación de calidad; contradicciones; límites y criterios para detener o reabrir la revisión.  
**Entregable:** `spec/02-prior-art.md` y plantillas de expediente bibliográfico.  
**Salida:** se puede reconstruir cómo se halló, descartó o no encontró cada antecedente relevante, sin confundir ausencia de resultados con novedad.

### E3. Hipótesis, creatividad y control de novedad
**Definir:** obtención de ideas nuevas/combinadas; revisión focalizada de equivalencias conceptuales y funcionales; criterios para aprobar, reformular, posponer, reutilizar o descartar; prioridades y valor informativo esperado; comunicación y registro de oportunidades laterales.  
**Entregable:** `spec/03-hypotheses.md`, árbol de decisiones y casos comparativos.  
**Salida:** ningún experimento pasa a diseño sin expediente de antecedentes y justificación verificable; reproducciones justificadas son posibles.

### E4. Ciclo experimental y evaluación
**Definir:** baselines, referencias, datasets, métricas por dominio, reproducibilidad, semillas, versiones, controles, ablaciones cuando apliquen, comparación justa, aceptación de mejoras, fallos, conclusiones negativas y cierres.  
**Entregable:** `spec/04-experiments.md`, contratos de experimento y evaluación.  
**Salida:** resultados pueden relacionarse con código, entorno, parámetros y evidencia; criterios de éxito/fallo están definidos antes de ejecutar.

### E5. Memoria, conocimiento y trazabilidad
**Definir:** entidades (fuente, hallazgo, pregunta, hipótesis, experimento, decisión, auditoría, oportunidad, versión), IDs, relaciones, estados, procedencia, revisión histórica, índices, almacenamiento de grandes datos, backups y retención; consulta humana en Obsidian y consumo estructurado por el agente; aislamiento por proyecto y conocimiento transferible.  
**Entregables:** `spec/05-knowledge.md`, esquemas en `spec/schemas/`, plantillas Markdown/YAML y mapa de navegación en `vault/`.  
**Salida:** puede reconstruirse una cadena fuente → hipótesis → experimento → decisión → versión sin acceder al historial de chat; las fuentes no comprobadas están marcadas.

### E6. Orquestación, autonomía y recuperación
**Definir:** máquina de estados, transiciones, planificador, ciclos, prioridad entre proyectos, límites de tiempo/costo/recursos, paralelismo, interrupción/reanudación, idempotencia, errores, reintentos, bloqueos, dependencia de aprobaciones y cuándo notificar al usuario.  
**Entregable:** `spec/06-autonomy.md` con tablas de transición y casos de recuperación.  
**Salida:** cada estado, fallo y reanudación tiene respuesta determinada; ningún trabajo se pierde por depender del contexto conversacional.

### E7. Prompts y contratos de interacción
**Definir:** texto literal, variables admitidas, procedencia de cada variable, reglas de composición y truncamiento, roles, instrucciones persistentes, prompts de exploración, búsqueda, extracción, hipótesis, verificación, experimento, auditoría, reportes y recuperación; salidas estructuradas; manejo de errores de parsing; compatibilidad de modelos.  
**Entregables:** `spec/07-prompts/` (prompts exactos y versionados), `spec/07-prompt-contracts.md` (entradas, salidas, orden de composición y ejemplos).  
**Salida:** Codex no tiene que redactar, completar ni interpretar ningún prompt o regla conductual. Se probará coherencia con límites reales de contexto del modelo elegido.

### E8. Infraestructura, OpenClaw e integraciones
**Definir:** arquitectura concreta; separación del agente principal; versión objetivo de OpenClaw y formas de instalación; archivos de workspace; skills y herramientas permitidas; GitHub (lectura/escritura y repositorios por proyecto), Obsidian, modelos y fallback, API y gastos, sandbox, ejecución Windows/local vs remota, horarios, límites CPU/RAM/GPU y protección de credenciales.  
**Entregables:** `spec/08-deployment.md` y configuraciones **de referencia** sin secretos, más matriz de permisos.  
**Salida:** cada componente, dependencia, secreto y permiso tiene lugar y propósito definidos; se han revisado las interfaces de OpenClaw pertinentes. **No se aplica ninguna configuración aún.**

### E9. Supervisión humana y auditorías ChatGPT
**Definir:** auditoría breve y profunda, periodicidad o disparadores (todavía a decidir), acceso a evidencias, controles de novedad/reproducibilidad, severidades, recomendaciones, tratamiento de discrepancias entre modelos, informes, notificaciones y permisos para corregir o bloquear.  
**Entregable:** `spec/09-auditing.md`, prompts exactos de auditoría en `spec/07-prompts/`, formatos y flujos de resolución.  
**Salida:** auditorías verifican evidencia concreta y no declaran una ejecución validada únicamente por el relato del agente.

### E10. Verificación documental y paquete cerrado para Codex
**Definir:** matriz de requisitos ↔ decisiones ↔ prompts ↔ componentes ↔ pruebas; casos de aceptación, datasets de control, resultados esperados, situaciones adversas (antecedente omitido, duplicado semántico, experimento irreproducible, interrupción, conflicto entre fuentes, fallos de API, falta de permiso); estrategia de entrega/versionado.  
**Entregables:** `handoff/IMPLEMENTATION_SPEC.md`, `handoff/ACCEPTANCE_MATRIX.md`, `handoff/FILE_MANIFEST.md`, `handoff/CODEX_INSTRUCTIONS.md`, y revisión final de todos los archivos.  
**Salida:** cada funcionalidad está especificada sin decisiones conductuales pendientes, referencias internas resuelven, prompts son definitivos, criterios de aceptación son observables, limitaciones quedan explícitas y usuario aprueba formalmente el traspaso.

## Frontera entre Codex y OpenClaw

**No confundir los dos posibles `AGENTS.md`:**
- `AGENTS.md` del repositorio, cuando se redacte, será orientación de **implementación para Codex**.
- `openclaw/workspace/AGENTS.md` (o la ruta final que acordemos) será parte del **prompt operativo de Investigador**.
- También se definirán literalmente `SOUL.md`, `IDENTITY.md`, `USER.md` y otros archivos de OpenClaw que el diseño requiera.

La documentación oficial confirma que OpenClaw lee archivos de bootstrap desde el workspace y que Codex usa `AGENTS.md` del repositorio para guía de trabajo:
- https://docs.openclaw.ai/concepts/agent-workspace
- https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide

**Nota:** si cambia la versión de OpenClaw o de modelos antes de implementar, se revisan las interfaces y limitaciones afectadas antes de congelar la especificación.

## Puntos transversales obligatorios

- **Datos privados:** jamás publicar tokens, llaves, conversaciones privadas, rutas personales ni perfiles del usuario en el repositorio público.
- **Decisiones auditable:** no confundir ejemplo, propuesta, requisito acordado y resultado comprobado.
- **Experimentos existentes:** revisión bibliográfica al inicio y revisión focalizada para cada hipótesis.
- **Costos:** especificar costos máximos y política de computación antes de habilitar autonomía.
- **Evidencia:** fechas, referencias, versiones, hashes y trazas recuperables.
- **Modelo:** no asumir que un modelo barato es adecuado para todos los juicios críticos.
- **Operación:** diferenciar proyecto diseñado, implementado, validado y publicado.

## Condiciones para declarar el diseño listo para Codex

- [ ] Todas las decisiones funcionales importantes constan como **acordadas**.
- [ ] Todos los prompts e instrucciones finales están escritos literalmente y versionados.
- [ ] Todos los esquemas y contratos tienen ejemplos válidos, inválidos y manejo de errores.
- [ ] Están fijados flujos y transiciones, sin reglas críticas por inventar.
- [ ] Hay protocolos verificables de antecedentes, novedad, experimentación y auditoría.
- [ ] Quedaron especificados seguridad, gastos, recursos, persistencia y recuperación.
- [ ] Cada requisito tiene prueba de aceptación y resultado esperado.
- [ ] Se comprobó consistencia entre el manifiesto, documentos, prompts y pruebas.
- [ ] El usuario autoriza expresamente comenzar la implementación.

**Próxima discusión sugerida:** E1, comportamiento ante metas y temas; definir interacciones, alcance, comunicaciones y cambios de prioridad. El orden puede revisarse por dependencias, sin adelantar implementación.
