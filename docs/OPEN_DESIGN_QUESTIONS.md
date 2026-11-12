# Preguntas abiertas de diseño — orden sugerido de decisión

**Estado:** alternativas para debatir, NO decisiones adoptadas.  
**Regla:** una pregunta respondida produce una decisión en `docs/DECISIONS.md` y actualiza sus documentos relacionados. No se entregan estas cuestiones a Codex para que las resuelva.

## A. Decisiones que sí requieren criterio del usuario

1. **Autorización y límites:** ¿qué puede investigar, modificar y ejecutar autónomamente? Diferenciar lectura/búsqueda, descargas, ejecución de código aislado, gastos, escritura GitHub, merges, releases y alteraciones de OpenClaw. Propuesta para debate: autonomía plena solo dentro de un entorno de pruebas y presupuesto autorizado; cambios de permisos y publicación estable requieren aprobación humana.
2. **Presupuesto y recursos:** topes por día/proyecto/API; CPU/RAM/GPU y ventanas de uso de la PC; detenerse o pasar a tareas documentales al agotarse; disponibilidad cuando se apaga el equipo.
3. **Comunicación y revisiones:** frecuencia de mensajes y auditorías ChatGPT, notificaciones urgentes, aprobación de cambios de prioridad, formato de reportes. Se discutió una revisión corta y otra profunda, pero no se definió un horario.
4. **Varios proyectos:** número simultáneo, prioridades y condiciones para pausar o comenzar una oportunidad futura.
5. **Éxito y cierre:** ¿Investigador declara automáticamente `meta_cumplida` si se verifican criterios acordados, o solicita confirmación final?
6. **Privacidad y publicación:** repositorio de diseño público; ¿los proyectos y su base Obsidian son públicos por defecto o requieren elección por proyecto? Nunca publicar secretos o datos sin autorización.
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

**Prioridad sugerida:** decidir primero la frontera de autonomía y permisos. Condiciona E1, E4, E6, E8 y E9.