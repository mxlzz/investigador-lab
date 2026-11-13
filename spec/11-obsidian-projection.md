# Obsidian como proyección de consulta — diseño v0.1

**Estado:** propuesta; no hay exportación automática instalada.  
**Objetivo:** inspeccionar investigaciones e intervenciones del Auditor sin convertir notas Markdown en la fuente de verdad de un experimento.

## 1. Tres capas diferentes

1. **Journal/expediente canónico:** eventos estructurados confirmados por el motor (`research-state/`) y snapshots verificables con sus hashes.
2. **GitHub por proyecto:** rama y ruta de resultados `.investigador/projects/<project>/` ya existentes, privados por defecto; contienen los avances exportados que tienen permiso de compartirse.
3. **Obsidian:** Markdown generado a partir de los registros canónicos/exportados; legible y enlazable. Un enlace de Obsidian no significa evidencia científicamente validada.

No construir un segundo «motor de memoria» dentro de Obsidian ni interpretar notas editadas a mano como fases aceptadas.

## 2. Estructura propuesta por proyecto

La ruta ilustrativa en la rama de resultados del repositorio privado del proyecto es:

```text
.investigador/projects/<project>/vault/
  Inicio.md
  Estado.md
  Fuentes/
  Hallazgos/
  Preguntas/
  Hipótesis/
  Experimentos/
  Decisiones/
  Auditorías/
```

El `vault/` de `investigador-lab` actual es una **plantilla de demostración**: no se debe presentar como historial real ni usarlo para copiar investigaciones privadas. Si se desea un único vault agregador para múltiples proyectos privados, primero hay que especificar un mecanismo de sincronización local que no publique datos mezclados ni cause colisiones de IDs.

## 3. Contrato de cada nota

Markdown UTF-8 con YAML frontmatter simple: `id`, `type`, `project_id`, `status`, `source_commit`, `updated_at`, `verification_level`, `source_refs` (lista), `related_ids` (lista). El cuerpo incluye:

- resumen de la afirmación o resultado;
- evidencia realmente consultada y grado de comprobación;
- limitaciones, alternativas o resultados negativos;
- enlaces a otras notas y URL/commit/run cuando estén disponibles;
- marca visible «generado; no editar» para el árbol administrado.

Los nombres deben derivar de IDs estables y textos seguros (sin rutas arbitrarias), por ejemplo `FND-0042 - Detalle principal.md`. Al actualizar, conservar IDs y enlaces; las enmiendas quedan vinculadas a su versión histórica.

## 4. Sincronización y edición

**Flujo propuesto:** commit confirmado del expediente → generación determinista Markdown → actualización del repo del proyecto sin force-push → `git pull` o sincronizador autorizado en la PC → Obsidian lee el vault.

El renderizador solo modifica su árbol `vault/` administrado. Las notas humanas viven fuera, por ejemplo `Notas personales/`, y nunca son sobrescritas por una regeneración. La edición de una nota generada no se interpreta como orden para el investigador. Una eventual función de «instrucciones desde Obsidian» sería otro diseño con autorización e identidad propias.

Si el repo está privado, Git y Obsidian acceden únicamente mediante la cuenta autorizada. Ninguna función exige un plugin propietario. Los archivos externos pesados van en almacenamiento autorizado, con manifiesto enlazado y marca de ausencia cuando no están disponibles.

## 5. Auditoría visible en Obsidian

`Auditorías/` incluirá índices de cada ciclo breve y profundo, los hallazgos por `finding_id`, respuestas y estado actual derivado. Debe ser posible navegar:

`Proyecto → Hallazgo (FND) → Hipótesis (HYP) → Experimento (EXP) → Resultado → Auditoría (AUD) → Respuesta → Resolución`.

El renderizador representa `open`, `disputed`, `resolved` y `not_checked` sin atribuir a una de las dos partes una conclusión que no existe. Si el auditor aún no revisó un experimento, se indica «sin auditoría» y no «aprobado».

## 6. Seguridad y cobertura

- Nunca exportar automáticamente claves, perfiles de autenticación, sesiones, logs privados, texto completo de publicaciones sin derecho a redistribución ni rutas absolutas.
- Para evidencia privada permitida solo en local, una nota puede incorporar un identificador y estado `local_only`, sin fingir que ChatGPT obtuvo el original por GitHub.
- El estado `last_generated_from` debe identificar commit de origen/último evento. Si Obsidian está desactualizado, mostrar fecha de generación, no afirmar sincronización en vivo.
- Una lectura privada fallida no puede activar un cambio a repositorio público para facilitar sincronización.

## 7. Criterios de aceptación

O01: se abre un vault de un proyecto privado en Obsidian sin plugins especiales y las notas se enlazan.  
O02: una búsqueda/hallazgo cambia y su nota se regenera sin perder un ID o sobreescribir notas humanas.  
O03: un experimento fallido y una auditoría crítica aparecen como hechos distintos.  
O04: `source_commit` y `source_refs` permiten localizar los registros de referencia.  
O05: la exportación excluye secretos y textos completos no redistribuibles.  
O06: cerrar y actualizar Obsidian no cambia el estado del motor.  
O07: repositorios privados distintos no se mezclan sin una función local autorizada.

## 8. Preguntas de diseño pendientes

Elegir: vault por proyecto (propuesta preferida) o uno agregador local; modalidad de actualización Git (manual al principio o sincronización autorizada); nombres exactos de carpetas; representación del grafo científico con relaciones tipadas además de backlinks.
