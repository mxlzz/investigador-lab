# E9 — Auditoría externa y relación humano-agentes

**Estado:** borrador; no hay tarea programada ni autorización de escritura a ChatGPT en nombre del auditor.

## 1. Propósito

Separar producción de afirmaciones y verificación de evidencia. El auditor puede detectar errores, omisiones y contradicciones; no debe creer automáticamente lo informado por el agente investigador.

## 2. Unidades auditables (PROPUESTA)

- **Búsqueda:** fuentes, consulta, cobertura y omisiones.
- **Hipótesis:** novedad aparente, antecedentes equivalentes y justificación de valor informativo.
- **Experimento:** protocolo previo, datos crudos, implementación, ejecución y métricas.
- **Decisión:** si la evidencia sostiene adoptar, rechazar o postergar.
- **Cierre/versión:** regresiones, criterios de aceptación y resultados pendientes.
- **Continuidad:** si los checkpoints y registros permiten recuperar lo hecho.

## 3. Dos intensidades (PROPUESTA)

**Breve:** cambios desde última revisión; comprobar nuevos expedientes, errores críticos, integridad del historial, tareas pendientes y bloqueos.

**Profunda:** seleccionar muestras de fuentes/experimentos, abrir evidencia, repetir cálculos o comparar artefactos cuando el entorno lo permita, buscar precedentes omitidos, revisar contradicciones y detectar desviaciones del contrato aprobado.

**Acordado (DEC-0022):** la **auditoría independiente de ChatGPT** tiene dos intensidades: revisión breve **diaria** y revisión **profunda al alcanzar hitos importantes**. Es distinta del informe consolidado a las 20:00 (DEC-0020). **DEC-0025** precisa hitos profundos: mejoras importantes, cierres de metas/investigaciones y candidatos a publicación estable. **DEC-0024** autoriza bloquear publicaciones estables ante hallazgos críticos fundamentados. Faltan criterios operativos de importancia, disparador técnico, acceso verificable a evidencias y procedimiento de desbloqueo. El agente puede declarar meta cumplida con pruebas válidas (DEC-0019); está abierto si clases de meta requerirán auditoría previa. También se considera revisión por evento (PR relevante, declaración de novedad o candidatura a release).

## 4. Informe de auditoría (PROPUESTA)

Por hallazgo:
- `audit_id`, fecha, auditor/modelo, versión de instrucciones, alcance;
- objeto revisado e identificador/commit inmutable;
- evidencia consultada y verificación realmente realizada;
- observación, severidad propuesta (`blocker`, `major`, `minor`, `note`);
- incertidumbre y límites del acceso;
- corrección sugerida como **propuesta**, sin sustitución de decisiones funcionales;
- respuesta del Investigador y estado de resolución documentado;
- verificación de cierre por auditor distinto cuando corresponda.

Un informe sin inspección de código/datos no puede afirmar que se ejecutaron pruebas.

## 5. Flujo de discrepancias (PROPUESTA)

1. Auditor informa un hallazgo con evidencia.
2. Investigador confirma recepción, investiga y responde con evidencia propia.
3. Si hay contradicción sustancial, registra ambas interpretaciones y eleva al usuario o solicita prueba discriminante autorizada.
4. Las conclusiones y cambios quedan vinculados al expediente original; los comentarios no borran datos históricos.

## 6. Autoridad

El auditor no cambia prompts definitivos, objetivos ni criterios de éxito. **Está acordado (DEC-0024) que puede bloquear una publicación estable ante un error crítico fundamentado**. Debe implementarse posteriormente como restricción verificable de publicación, no solo como comentario de texto. No se ha decidido quién cierra hallazgos críticos disputados, ni la política ante auditor indisponible.

La auditoría automática no equivale a una revisión científica independiente o peer review humano.

## 7. Aceptación documental

- U01: informe de investigador sin datos crudos → no declara verificación empírica.
- U02: auditor omite antecedente relevante → segunda búsqueda y rectificación documentada.
- U03: desacuerdo entre agente y auditor → existe expediente de discrepancia y resolución.
- U04: auditor ve una rama diferente → informe indica commit exacto y no lo extrapola.
- U05: auditor recibe repositorio público y no necesita credenciales del agente para leer las fuentes públicas.

## Pendientes
- Cómo integrar ChatGPT con el historial y disparar auditorías; cadencia ya acordada (breve diaria y profunda en hitos), pero horario y criterios de hito pendientes.
- Definición operacional de crítico y proceso de bloqueo/desbloqueo, incluyendo discrepancias y auditor indisponible (DEC-0024).
- Canal de entrega, avisos, cuándo escalar y quién cierra un hallazgo.
- Cómo reproducir experimentos bajo presupuesto y permisos del auditor.