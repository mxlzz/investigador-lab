# GitHub como interfaz de investigación y red de conocimiento — diseño v0.1

**Estado:** diseño para implementar en otro chat; no modifica el agente. **Fecha:** 2026-11-13.  
**Decisión de prioridad:** GitHub es la interfaz principal. Obsidian queda postergado, no se implementa en esta etapa.

## 1. Propósito y fuente de verdad

La persona debe poder abrir el repositorio de una investigación y entender qué pidió, qué se sabe, qué se intentó, por qué se cambió de rumbo, qué resultados están probados y qué sigue. No debe leer primero logs o JSON.

El journal local `research-state/projects/<id>/events.jsonl` sigue siendo la fuente canónica. `progress.json` representa un snapshot estructurado parcial. README, BITACORA, RESULTADOS y las fichas de conocimiento son **vistas generadas**, no memorias adicionales ni instrucciones para el agente. Deben conservar IDs y referencias a evidencia, sin añadir hechos no registrados.

## 2. Estructura humana propuesta

```text
README.md                       ← portada visible al abrir GitHub
BITACORA.md                     ← cronología de decisiones sustantivas
RESULTADOS.md                   ← resultados, comparaciones y límites
conocimiento/
  INDEX.md                      ← entidades y enlaces por relación
  fuentes/
  hallazgos/
  hipotesis/
  experimentos/
  decisiones/
  auditorias/                   ← cuando exista auditor autónomo
.investigador/projects/<id>/
  progress.json                 ← snapshot técnico existente
```

Crear fichas individuales solo para entidades de valor consultable, no cientos de archivos vacíos. Enlaces Markdown **relativos a archivos realmente presentes** (GitHub), no exclusivamente `[[wikilinks]]` de Obsidian. No duplicar el expediente original.

**Problema confirmado del código actual:** `implementation/github-projects.mjs` escribe el README en `.investigador/projects/<id>/README.md` y publica una rama `investigador-<slug>`; al abrir el repositorio en su rama por defecto ese resumen no se ve automáticamente. Debe ofrecerse una portada real en la rama visible.

En repositorios **autogestionados** nuevos, preferir la presentación humana en la rama por defecto, sin dos copias canónicas de datos. Para repositorios **existentes/vinculados**, no sobreescribir README/código/ramas del usuario: publicar en un árbol administrado y acordar cómo exponer el índice. Migrar ramas actuales sin force-push ni pérdida de historial. Si el default branch está protegido, registrar el bloqueo y conservar la sincronización anterior. Resolver estrategia exacta de migración en la implementación, con pruebas.

## 3. README: fotografía actual

Contendrá objetivo original, alcance, estado de la línea activa, resultados principales con enlaces, últimas decisiones y motivos, siguiente pregunta concreta, bloqueos reales, fecha de último evento confirmado, fecha de última publicación y hash/commit de procedencia. Enlaces a BITACORA, RESULTADOS, conocimiento/INDEX, snapshot técnico e Issue de auditoría si existe.

No confundir la hora del último commit con la hora del último descubrimiento; no afirmar verificación del Auditor salvo evento real.

## 4. BITACORA: reconstruir el razonamiento

Entrada solo cuando ocurre algo **sustantivo** (búsqueda que cambia el mapa, evidencia nueva, experimento, resultado adverso, decisión, modificación de rumbo, bloqueo). Un tick de 15 minutos sin novedades no genera otra entrada.

Cada entrada incluye fecha/hora Buenos Aires, evento y estado, qué se intentó, motivo, resultado observado, decisión y fundamento, incertidumbre, paso siguiente y enlaces a IDs/artefactos. Las decisiones negativas o erradas se conservan, con posteriores rectificaciones vinculadas: la bitácora no debe borrar historia.

Ejemplo ficticio (NO es evidencia sobre ACD):

> **13/11 — Decisión de ruta [PRJDEC-17].** La prueba EXP-12 no superó el baseline en las condiciones medidas. Se prioriza evaluar el método C, descrito en SRC-08. [Experimento](conocimiento/experimentos/EXP-12.md) · [Fuente](conocimiento/fuentes/SRC-08.md).

Cuando crezca, BITACORA.md será el índice y las entradas completas pasarán a `bitacora/AAAA-MM.md`, con enlaces estables.

