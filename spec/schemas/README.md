# E5/E7 — Notas sobre esquemas

**Estado: borrador.** Los archivos JSON de este directorio son contratos de datos **propuestos**, no código listo para ejecutar ni autorización para implementar.

- `record.schema.json`: mínimos de procedencia, trazabilidad y relaciones.
- `phase-result.schema.json`: campos comunes de salida de un prompt.
- **No son definitivos**: faltan subtipos de registros y esquemas por fase, ejemplos válidos/inválidos, auditoría de referencias cruzadas, semántica de estados, versión, manejo de migraciones y colisión de IDs.

## Problema detectado

Los prompts por fase agregan campos específicos; el envoltorio común declara `additionalProperties: false`. Una implementación **no puede** tomar estos dos borradores juntos como una validación final. Habrá que definir `$defs`, `oneOf` o una variante consistente por fase.

Se deja deliberadamente explicitado para que Codex no invente una corrección por su cuenta durante la implementación.

## Lo que verificará una futura validación

1. JSON sintácticamente correcto y conforme al esquema.
2. IDs y referencias existentes (salvo registros nuevos declarados).
3. Estados y transiciones permitidos.
4. Evidencia realmente disponible en fuente/localizador/artefacto.
5. Permisos/costos antes de ejecutar una acción.
6. Compatibilidad de versión entre productor y consumidor.
