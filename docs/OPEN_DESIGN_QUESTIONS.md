# Preguntas abiertas de diseño — orden sugerido de decisión

**Estado:** alternativas para debatir, NO decisiones adoptadas.  
**Regla:** una pregunta respondida produce una decisión en `docs/DECISIONS.md` y actualiza sus documentos relacionados. No se entregan estas cuestiones a Codex para que las resuelva.

## A. Decisiones que sí requieren criterio del usuario

1. **Frontera de autonomía — RESUELTA (DEC-0010):** investigación, archivos, desarrollo, pruebas aisladas y ramas experimentales permitidos dentro de presupuestos, recursos y permisos aprobados. Requieren autorización: ampliación de permisos, exceso de presupuesto, configuración central de OpenClaw y versiones estables. **Pendiente:** límites cuantitativos y matriz concreta de permisos, no la frontera conceptual.
2. **Cuotas y gasto — RESUELTO (DEC-0011); PC libre — RESUELTO EN PRINCIPIO (DEC-0012):** cuotas gratuitas disponibles, pagas a cero por defecto y cargas intensivas locales solo si la PC está libre. Pendientes de precisión: umbrales, interrupción, horarios y tareas remotas.
3. **Informe diario y alertas — RESUELTO (DEC-0015):** un informe diario y avisos importantes. **Pendiente:** hora, canal, umbral de alerta; la auditoría externa de ChatGPT todavía no tiene cadencia ni autoridad acordada.
4. **Concurrencia — RESUELTA EN PRINCIPIO (DEC-0013):** varios proyectos con prioridades y recursos compartidos. **Pendiente:** criterios de priorización, límite de tareas simultáneas y reparto de recursos.
5. **Éxito y cierre:** ¿Investigador declara automáticamente `meta_cumplida` si se verifican criterios acordados, o solicita confirmación final?
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

**Próximas decisiones a consultar:** definir operativamente «PC libre» y qué hacer al volver a usarla; criterio de prioridad entre proyectos; horario/canal del informe; declaración de meta cumplida y autoridad de auditoría.