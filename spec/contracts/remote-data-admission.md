# Contrato preliminar — Admisión de trabajos y datos a ejecutores remotos

**Estado:** diseño técnico propuesto. Acordado: gratuidad autorizada (DEC-0011/0023) y entrada remota solo de datos públicos o expresamente autorizados (DEC-0026). No se ha implementado ni otorgado permisos.

## Clasificación por artefacto (PROPUESTA)

La clasificación se aplica a cada **fuente, dataset, archivo de entrada, resultado intermedio y artefacto derivado**, no solamente al repositorio:
- `public`: material con divulgación y procesamiento remoto legítimos; la URL pública **no prueba por sí sola** que el contenido tenga permiso de redistribución.
- `remote_authorized`: material no público autorizado explícitamente para un ejecutor y finalidad determinados, con fecha, alcance, responsable y caducidad si corresponde.
- `local_only`: material que no puede enviarse al ejecutor remoto actual.
- `unclassified`: origen, licencia o consentimiento insuficiente; **denegar** hasta aclarar.

**La autorización de procesamiento remoto no implica autorización de publicar resultados o datos en GitHub público.** Una aprobación para un ejecutor específico tampoco aplica automáticamente a otro servicio.

## Registro de autorización (PROPUESTA)

`authorization_id`, `project_id`, `granted_by`, `granted_at`, `scope`, `data_refs`, `allowed_executor`, `purpose`, `storage_policy`, `expires_at`, `revoked_at`. No colocar secretos dentro del registro público.

## Flujo de admisión (PROPUESTA)

1. Recibir `WorkOrder` y lista cerrada de entradas/derivados que se pretenden transferir.
2. Resolver clasificación efectiva de cada recurso, versión/hash, licencia y permiso correspondiente.
3. Verificar que el ejecutor y repositorio son los autorizados para esa clase de datos.
4. Comprobar si los logs, caches o artefactos derivados podrían exponer contenido restringido; aplicar la misma clasificación restrictiva mientras no se demuestre lo contrario.
5. Confirmar uso de runner estándar gratuito aprobado, capacidad suficiente, credenciales mínimas y política de retención.
6. Ejecutar solo si todas las entradas son admitidas y el trabajo no requiere permisos fuera de alcance.
7. Mantener un `admission_decision` referenciado a manifiesto, fecha, política y autorización; si una autorización fue revocada antes de ejecución, volver a evaluar.
8. En resultados, incluir pruebas de que no se publicaron artefactos restringidos y guardar hashes/referencias durables.

## Denegaciones previsibles

- Dataset local sin autorización de transferencia → `local_only`.
- Contenido de terceros con condiciones de licencia no verificadas → `unclassified`.
- Proyecto público que intenta incluir token/API key en un log → denegar y marcar incidencia; no escribir token en Git.
- Archivo privado autorizado para procesamiento, pero no para publicación → permitido solo si el almacenamiento y runner concreto protegen su acceso; resultado sensible no va a GitHub público.
- Trabajo GPU que requiere runner pago y presupuesto cero → `blocked_resources` aunque los datos sean públicos.
- Derivado que contiene parte de dataset restringido → hereda restricción hasta evaluación fundamentada.

## Pruebas de aceptación por desarrollar

- D01: job con entrada pública y runner gratuito autorizado → admisión sujeta a demás requisitos.
- D02: una entrada `unclassified` entre muchas públicas → denegar.
- D03: la autorización cubre runner X y se intenta en runner Y → denegar.
- D04: se revoca autorización mientras un job espera → revalidación previa a ejecución.
- D05: el resultado deriva de un dataset `local_only` → no publicar automáticamente.
- D06: runner API de pago con presupuesto `0` → denegar.
- D07: logs/artefactos públicos contienen datos restringidos → bloquear publicación y registrar incidente.

## Pendientes humanos

- Política de clasificación que convenga a proyectos reales, especialmente datos privados pero licitamente procesables.
- Reglas de almacenamiento transitorio y destrucción de archivos en servicios externos.
- Autorización por proyecto/artefacto o por lotes bien definidos.
- Política de escaneo de derivados y manejo de falsos positivos.