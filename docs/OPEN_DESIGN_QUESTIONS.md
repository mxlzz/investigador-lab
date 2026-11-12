# Preguntas abiertas de diseño — orden sugerido de decisión

**Estado:** alternativas para debatir, NO decisiones adoptadas.  
**Regla:** una pregunta respondida produce una decisión en `docs/DECISIONS.md` y actualiza sus documentos relacionados. No se entregan estas cuestiones a Codex para que las resuelva.

## A. Decisiones que sí requieren criterio del usuario

1. **Frontera de autonomía — RESUELTA (DEC-0010):** investigación, archivos, desarrollo, pruebas aisladas y ramas experimentales permitidos dentro de presupuestos, recursos y permisos aprobados. Requieren autorización: ampliación de permisos, exceso de presupuesto, configuración central de OpenClaw y versiones estables. **Pendiente:** límites cuantitativos y matriz concreta de permisos, no la frontera conceptual.
2. **Cuotas y gasto — RESUELTO (DEC-0011); inactividad local — RESUELTA (DEC-0016):** cuotas gratuitas disponibles, pagas a cero por defecto; cargas intensivas tras 15 minutos sin actividad y pausa controlada al regresar. Pendientes técnicos: detector Windows, umbrales de intensidad, pausas seguras y ejecución remota.
3. **Informe y alertas — RESUELTO (DEC-0020/0021/0027):** consolidado 20:00 `America/Argentina/Buenos_Aires` por Telegram con copia consultable en OpenClaw; ante fallo, reintentar tan pronto como sea posible sin duplicar. Alertas solo por aprobaciones, fallos graves y hallazgos extraordinarios. **Pendiente:** severidad, intervalos, entrega incierta y atrasos solapados. **Auditoría — DEC-0022/0024/0025:** breve diaria; profunda en mejoras importantes, cierres y publicación; puede bloquear release por error crítico. Falta protocolo de desbloqueo y contingencia.
4. **Concurrencia y priorización — RESUELTA EN PRINCIPIO (DEC-0017):** varios proyectos; usuario fija prioridades iniciales y agente reorganiza tareas y recursos dentro de límites. **Pendiente:** equidad, prioridad de urgencias, límites de paralelismo y cambios de prioridad expresa.
5. **Éxito y publicación — RESUELTO (DEC-0019):** agente declara automáticamente meta cumplida cuando supera pruebas acordadas; usuario autoriza publicación estable. **Pendiente:** papel del auditor antes del dictamen, tipos de metas y evidencia requerida.
6. **Visibilidad — DECIDIDA CON PREFERENCIA PÚBLICA (DEC-0014):** elegir visibilidad por proyecto, favoreciendo repositorios públicos para usar runners estándar gratuitos; privados cuando corresponda. Nunca publicar secretos o datos no autorizados. **Pendiente:** controles y decisión de publicación por tipo de artefacto.
7. **Continuidad remota y datos — DECIDIDA (DEC-0023/0026):** tareas compatibles siguen en ejecutores remotos gratuitos autorizados con PC apagada, procesando únicamente datos públicos o expresamente autorizados. **Pendiente:** clasificación/consentimiento de datos por artefacto, coordinación persistente, categorías de trabajo y credenciales; guía de instalación y actualizaciones.

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

**Resueltas ahora (DEC-0024…0027):** auditor bloquea releases por error crítico; auditoría profunda ante mejoras importantes/cierres/candidatos estables; ejecutores remotos solo con datos públicos o expresamente autorizados; reintentos de informe para entrega cuanto antes, con deduplicación exigida. **Decisión de proceso:** la entrega por Telegram ante reconexión se especifica y prueba como integración técnica, sin consultas adicionales por contingencias marginales. **Pendientes sustantivos:** desbloqueo de hallazgos críticos y auditoría indisponible; clasificación y autorización remota; criterio medible de mejora importante; coordinación remota con Gateway apagado.

## E. Regla de priorización para consultas al usuario (ajuste de enfoque)

- No generar una serie de cuestionarios para resolver incidencias técnicas ordinarias, casos improbables ni alternativas que competen al diseño de integración.
- Consultar solo cuando una decisión cambie **la meta o el enfoque científico**, el grado de autonomía, los costos autorizados, la privacidad o un compromiso técnico importante visible para el usuario.
- Es prioritario cerrar cómo **investiga, contrasta, experimenta, aprende y mejora**; después completar orquestación e integraciones. Ver `spec/CORE_RESEARCH_LOOP.md`.
- Mantener los mecanismos de seguridad y recuperación necesarios, pero resolverlos mediante ingeniería documentada en vez de trasladar todas las decisiones al usuario.
