# Arquitectura propuesta (no implementada)

## Componentes

- **OpenClaw:** agente coordinador `investigador`, uso de herramientas, permisos y programación.
- **Motor documental:** búsquedas verificables; recolección de metadatos, literatura y repositorios; deduplicación; expansión por citas.
- **Repositorio de conocimiento:** notas Markdown + metadatos YAML + IDs estables; datos estructurados de procedencia.
- **Control de novedad:** revisión focalizada de equivalentes conceptuales, matemáticos y funcionales para cada hipótesis.
- **Evaluador experimental:** protocolo, baselines, datasets, métricas, semillas, entorno, pruebas y ablaciones cuando correspondan.
- **GitHub:** historial, revisión, issues, auditorías y versiones.
- **Archivo de datos:** resultados voluminosos fuera de Git, con checksums e índices persistentes.
- **Auditoría independiente:** revisar omisiones, resultados, evidencia y reproducibilidad.

## Máquina de estados propuesta

`brief → landscape-review → knowledge-map → hypotheses → novelty-review → experimental-design → execution → evaluation → decision → archive → next-cycle`

Cada transición exige registros verificables. Un resultado incompleto no puede presentarse como validado.

## Identificadores

- `SRC-0001`: fuente
- `FND-0001`: hallazgo
- `Q-0001`: pregunta abierta
- `HYP-0001`: hipótesis
- `EXP-0001`: experimento
- `DEC-0001`: decisión
- `AUD-0001`: auditoría

Los registros históricos se corrigen mediante anotaciones vinculadas a la evidencia nueva, no mediante sobrescrituras silenciosas.

## Seguridad

Separación de workspace no equivale a sandbox. Ejecutar código experimental en entornos aislados con límites de memoria, CPU, tiempo y acceso a credenciales; preferir ramas de trabajo y revisión antes de integrar versiones estables.