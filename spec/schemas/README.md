# E5/E7 — Notas sobre esquemas

**Estado: borrador.** Los archivos JSON de este directorio son contratos de datos **propuestos**, no código listo para ejecutar ni autorización para implementar.

- `record.schema.json`: mínimos de procedencia, trazabilidad y relaciones.
- `phase-result.schema.json`: once variantes de fase discriminadas por `phase` mediante `oneOf`; acepta solamente campos comunes + los declarados para la fase.
- `examples/`: ejemplos de respuestas estructuralmente válidas e inválidas, para convertir en pruebas de contrato antes de la implementación.
- **No son definitivos**: faltan subtipos de registros y esquemas por fase, ejemplos válidos/inválidos, auditoría de referencias cruzadas, semántica de estados, versión, manejo de migraciones y colisión de IDs.

## Problema técnico abordado (borrador)

El esquema previo tenía `additionalProperties: false` a nivel común y rechazaba los campos específicos exigidos por cada prompt. El esquema actual utiliza **`oneOf` con once objetos estrictos por fase**, cada uno con campos comunes y específicos. Se elimina esa incompatibilidad **de estructura superficial**, pero el contrato **sigue sin estar listo** para implementación.

Quedan abiertos: subesquemas estrictos de `artifacts_to_record`, `proposed_next_actions`, objetos específicos, validación semántica de referencias y permisos, distinción de los distintos estados por fase y los formatos de salida realmente soportados por los modelos objetivo. Los ejemplos son fixtures de diseño, no evidencia de pruebas ejecutadas.

No se delega a Codex completar estos contratos: diseño y aprobación siguen siendo nuestros.

## Lo que verificará una futura validación

1. JSON sintácticamente correcto y conforme al esquema.
2. IDs y referencias existentes (salvo registros nuevos declarados).
3. Estados y transiciones permitidos.
4. Evidencia realmente disponible en fuente/localizador/artefacto.
5. Permisos/costos antes de ejecutar una acción.
6. Compatibilidad de versión entre productor y consumidor.
