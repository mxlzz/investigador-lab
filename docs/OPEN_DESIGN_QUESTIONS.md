# Preguntas abiertas de diseño — orden sugerido de decisión

**Estado:** alternativas para debatir, NO decisiones adoptadas.  
**Regla:** una pregunta respondida produce una decisión en `docs/DECISIONS.md` y actualiza sus documentos relacionados. No se entregan estas cuestiones a Codex para que las resuelva.

## A. Decisiones que sí requieren criterio del usuario

1. **Frontera de autonomía — RESUELTA (DEC-0010):** investigación, archivos, desarrollo, pruebas aisladas y ramas experimentales permitidos dentro de presupuestos, recursos y permisos aprobados. Requieren autorización: ampliación de permisos, exceso de presupuesto, configuración central de OpenClaw y versiones estables. **Pendiente:** límites cuantitativos y matriz concreta de permisos, no la frontera conceptual.
2. **Cuotas y gasto — RESUELTO (DEC-0011); inactividad local — RESUELTA (DEC-0016):** cuotas gratuitas disponibles, pagas a cero por defecto; cargas intensivas tras 15 minutos sin actividad y pausa controlada al regresar. Pendientes técnicos: detector Windows, umbrales de intensidad, pausas seguras y ejecución remota.
3. **Informe y alertas — RESUELTO (DEC-0020/0021):** un consolidado de todos los proyectos a las 20:00 `America/Argentina/Buenos_Aires` por Telegram, con copia consultable en OpenClaw. Alertas excepcionales solo por aprobaciones, fallos graves y descubrimientos extraordinarios. **Pendiente:** criterios objetivos de severidad y relevancia, reintentos y tolerancia al retraso. **Auditoría — RESUELTA EN CADENCIA (DEC-0022):** breve diaria, profunda por hito; faltan disparadores y autoridad.
4. **Concurrencia y priorización — RESUELTA EN PRINCIPIO (DEC-0017):** varios proyectos; usuario fija prioridades iniciales y agente reorganiza tareas y recursos dentro de límites. **Pendiente:** equidad, prioridad de urgencias, límites de paralelismo y cambios de prioridad expresa.
5. **Éxito y publicación — RESUELTO (DEC-0019):** agente declara automáticamente meta cumplida cuando supera pruebas acordadas; usuario autoriza publicación estable. **Pendiente:** papel del auditor antes del dictamen, tipos de metas y evidencia requerida.
6. **Visibilidad — DECIDIDA CON PREFERENCIA PÚBLICA (DEC-0014):** elegir visibilidad por proyecto, favoreciendo repositorios públicos para usar runners estándar gratuitos; privados cuando corresponda. Nunca publicar secretos o datos no autorizados. **Pendiente:** controles y decisión de publicación por tipo de artefacto.
7. **Continuidad remota — DECIDIDA (DEC-0023):** tareas compatibles siguen en GitHub Actions u otro entorno remoto gratuito autorizado aun con PC apagada; no implica ejecutar todo OpenClaw remotamente. **Pendiente:** coordinación persistente, categorías de tareas, credenciales, datos que pueden procesarse remotamente, tolerancia a scheduler; guía de instalación y actualizaciones.

## B. Análisis técnico que podemos seguir completando antes de consultarte

- Revisar APIs, capacidades y limitaciones exactas de versión OpenClaw.
- Comparar arquitectura de investigadores previos (incluida AI Scientist v3) y diseñar pruebas de antecedentes omitidos.
- Diseñar esquema de registros/relaciones y resolver la colisión de IDs `DEC`.
- Especificar subesquemas de salida por fase y ejemplos válidos/invalidos.
- Diseñar protocolo de búsqueda con medición de cobertura por campo.
- Elaborar fixtures de prueba para falsos positivos, duplicados, fallos, interrupciones y seguridad.
- Concretar paquete manual/automatizado **a nivel de contrato**, sin implementar instalador hasta autorización.

## C. Errores o inconsistencias detectados en el borrador

1. **Incompatibilidad superficial resuelta en borrador:** `spec/schemas/phase-result.schema.json` ahora discrimina once variantes por `phase`, con campos específicos. **Sigue sin ser contrato implementable**: falta tipar objetos anidados, validar referencias/acciones y comprobar compatibilidad real con el modelo. Consultar `spec/schemas/README.md`.
2. `DEC-xxxx` designa decisiones del propio diseño y se propuso también para decisiones de proyectos. **Riesgo de colisión**; decidir IDs con ámbito.
3. `openclaw AGENTS.md` y `repo AGENTS.md` comparten nombre pero destinatario distinto. Mantener manifest claramente separado.
4. Repositorio público de diseño no implica permiso para publicar todas las investigaciones futuras: hay que definir límite.
5. «Investigación exhaustiva» sin una medida de cobertura y una estrategia de actualización no puede validarse como objetivo absoluto.

## D. Criterio para solicitar intervención

Preguntar cuando una elección cambie la autoridad del agente, costos, privacidad, compromisos del usuario o el significado de éxito. Para detalles de ingeniería sin impacto funcional, continuar investigando y proponiendo alternativas justificadas.

**Próximas decisiones a consultar:** qué constituye un hito importante para auditoría profunda, autoridad del auditor ante errores críticos, qué datos pueden salir a ejecutores remotos y cómo obtener continuidad del coordinador. También faltan umbrales de recursos, límites de paralelismo y política de almacenamiento de evidencia.