# Diseño propuesto de disparadores y autoridad de auditoría

**Estado:** catálogo técnico propuesto, con autoridad y categorías de hito **acordadas** en DEC-0024/25; los disparadores finos y el proceso de desbloqueo aún no están aprobados.  
**Acuerdos de partida:** DEC-0019 (dictamen de meta cumplida), DEC-0021 (alertas) y DEC-0022 (auditoría breve diaria y profunda ante hitos). Sin automatización activada.

## 1. Diferenciar tres productos

- **Informe diario del Investigador:** resumen del trabajo, todos los proyectos, 20:00 Buenos Aires, Telegram + OpenClaw; lo redacta el sistema investigado, no es auditoría.
- **Auditoría breve diaria de ChatGPT:** verificación limitada de deltas, integridad, fuentes y discrepancias. Anota alcance y acciones comprobadas.
- **Auditoría profunda por hito:** muestreo de evidencia primaria, comparación con antecedentes, validación de experimentos, robustez, reproducibilidad e inspección de código cuando estén disponibles. No confundir con peer review científico formal.

## 2. Catálogo inicial de hitos (PROPUESTA)

Candidatos que dispararían auditoría profunda:
1. **ACORDADO (DEC-0025):** una implementación acredita una **mejora importante** frente a baseline relevante; definir indicador técnico de importancia según cada proyecto.
2. **ACORDADO (DEC-0025):** se alcanza un **cierre de meta o investigación**, con éxito o sin alcanzarlo.
3. **ACORDADO (DEC-0025):** existe un **candidato a publicación estable**.
4. **PROPUESTA adicional, no aprobada como disparador obligatorio:** hipótesis lista para un experimento especialmente decisivo.
5. **PROPUESTA adicional, no aprobada como disparador obligatorio:** contradicción importante entre investigador y evidencia externa, o fallos graves repetidos.

Estos eventos requieren un ID, versión, evidencia y firma del detector; no se aceptan simplemente porque el LLM haya escrito «hito logrado».

## 3. Regla propuesta para resultados críticos

- `blocker`: evidencia incorrecta/ausente en una decisión fundamental, permisos violados, resultados falsamente reportados o fallos que vuelven no interpretable el éxito. Bloquear promoción estable y pedir corrección.
- `major`: debilidad sustancial o control faltante, requiere revalidación.
- `minor`: documentar y corregir, sin invalidar por sí solo todo el resultado.
- `note`: sugerencia informativa; no equivale a error demostrado.

**ACORDADO (DEC-0024):** el auditor puede bloquear la **publicación estable** ante un error crítico fundamentado. El gate de publicación debe comprobar bloqueos no resueltos además de la aprobación humana. **NO ACORDADO TODAVÍA:** definición técnica de crítico, quién resuelve un bloqueo disputado, si puede levantarse sin nueva auditoría y respuesta ante falta de auditor.

## 4. Cadena de evidencia

`evento de hito → snapshot/commit → plan de auditoría → materiales revisados → hallazgos con IDs → respuesta del Investigador → evidencia corregida → cierre del hallazgo`.

Cuando un dato o repositorio no es accesible, registrar `not_checked`, nunca `passed`.

## 5. Evitar avisos redundantes

Avisar inmediatamente al usuario si una auditoría encuentra un fallo grave o requiere decisión humana (DEC-0021). El resto de observaciones puede ir al informe de las 20:00, sin silenciar el historial técnico. Deduplicación basada en ID de hallazgo y estado, no en coincidencias textuales.

## 6. Cuestiones abiertas

- ¿Cómo medir importancia de una mejora y agrupar varios hitos próximos sin omitirlos?
- **Ya decidido:** una revisión puede bloquear publicación estable si detecta error crítico (DEC-0024).
- ¿Quién puede cerrar un hallazgo disputado?
- ¿Cómo se autoriza a ChatGPT a leer evidencias y comentar en GitHub?
- ¿Qué hacer cuando falla el disparador remoto y no se ejecuta la auditoría del día?
