# Preguntas abiertas de diseño — orden sugerido de decisión

**Estado:** alternativas para debatir, NO decisiones adoptadas.  
**Regla:** una pregunta respondida produce una decisión en `docs/DECISIONS.md` y actualiza sus documentos relacionados. No se entregan estas cuestiones a Codex para que las resuelva.

## A. Decisiones que sí requieren criterio del usuario

1. **Frontera de autonomía — RESUELTA (DEC-0010):** investigación, archivos, desarrollo, pruebas aisladas y ramas experimentales permitidos dentro de presupuestos, recursos y permisos aprobados. Requieren autorización: ampliación de permisos, exceso de presupuesto, configuración central de OpenClaw y versiones estables. **Pendiente:** límites cuantitativos y matriz concreta de permisos, no la frontera conceptual.
2. **Cuotas y gasto — RESUELTO (DEC-0011); inactividad local — RESUELTA (DEC-0016):** cuotas gratuitas disponibles, pagas a cero por defecto; cargas intensivas tras 15 minutos sin actividad y pausa controlada al regresar. Pendientes técnicos: detector Windows, umbrales de intensidad, pausas seguras y ejecución remota.
3. **Informe diario y canal — RESUELTO (DEC-0018):** envío diario por Telegram con registro consultable en OpenClaw y avisos importantes (DEC-0015). **Pendiente:** horario, zona horaria, condiciones de alerta, destino Telegram, cadencia y autoridad de auditoría independiente.
4. **Concurrencia y priorización — RESUELTA EN PRINCIPIO (DEC-0017):** varios proyectos; usuario fija prioridades iniciales y agente reorganiza tareas y recursos dentro de límites. **Pendiente:** equidad, prioridad de urgencias, límites de paralelismo y cambios de prioridad expresa.
5. **Éxito y publicación — RESUELTO (DEC-0019):** agente declara automáticamente meta cumplida cuando supera pruebas acordadas; usuario autoriza publicación estable. **Pendiente:** papel del auditor antes del dictamen, tipos de metas y evidencia requerida.
6. **Visibilidad — DECIDIDA CON PREFERENCIA PÚBLICA (DEC-0014):** elegir visibilidad por proyecto, favoreciendo repositorios públicos para usar runners estándar gratuitos; privados cuando corresponda. Nunca publicar secretos o datos no autorizados. **Pendiente:** controles y decisión de publicación por tipo de artefacto.
7. **Interfaz y despliegue final:** grado de interacción gráfica sin terminal, capacidad de ejecutar con PC apagada, quién autoriza instalación, actualización y desinstalación.

## B. Análisis técnico que podemos seguir completando antes de consultarte

- Revisar APIs, capacidades y limitaciones exactas de versión OpenClaw.
- Comparar arquitectura de investigadores previos (incluida AI Scientist v3) y diseñar pruebas de antecedentes omitidos.
- Diseñar esquema de registros/relaciones y resolver la colisión de IDs `DEC`.
- Especificar subesquemas de salida por fase y ejemplos válidos/invalidos.
- Diseñar protocolo de búsqueda con medición de cobertura por campo.
- Elaborar fixtures de prueba para falsos positivos, duplicados, fallos, interrupciones y seguridad.
- Concretar paquete manual/automatizado **a nivel de contrato**, sin implementar instalador hasta autorización.

## C. Errores o inconsistencias detectados en el borrador

1. `spec/schemas/phase-result.schema.json` tiene `additionalProperties: false` pero los prompts exigen campos específicos que no figuran en ese esquema. **No es un esquema de salida implementable todavía.** Debe resolverse antes del cierre de E7.
2. `DEC-xxxx` designa decisiones del propio diseño y se propuso también para decisiones de proyectos. **Riesgo de colisión**; decidir IDs con ámbito.
3. `openclaw AGENTS.md` y `repo AGENTS.md` comparten nombre pero destinatario distinto. Mantener manifest claramente separado.
4. Repositorio público de diseño no implica permiso para publicar todas las investigaciones futuras: hay que definir límite.
5. «Investigación exhaustiva» sin una medida de cobertura y una estrategia de actualización no puede validarse como objetivo absoluto.

## D. Criterio para solicitar intervención

Preguntar cuando una elección cambie la autoridad del agente, costos, privacidad, compromisos del usuario o el significado de éxito. Para detalles de ingeniería sin impacto funcional, continuar investigando y proponiendo alternativas justificadas.

**Próximas decisiones a consultar:** hora y zona horaria del informe, umbral de alertas; autoridad/frecuencia de auditoría externa, ejecución remota cuando la PC está apagada, y reserva de datos de proyectos públicos.