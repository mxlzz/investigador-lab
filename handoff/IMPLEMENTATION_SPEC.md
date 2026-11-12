# Entrega a implementador — ESPECIFICACIÓN NO CONGELADA

**ESTADO: BORRADOR. PROHIBIDO TRATAR ESTE DOCUMENTO COMO ORDEN DE IMPLEMENTACIÓN.**

## Objetivo del paquete futuro

Entregar a un implementador humano, Codex u otro agente **la misma descripción cerrada de Investigador**, con prompts, datos, fases, herramientas, seguridad, persistencia, interfaces, escenarios y pruebas de aceptación definidos por usuario y ChatGPT.

## Alcance

- Agente universal capaz de iniciar desde meta concreta o tema abierto.
- Revisión previa y por hipótesis de literatura, implementaciones y experimentos existentes.
- Hipótesis justificadas y experimentos reproducibles, con controles y baselines comparables.
- Memoria estructurada con procedencia, archivo histórico y Obsidian como vista de consulta.
- Autonomía por ciclos, presupuestos, permisos, recuperación e informes.
- Supervisión independiente y conservación de oportunidades laterales.
- Distribución que pueda instalarse manualmente, por Codex o por OpenClaw sin alterar comportamiento.

## Antes de pasar a implementación

Requisitos:
1. Todos los documentos `spec/01-09` revisados, sin contradicciones abiertas.
2. Todos los prompts de `spec/07-prompts/` aprobados literalmente y probados dentro de las limitaciones previstas de modelo/contexto.
3. Esquemas y ejemplos positivos/negativos completos y versionados.
4. Versión OpenClaw, API de herramientas y compatibilidad revisadas.
5. Matriz de permisos, presupuestos, privacidad y prioridades aprobada.
6. Suite de aceptación, con referencias a datos de control y resultados esperados.
7. Guía de instalación y verificación para la plataforma objetivo, vinculada a un artefacto **ya implementado**.
8. Aprobación explícita del usuario para entregar la implementación.

## Lo que Codex NO debe decidir

Prompts, modelo epistemológico, política de búsqueda/experimentos, alcance de autonomía, prioridades funcionales, qué es éxito, seguridad/permisos o cambios al objetivo. Reportar bloqueos de especificación, sin cubrirlos con decisiones propias.

## Decisiones de ingeniería que sí podría tomar

Organización interna de código, nombres internos, pruebas unitarias adicionales, refactorizaciones, optimización que preserve semántica, manejo técnico de bibliotecas de acuerdo al contrato y compatibilidad previamente aprobada.

## Estado actual

Se están produciendo borradores. No existe implementación, instalador, instrucciones ejecutables ni autorización. Revisar `docs/OPEN_DESIGN_QUESTIONS.md` y `docs/DESIGN_STATUS.md` antes de considerar un traspaso.