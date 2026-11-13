# Registro de implementación

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

Instalado en el agente OpenClaw existente, con backup privado y mismo job de 15 minutos. 67 pruebas locales aprobadas. Verificación real: lectura y registro de una fuente GitHub correctos; descubrimiento de repositorios correcto; creación automática bloqueada por GitHub 403 POST /user/repos, que exige administration=write o repository_creation=write. La fixture de aceptación queda pausada y sin hallazgos científicos inventados. No se afirma creación ni sincronización remota exitosa hasta habilitar los permisos del token. Guía: docs/PROJECT_REPOSITORIES.md.
