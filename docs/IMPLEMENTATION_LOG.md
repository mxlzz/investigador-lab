# Registro de implementación

## 2026-11-13 — recuperación de publicación experimental

Tres intentos de experiment_plan terminaron sin plan confirmado: faltaba la capacidad de publicar scripts/manifiesto y se había aceptado un diseño con hipótesis inexistente. Se implementó ExperimentPublication y experiment_publish, diseño/plan estructurados gestionados por el host, validación científica antes de escribir, intención durable, rama determinista sin force y lectura independiente del commit antes de registrar el plan. La cola de evaluación ahora resuelve sus dependencias experimentales y no reutiliza planes de un diseño anterior.

86 pruebas locales aprobadas. Despliegue con backup, expediente conservado, diseño real corregido y circuito Windows → GitHub → Windows completado: publicación a16996100a4af642a9de1fcd284a135f19631d9d, Actions 43519292261 success, artefacto verificado e importado. La evaluación también mostró accept sin key/envelope; se amplió el manejo estructurado a evaluación e informe y se reanudó tras comprobar la terminación del intento anterior, sin repetir el experimento. El host normaliza el ID lógico solo ante un recibo verificado único; se recuperó y aceptó la evaluación ya generada, sin modificar hallazgos, y se confirmó el informe. El proyecto continúa habilitado. Reproducción, diagnóstico, aceptación y límites científicos en docs/EXPERIMENT_PUBLICATION_RECOVERY.md. Los respaldos Gemini y los presupuestos anteriores se conservan; no se publican credenciales ni sesiones.

## 2026-11-12 — base 0.2.0 y alcance de la siguiente etapa

El usuario autorizó crear el agente en OpenClaw, completar su funcionamiento y dejar el trabajo registrado en GitHub.

Base ya instalada: motor documental Node.js, MCP research, persistencia, validación de fases y referencias, reporter preparado y 13 pruebas automatizadas. OpenClaw descubrió el MCP y consultó health correctamente. No hubo todavía una investigación documental completa con fuentes reales.

Prioridad actual: (1) probar investigación documental real; (2) continuidad automática entre sesiones mientras la PC/Gateway estén encendidos; (3) experimentos aislados si es viable después. La continuidad con PC apagada y Telegram quedan aplazados. La auditoría independiente será ChatGPT mediante GitHub y no se integra en esta etapa.

Se publican únicamente código, pruebas y documentación técnica. Los expedientes, credenciales, configuración privada del Gateway y tokens permanecen fuera del repositorio.

Esta entrada no declara completados los puntos 1 y 2: sus resultados se agregarán cuando haya evidencia de prueba.

## 2026-11-12 — investigación real y continuidad local 0.3.0

Se agregó búsqueda bibliográfica Crossref y lectura específica de resúmenes arXiv, con procedencia, límites de tamaño/tiempo y registros persistidos por el motor. Se reforzó la distinción entre resumen, metadatos y texto completo.

Se implementó una cola persistente con leases, exclusión, recuperación, pausa/reanudación, backoff, límite diario y revisión explícita de proyectos dentro de la misma meta. Un worker solicita pasos al agente real mediante el Gateway existente; sin trabajo elegible no llama al modelo. Se registró la automatización nativa y se dejó su cadencia final en 15 minutos.

La prueba técnica ResNet completó el recorrido documental con fuentes públicas reales y continuaciones disparadas por el Gateway. La prueba final de cola vacía confirmó NO_REPLY. La versión final tiene 30 pruebas automatizadas aprobadas. Evidencia, correcciones y límites: LOCAL_ACCEPTANCE.md y su traza JSON sanitizada.

Los puntos prioritarios 1 (investigación documental probada) y 2 (continuidad local entre sesiones) quedan operativos dentro del alcance descrito. El punto 3 no se habilita sin un ejecutor aislado; Docker no está disponible y WSL informó no estar instalado. Telegram, auditoría y continuidad remota continúan aplazados. No se publicaron credenciales ni el expediente privado completo, ni se hizo merge o release estable.

