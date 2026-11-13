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