## 5. RESULTADOS: evidencia antes que relato

Distinguir explícitamente: hallazgo documental, hipótesis pendiente, resultado experimental, resultado negativo, conclusión y resultado aún no verificado. Para comparaciones: baseline, versión, dataset, hardware/condiciones relevantes, métricas/unidades, medidas, incertidumbre y limitaciones. Enlazar protocolo y artefactos crudos/manifiesto accesibles. Si el experimento sólo probó el runner, decirlo: un test verde de infraestructura no es progreso científico.

## 6. Relaciones y conexiones inesperadas

**Ya especificado parcialmente:** `spec/05-knowledge.md` define relaciones tipadas con origen/destino/fundamento/estado; `map_knowledge.proposed_edges` propone vínculos; `record.schema.json.links` contempla estado `proposed/verified/disputed/superseded`. No crear un segundo grafo.

La capacidad nueva necesaria es **persistir y consultar esos vínculos**, deduplicarlos y representarlos como links reales Markdown. Tipos útiles: `supports`, `contradicts`, `tests`, `uses_method`, `compared_with`, `motivates`, `depends_on`, `potentially_related`. Evitar vocabulario abierto de etiquetas sin criterio. Distinguir hallazgos científicos (FND) de objeciones de auditoría (AUD-FIND) y decisiones del sistema (DEC) de decisiones del proyecto (PRJDEC).

**Descubrimiento propuesto, sin un nuevo subagente o cron:** al ingresar evidencia o crear una hipótesis, consultar relaciones cercanas por mecanismo, variable, problema, fuente compartida o resultado incompatible. Si aparece una analogía plausible, proponer **una conexión con mecanismo explícito, base de evidencia y una prueba discriminante**. Guardarla como `proposed`; revisar equivalencias mediante el novelty gate ya diseñado; promover a `verified` solo con comprobación pertinente. Si se refuta, conservar historial. Evaluar relevancia/costo de oportunidad en `next_cycle` antes de abrir un nuevo experimento o línea.

No afirmar causalidad u originalidad por similitud semántica. Las conexiones entre proyectos sólo se consultan si hay acceso y autorización compatibles; no exportar información privada a repos públicos.

## 7. Sincronización y seguridad

Una publicación debe ser coherente con un digest del expediente confirmado, con ID estable, links validados y sin commits redundantes si no hubo cambios. El hash del registro original no es el SHA del commit futuro (evitar autorreferencias). Si GitHub falla, no se declara la publicación exitosa ni se cambia el journal; se reintenta con idempotencia.

No publicar secretos, credenciales, rutas locales, material restringido ni datasets grandes. Guardar manifiestos con hashes y referencias a almacenamiento autorizado. Una lectura humana de un resumen no convierte ese resumen en una verificación independiente para el Auditor.

## 8. Pruebas de aceptación propuestas

G01. Repo autogestionado recién creado: README visible sin cambiar de rama, con objetivo, estado, resultado y próximo paso.
G02. Decisión sustantiva con evidencia produce entrada en BITACORA; tick vacío no crea texto.
G03. Resultado negativo permanece visible y no aparece como mejora.
G04. Cada link Markdown existe, y sus IDs coinciden con registros de origen; link roto falla la generación.
G05. Analogía o conexión nueva se marca `proposed`, no descubrimiento confirmado.
G06. Novelty gate detecta trabajo equivalente y evita experimento redundante; puede justificar reproducción como baseline.
G07. Conexión refutada no borra el historial.
G08. Repo vinculado con README propio no se sobrescribe sin autorización.
G09. Error de GitHub no declara sync correcto; retry no duplica entradas.
G10. Privacidad entre proyectos y repos preservada.
G11. Bitácora extensa se pagina/archiva por períodos sin perder navegación.
G12. Auditor puede ir del resumen a fuente/protocolo/datos; lectura de README no equivale a auditoría científica.

## 9. Prioridades para la siguiente implementación

1. README visible y bitácora útil para **personas**.
2. RESULTADOS e índices de conocimiento enlazados y verificables.
3. Explotar relaciones ya previstas para hallar conexiones candidatas, sin duplicar novelty review.
4. Obsidian fuera del alcance actual.

Los ejemplos son ilustrativos. No se habilitaron nuevas herramientas, operaciones, tareas ni cambios de código.