## 2026-11-12 — auditoría de alcance y correcciones urgentes (rama experimental)

Revisión externa al PR #2 identificó: integración limitada a fuentes Crossref/arXiv, motor de experimentos bloqueado por ausencia de sandbox, auditoría independiente no conectada, continuidad con PC apagada no implementada y reporte Telegram sin activar. Se corrigió en código el orden de prioridad de proyectos y el reintento de entregas inciertas. Se incorporaron pruebas de regresión y workflow de CI; los resultados de las pruebas **no se declaran aprobados** hasta observar su ejecución en GitHub.

El estado de instalación local de Codex previo a estas correcciones no garantiza que el código nuevo esté desplegado en la PC; requiere sincronización y pruebas reales de OpenClaw. Ningún release estable ni merge a main fue realizado.

## Ciclo de investigación posterior al informe (experimental)

Se añadió la fase `next_cycle` al planificador del flujo `research` (sin afectar el modo documental): selecciona una nueva fase conocida desde un dictamen con snapshot de estado, justificación y artefactos esperados. Las acciones arbitrarias no son ejecutables. Se agregaron pruebas de que no fabrica ciclos en modo documental y de que rechaza comandos no admitidos. La ejecución experimental continúa bloqueada hasta disponer de un runner aislado.

## Ejecutor de experimentos públicos en CI (experimental)

Se agregó un runner de comparación baseline/candidato para código de `experiments/` con límites temporales, recibos con hashes y ejecución en GitHub Actions sin secretos. Se incluyó un smoke test deliberadamente sintético para demostrar que corre en runner hospedado. Esto NO demuestra mejora científica real ni habilita ejecución experimental desde el agente local: faltan importación verificable del resultado al expediente y controles por disciplina.

## 2026-11-12 — Integración experimental pública 0.4.0-dev

Se creó `implementation/github-experiments.mjs` y `.github/workflows/investigador-experiment.yml`. El planificador y el MCP ya pueden preparar un experimento público, solicitar ejecución, recuperar y validar el recibo GitHub y registrar el resultado de forma trazable antes de permitir `evaluation`. Se agregaron pruebas con API GitHub simulada, chequeos de proyectos privados y falsificación de recibos, y continúa el smoke real del runner en CI. El workflow de dispatch requiere presencia en la rama predeterminada y autorización GitHub desde el Gateway para poder correr. El estado instalado en Windows permanece por verificar.

## Aceptación real del punto 1

GitHub Actions ejecutó el workflow manual (run 43350903439); el controlador (run 43350881884) descargó y verificó el artefacto, escribió un experiment_result y aceptó evaluation. 43 pruebas pasaron en run 43350881800. Se habilitó **solo** el workflow de dispatch en main, sin merge del PR #2. Punto 2: Windows/Gateway pendiente. Referencias completas en docs/EXPERIMENT_LIVE_ACCEPTANCE.md.

## Despliegue Windows 0.4.0-dev

Se instaló la versión de la rama fijada en a5babf4, conservando expedientes y agente principal. Se agregaron correcciones de herramientas directas, sesiones nuevas por ciclo, errores de esquema reparables y detección de ciclos sin progreso confirmado. 47 pruebas locales pasaron. El MCP real informa 0.4.0-dev. La aceptación experimental completa sigue bloqueada por autorización local de GitHub Actions; no se sustituye por los recibos de CI. Ver WINDOWS_LOCAL_ACCEPTANCE.md.

La aceptación local de next_cycle quedó confirmada mediante salida JSON del modelo, validada y persistida por el host. Los intentos fallidos previos se conservaron. No se declara completada la prueba experimental Windows hasta disponer de autorización de Actions.


### GitHub administrado desde Windows

