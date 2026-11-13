# Motor documental local 0.3.0

Implementación Node.js 24 sin dependencias npm. El modelo y sus credenciales los proporciona el Gateway existente de OpenClaw. No es todavía el sistema completo propuesto en spec/.

## Uso y pruebas

```text
node implementation/engine.mjs health
node --test tests/engine.test.mjs tests/mcp.test.mjs tests/scheduler.test.mjs
node implementation/mcp-server.mjs
```

El servidor MCP expone research: init/projects/state, prepare/accept, record, bibliography, arxiv_abstract, scheduler/control, report y gate. prepare conserva el sobre exacto y devuelve sus prompts y contrato. accept permite enviar envelope={task_id:ID} sin reconstruir el expediente. La versión y hashes de prompts se registran sin copiar recursivamente todo el historial.

bibliography consulta Crossref (hasta cinco resultados, reutilización de una consulta durante 24 h), guarda sus metadatos/resúmenes y una búsqueda ejecutada con procedencia HTTP. arxiv_abstract recupera únicamente resúmenes de URLs canónicas arxiv.org/abs. No requiere claves. Crossref no cubre toda la literatura ni reemplaza una búsqueda web general. Los contenidos externos son datos no confiables; no se ejecutan.

## Planificador local

Install-scheduler.ps1 recibe las rutas del workspace, Node y CLI existente de OpenClaw. Registra una automatización nativa con declaración estable para evitar duplicados. Cadencia normal: 15 minutos. No hay llamadas al modelo cuando no hay trabajo elegible. La PC y el Gateway deben estar encendidos.

Cada ejecución toma un lease persistente y solicita un paso al agente investigador mediante el Gateway. El agente recupera el expediente y confirma sus salidas con el MCP. Límites: un proyecto por tick, hasta 24 intentos por día de Buenos Aires, 180 s por turno solicitado, corte del proceso cliente a 210 s y watchdog del job a 240 s. Son límites técnicos; no garantizan cuotas ni costo del proveedor.

La cola mantiene exclusión, backoff y pausa tras tres fallos; una fase blocked pausa el proyecto. Tras una interrupción se reconcilian los registros aceptados antes de elegir el próximo paso. Un bloqueo de proceso se recupera solo si el PID ya no existe; con PID vivo o ambiguo se falla de forma visible. Un journal corrupto no se repara inventando eventos.

control con enabled=false pausa los próximos ciclos; no interrumpe una operación ya en curso. enabled=true reanuda con motivo. data.workflow=documentary selecciona encargo → búsqueda → evidencia → síntesis → informe sin forzar hipótesis ni experimentos. research conserva hipótesis y revisión de antecedentes. Para volver sobre la misma meta ante evidencia nueva, data.restart_from=search_plan programa una revisión; se exigen nuevos registros, no basta un éxito anterior. No se reabre un proyecto solo para consumir ciclos.

La automatización no entrega mensajes externos. El progreso se consulta al agente y en research-state/. La prueba técnica completa está documentada en docs/LOCAL_ACCEPTANCE.md.

## Telegram y auditoría: aplazados

Los scripts de Telegram de 0.2 siguen disponibles, sin activar. No se pidieron ni publicaron tokens. La auditoría independiente se prevé con ChatGPT a través de GitHub, por indicación del usuario; no se conecta en esta etapa. No son requisitos para investigar documentos.

## Límites y mantenimiento

Los esquemas fuente siguen siendo borradores con campos abiertos. Se comprueban estructura, dependencias, versiones y referencias, no verdad científica ni respaldo semántico. Una afirmación de un paper no es una reproducción propia.

El motor rechaza experimentos, transferencias remotas y publicaciones estables. No hay Docker ni WSL instalados en la PC comprobada. No se ejecuta código externo sin un runner aislado. El motor MCP no es un sandbox de todas las herramientas nativas de OpenClaw. No hay continuidad con la PC apagada ni sincronización de expedientes con GitHub.

La programación se conserva en el almacén nativo del Gateway. Una actualización de la app que cambie las rutas de Node/CLI requiere comprobar y ajustar la definición del job. No se reinició el Gateway del usuario para probar persistencia; se verificaron procesos nuevos de worker, estado guardado y definición nativa.

No publicar research-state/, credenciales, tokens ni configuración privada de OpenClaw. El journal detecta cambios accidentales; su hash no es una firma contra un atacante con escritura total del workspace.

## Correcciones posteriores a 0.3.0 (en rama experimental)

- Selección por prioridad humana antes que antigüedad de último intento; turnos justos entre proyectos de igual prioridad. Un proyecto de mayor prioridad puede acaparar ejecución mientras tenga trabajo elegible: una política de equidad global requiere diseño específico.
- Ante envío Telegram de resultado incierto, conservar informe y reintentar automáticamente tras una espera; puede existir un duplicado excepcional si Telegram había recibido la solicitud pero se perdió la confirmación. Se privilegia cumplir el envío sin intervención del usuario.
- CI en GitHub comprueba Node 24 y la batería de tests en pushes y PRs. Una ejecución de CI no reemplaza pruebas sobre el Gateway, Telegram ni sandbox reales.

## Ampliación de antecedentes (experimental)

`openalex_bibliography` permite una segunda búsqueda bibliográfica (OpenAlex), con hasta quince resultados por consulta, caché de 24 h, control de procedencia, niveles reales de acceso y deduplicación de DOI. Acepta `OPENALEX_API_KEY` **opcional** para ampliar cuota gratuita; sin clave puede restringirse el uso habitual. No activa servicios pagos ni expone claves en registros de búsqueda. Es un complemento documental, no sustituye búsqueda de código, patentes ni lectura completa.

## Ciclo científico continuo (versión experimental)

Para encargos en modo `research`, después del informe documental el planificador ahora ejecuta `next_cycle`: el modelo debe proponer una fase de investigación concreta, justificar su valor informativo y referenciar el estado exacto del expediente. El motor acepta solamente fases conocidas; el planificador crea una cola con esas fases y conserva el historial. Si no hay trabajo útil, el agente devuelve `selected_action:null` y el proyecto queda en reposo, sin ciclos artificiales. En modo `documentary` se cierra la síntesis sin forzar ciclos posteriores.

**Límite:** este ciclo permite nueva investigación documental y diseño, pero NO habilita ejecución experimental no aislada. La prueba de mejora técnica sigue bloqueada mientras no haya runner seguro.
