# ACD: ejecutar workflows fuente existentes desde el investigador

## Problema corregido

El agente buscaba rutas supuestas (`tests/smoke.py`, `tests/test_core.py`) en `main` y exigía el manifiesto del runner Node.js para ejecutar pruebas Blender ya implementadas. El repositorio ACD contiene `tests/blender_smoke.py`, pruebas EXR y comparación de métodos, y numerosos experimentos en `dev/acd-v2-oidn-detail-eval`. El ejecutor Node.js y su clasificación pública de proyecto no eran el adaptador adecuado para reproducir esos workflows existentes.

## Operaciones y contrato

- `source_discover(project="acd")`: descubre commit, árbol, tests, workflows y documentos reales de la rama configurada, sin leer rutas inventadas. Registra la procedencia. `github_read` también usa la rama configurada cuando no se especifica ref.
- `source_workflow_plan(project,key,data={workflow,source_commit})`: fija repositorio, ID de repo, rama, commit completo y blob del workflow revisado. No acepta parámetros libres. La configuración local autoriza exclusivamente `blender-smoke.yml` y `ci.yml` de ACD con sus hashes revisados.
- `source_workflow_submit(project,key)`: comprueba que la rama no cambió y transmite únicamente `{ref: rama_publica}` al endpoint workflow_dispatch. El pedido del usuario, nombre del expediente, prompts, fuentes privadas y resultados locales nunca se envían. La intención se escribe antes del POST para no duplicar ante una respuesta perdida. Límite: dos despachos fuente por día UTC y proyecto; un plan por workflow y commit evita repeticiones involuntarias.
- `source_workflow_poll(project,key)`: correlaciona nuevos runs por repo, workflow, ref, tiempo y IDs anteriores. Verifica commit, evento, jobs e intento; guarda estado, pasos y artefactos. Ambigüedad o cambio de commit bloquean importación. No hay reenvío automático de un despacho incierto. Un run fallido se registra como fallido, sin afirmar éxito ni mejora.
- `source_workflow_metrics(project,key,data={artifact_id})`: descarga un artefacto de un run ya verificado. Lee solo `metrics.json`, `seed_aggregate.json` y `region_metrics.json` en memoria; nunca extrae EXR, ejecutables o scripts en la PC. Verifica digest si GitHub lo proporciona, CRC de cada JSON y límites de tamaño. El token no acompaña redirecciones a almacenamiento firmado.

El planificador existente despacha/consulta estos planes con pasos del host y sin llamadas LLM mientras corre Blender. Respeta pausa del proyecto, exclusión y backoff; estas consultas no consumen la cuota de 24 intentos del modelo. No crea cron ni usa Blender en Windows.

## Privacidad, permisos y alcance

El expediente ACD permanece privado. Se autoriza reproducir código **ya público** con entradas públicas predefinidas, no publicar el expediente ni adaptar experimentos usando datos privados. El lector de fuente es anónimo; el despacho usa la conexión administrada System GitHub con Actions Write en ACD, y la descarga de artefactos requiere Actions Read. Un 403 se informa; no se leen ni reemplazan claves, ACL o perfiles.

No se crean tags o ramas en ACD ni se modifican archivos del repositorio fuente. GitHub workflow_dispatch acepta ramas/tags; se comprueba el HEAD antes de despachar y el commit real al recuperar resultados. Un cambio concurrente de rama impide atribuir esa ejecución al plan original. No se declara que la API fije atómicamente un commit.

Los hashes revisados autorizan workflows con runners estándar Ubuntu, contenidos de solo lectura y sin referencias a secrets. Un cambio de workflow requiere revisión local antes de habilitarlo. No se autorizan runners propios, GPU de pago, workflows que publican commits ni entradas arbitrarias del modelo. No se garantiza que toda dependencia externa o servicio conserve disponibilidad.

## Interpretación científica

La reproducción existente genera `source_workflow_result` y `source_workflow_metrics`, **no** `experiment_result` del motor Node.js. Se pueden citar como evidencia de lo ocurrido en esa ejecución, sin inventar hipótesis ni afirmar superioridad a partir de success. Los gates existentes para planes experimentales nuevos, novedad, diseño, métricas y autorización pública permanecen intactos.

El workflow Blender revisado ejecuta construcción del addon, comparaciones CPU con la misma entrada ruidosa, exportación EXR y un interior pequeño con referencias y semillas. Blender 5.3 omite el render por limitación EGL; no presentar esa celda como render validado. Las referencias finitas y la escala reducida conservan sus límites.

No volver a usar E0043 como prueba de una mejora: la documentación de su rama declara la escena en cuarentena por un IES ausente y referencias no convergidas. Cualquier nuevo experimento científico necesita un protocolo válido; este adaptador elimina el bloqueo de infraestructura sin inventar conclusiones.

## Validación

Regresiones: rama real por defecto; expediente privado con payload público mínimo; rechazo de workflow no revisado, repositorio privado y ref inventado; rechazo de drift; POST incierto sin duplicación; correlación de run/jobs/intent; ambigüedad; CRC/digest y rutas ZIP; separación de tokens en redirects; planificador sin LLM y respeto de pausas. Verificación real de descubrimiento, despacho y resultados documentada en el PR de instalación.