Se instaló gh portable oficial y se corrigió el ACL del perfil privado. Se integró la identidad administrada al MCP y al worker mediante captura en memoria del launcher validado, y se preparó su runtime portable para evitar el fallo nativo de WindowsApps. El agente real verificó lectura autenticada y workflow activo mediante github_status. 51 pruebas pasan. El dispatch de aceptación fue rechazado con 403; GitHub identifica el permiso faltante actions=write. No hay aceptación experimental Windows completa ni resultado científico. La shell general de MSIX conserva un fallo de launcher; el MCP específico está operativo. Detalles y pasos pendientes: docs/WINDOWS_GITHUB_SETUP.md. Sin secretos ni expedientes privados en el commit.

### Repositorios por investigación

Implementadas research_start, project_repository, project_github_status, github_sync, github_repositories y github_read. El inicio crea un destino privado automáticamente, o vincula uno existente; fuentes y resultados se mantienen separados. El host sincroniza fases aceptadas en una rama por proyecto con actualizaciones fast-forward, preservando archivos existentes. La intención de creación durable y el marcador remoto permiten recuperar respuestas perdidas sin duplicar repositorios. La lectura de fuentes fija commit y no ejecuta código. Se exportan avances y referencias sin textos completos ni credenciales.

Instalado en el agente OpenClaw existente, con backup privado y mismo job de 15 minutos. 67 pruebas locales aprobadas. Verificación real: lectura y registro de una fuente GitHub correctos; descubrimiento correcto; creación de un repositorio privado y primer commit de avances confirmados. Tras corregir los permisos Contents y Repository creation en el token, la segunda sincronización devolvió unchanged. Una lectura independiente desde GitHub verificó que el ref apunta al commit registrado y que el archivo remoto coincide exactamente con el snapshot local, sin textos completos de fuentes. CI aprobada para el commit de código e94952b. La fixture queda pausada y no representa una investigación científica. Guía: docs/PROJECT_REPOSITORIES.md.

### Snapshot y procedimiento de réplica

Se centralizó la reconstrucción en docs/REPLICAR_EN_WINDOWS.md y replication/environment.json, con versiones observadas, separación de pasos personales, rutas por PC, configuración MCP, job único, ACL del perfil, runtime portable, aceptación y rollback. README enlaza la guía y distingue implementación de documentos históricos. El snapshot replica/windows-2026-11-13 reúne los cambios de las PR #4–#6; no requiere aplicar parches por separado ni clonar main como si fuera la implementación instalada.

Se agregaron un generador de fragmentos locales sin secretos, transporte RPC desde archivos JSON y verificador independiente de ref/archivo remoto. El preparador del runtime exige OpenClaw 2026.11.1 y destino vacío. Se verificó una construcción real en carpeta vacía y la carga del addon nativo copiado; los comandos PowerShell de la guía se analizaron sin ejecutarlos. Suite completa: 70 pruebas aprobadas. No se reinstaló el SO ni se afirma compatibilidad universal con otras versiones de OpenClaw. Las cuentas, sesiones y credenciales se conectan por separado en cada PC.

### Plazos de investigación y experimentos largos

Diagnóstico: el worker imponía 180 s al CLI, 210 s al proceso y el job externo 240/230 s, con reserva de 8 min. Un fallo real de extract_evidence alcanzó ese límite antes de cualquier experimento. Se agregó una política compartida de 30 min para el agente, 31 para el worker, 40 para el job, 39,5 sin salida y 45 de reserva. MCP/job reciben INVESTIGADOR_AGENT_TIMEOUT_SECONDS y el generador deriva los márgenes. El expediente activo se conservó y quedó habilitado para continuar desde su fase pendiente.

El runner permite hasta 3600 s por trial y el workflow público 130 min para dos trials más margen. Se publicó únicamente ese cambio de tiempo en el workflow de main (da7df2b); los nuevos planes deben fijar un source_commit con el runner actualizado, sin reescribir planes antiguos. Los logs de Google Interactions con stream terminado prematuramente se distinguen del límite local; no se alteró el proveedor global. 74 pruebas aprobadas, con deadlines y exclusión entre ticks verificados. Guía: docs/TIEMPOS_DE_EJECUCION.md. Nuevo snapshot: replica/windows-2026-11-13-timeouts; el snapshot previo se mantiene.
