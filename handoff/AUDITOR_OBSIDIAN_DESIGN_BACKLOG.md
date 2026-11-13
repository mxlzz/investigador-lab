# Traspaso futuro: Auditor ChatGPT ↔ Investigador y Obsidian

**SOLO DISEÑO; NO AUTORIZA IMPLEMENTACIÓN.** Fecha: 2026-11-13.  
Base sugerida: `fix/investigador-timeouts`. Esta rama de diseño contiene exclusivamente Markdown. Consultar:
- `spec/10-auditor-chatgpt.md`
- `spec/contracts/audit-dialogue-v1.md`
- `spec/11-obsidian-projection.md`
- `docs/DECISIONS.md` (DEC-0028 y DEC-0029)
- `spec/contracts/release-audit-gate.md` (autoridad de publicación anterior)

## Secuencia recomendada para implementación en otro chat

**E0 — Verificar factibilidad del canal ChatGPT.** Probar en un entorno controlado si la automatización programada de ChatGPT puede acceder al GitHub conectado, leer **el repo privado de prueba** y escribir una auditoría identificable. Comprobar permisos/sesiones y comportamiento ante desconexión. Si no puede, registrar bloqueo y proponer alternativas reales a decisión humana; no prometer auditoría autónoma usando solo recordatorios.

**E1 — Contrato y persistencia del diálogo.** Congelar JSON Schemas, IDs, estados, verificación de actor, autorización, idempotencia, cursor, auditoría histórica y reintentos. Definir transporte GitHub validado (rama/archivos/Issues) sin modificar el journal canónico de Investigador. Pruebas A01–A08.

**E2 — Ingesta por Investigador.** Consultar y reconocer hallazgos nuevos desde GitHub; aceptar únicamente datos y solicitudes de verificación, no comandos arbitrarios. Registrar respuestas, pruebas o desacuerdos, con push atómico y sin gastar turnos del LLM si basta un acuse técnico.

**E3 — Auditor ChatGPT.** Definir prompt literal versionado, herramientas permitidas, matriz de alcance por severidad, lecturas por SHA, evidencia verificada y fallos `not_checked`. Probar una revisión breve con un caso de error real y un caso sin novedades.

**E4 — Dos revisiones diarias.** Activar solamente cuando E0–E3 funcionen. Horarios a confirmar, con zona `America/Argentina/Buenos_Aires`. Probar dos ciclos sobre el mismo proyecto, cursor, ejecución omitida y reintento idempotente. Mantener auditoría profunda adicional por hitos sin confundirla con el informe de las 20:00.

**E5 — Gate de release verificable.** Integrar hallazgos críticos en control de publicación sin sustituir aprobación humana; probar bloqueos y un caso de hallazgo disputado. La política de desbloqueo e indisponibilidad debe acordarse antes.

**E6 — Proyección Obsidian.** Generar notas estables desde expediente/snapshot; sincronizar solo con repos autorizados; preservar ediciones humanas; comprobar O01–O07 y diferencia entre notas consultables y evidencia validada.

## Decisiones necesarias antes de autorizar ingeniería

- Horarios concretos de las dos auditorías (09:00 / 19:00 propuestos, NO aprobados) y si incluyen fines de semana (propuesta: sí).
- Qué incluye una revisión de «todos los proyectos» con cuota/tiempo finitos; prioridad y paginación de los no revisados.
- Medio de escritura real disponible para ChatGPT programado en GitHub privado.
- Política del gate si no hubo auditoría o existe un hallazgo crítico disputado; autoridad para resolver/desbloquear.
- Vault Obsidian por proyecto o agregador local, y estrategia de sincronización con copia local.

## No hacer en este chat

No crear automatizaciones, agentes, tokens, permisos, PR de implementación, cambios en `implementation/`, workflows, instalación local, sincronización activa, merges ni releases. Una prueba de CI de Markdown no comprueba que ChatGPT programado pueda acceder a un repo privado.


## Reglas concretas de implementación añadidas

**E0b — Canal de comentarios.** Confirmar que GitHub Issues está habilitado en cada repo de resultados, que el usuario conectado a ChatGPT puede leer/escribir allí en ejecución programada y que existe un actor autenticable distinto de la identidad usada por Investigador. Si ambos publican bajo el mismo usuario GitHub, documentar el bloqueo de atribución de rol; no fingir autoridad independiente. Evaluar identidad técnica separada de GitHub App o cuenta dedicada (si compatible con ChatGPT).

**E1b — Polling en tick.** Antes de reclamar una etapa LLM, consultar Issues autorizados, paginar, deduplicar `comment_id`, validar marcadores/envelope, registrar en el journal y recién entonces confirmar cursor. La ingesta no debe crear jobs duplicados, consumir LLM en vacío ni confundir una @mención con una notificación fiable. Ensayar casos I01–I11.

**E2b — Propuesta de cierre.** Añadir `closure_proposed` como evento de auditoría y procesarlo con verificación del estado/criterios/experimentación desde el motor, sin ejecutar el texto del comentario. Respuestas `closure_accepted/contested/deferred`. Cierre solo luego de journal, checkpoint final y sincronización verificada; detener solo el proyecto, conservar el registro, permitir reapertura explícita con evento. Ensayar C01–C12.

**E3b — Desacuerdo.** Intentar nuevas verificaciones y revisar evidencia aportada. Si no se resuelve dentro de las rondas propuestas y no hay prueba discriminante autorizada, elevar un único paquete al usuario. No pedir una decisión humana por cada hallazgo ni crear una conversación infinita sin información.

Las opciones definitivas sobre actor separado de GitHub, umbral de dos rondas y reglas de cierre sin éxito se cierran en diseño antes de que Codex pueda introducir semántica propia.
