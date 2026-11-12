# Diseño propuesto de disparadores y autoridad de auditoría

**Estado:** propuesta para debate, NO aprobada en sus detalles.  
**Acuerdos de partida:** DEC-0019 (dictamen de meta cumplida), DEC-0021 (alertas) y DEC-0022 (auditoría breve diaria y profunda ante hitos). Sin automatización activada.

## 1. Diferenciar tres productos

- **Informe diario del Investigador:** resumen del trabajo, todos los proyectos, 20:00 Buenos Aires, Telegram + OpenClaw; lo redacta el sistema investigado, no es auditoría.
- **Auditoría breve diaria de ChatGPT:** verificación limitada de deltas, integridad, fuentes y discrepancias. Anota alcance y acciones comprobadas.
- **Auditoría profunda por hito:** muestreo de evidencia primaria, comparación con antecedentes, validación de experimentos, robustez, reproducibilidad e inspección de código cuando estén disponibles. No confundir con peer review científico formal.

## 2. Catálogo inicial de hitos (PROPUESTA)

Candidatos que dispararían auditoría profunda:
1. Una hipótesis pasa revisión de novedad y está lista para **primer experimento discriminante**.
2. Una implementación muestra la **primera mejora experimental sustancial** contra baseline pertinente.
3. Se propone **meta cumplida**, cierre sin éxito o cambio de dirección principal por resultados negativos.
4. Se solicita autorización para **publicar versión estable**.
5. Existe contradicción importante entre investigador y evidencia externa, o aparecen fallos graves repetidos.

Estos eventos requieren un ID, versión, evidencia y firma del detector; no se aceptan simplemente porque el LLM haya escrito «hito logrado».

## 3. Regla propuesta para resultados críticos

- `blocker`: evidencia incorrecta/ausente en una decisión fundamental, permisos violados, resultados falsamente reportados o fallos que vuelven no interpretable el éxito. Bloquear promoción estable y pedir corrección.
- `major`: debilidad sustancial o control faltante, requiere revalidación.
- `minor`: documentar y corregir, sin invalidar por sí solo todo el resultado.
- `note`: sugerencia informativa; no equivale a error demostrado.

**La autoridad efectiva del auditor todavía no fue acordada.** Alternativas: comentar únicamente; bloquear promoción de release si encuentra `blocker`; exigir visto bueno previo para ciertas clases de metas.

## 4. Cadena de evidencia

`evento de hito → snapshot/commit → plan de auditoría → materiales revisados → hallazgos con IDs → respuesta del Investigador → evidencia corregida → cierre del hallazgo`.

Cuando un dato o repositorio no es accesible, registrar `not_checked`, nunca `passed`.

## 5. Evitar avisos redundantes

Avisar inmediatamente al usuario si una auditoría encuentra un fallo grave o requiere decisión humana (DEC-0021). El resto de observaciones puede ir al informe de las 20:00, sin silenciar el historial técnico. Deduplicación basada en ID de hallazgo y estado, no en coincidencias textuales.

## 6. Cuestiones abiertas

- ¿Se auditan todos los hitos o se agrupan por relevancia/costo?
- ¿La revisión profunda puede bloquear publicación hasta corregir `blocker`?
- ¿Quién puede cerrar un hallazgo disputado?
- ¿Cómo se autoriza a ChatGPT a leer evidencias y comentar en GitHub?
- ¿Qué hacer cuando falla el disparador remoto y no se ejecuta la auditoría del día?
