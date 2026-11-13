# Plazos del investigador y experimentos largos

## Diagnóstico y corrección

El worker programado pasaba `--timeout 180` al agente y lo terminaba a los 210 segundos. El job nativo tenía 240 segundos y un corte sin salida de 230; la reserva del planificador duraba 8 minutos. Un fallo real de extracción de evidencia se registró como `Timeout del ciclo` en ese límite: todavía no era un experimento.

Los plazos ahora se derivan juntos de `implementation/timing.mjs`:

| Capa | Valor predeterminado |
|---|---:|
| Turno programado del agente | 1800 s — 30 min |
| Worker que espera al CLI | 1860 s — 31 min |
| Job nativo | 2400 s — 40 min |
| Límite sin salida del job | 2370 s — 39,5 min |
| Reserva del planificador | 2700 s — 45 min |

El margen externo cubre cierre y sincronización de avances. La reserva evita que otro tick de 15 minutos tome el mismo paso mientras sigue ejecutándose. No se eliminan los límites ni se cambia la cuota diaria.

`INVESTIGADOR_AGENT_TIMEOUT_SECONDS` acepta de 60 a 7200 segundos. El MCP y el job deben recibir el mismo valor; al modificarlo, regenerar/aplicar el job con `tools/openclaw-setup-files.mjs`, porque aumentar solo el plazo interior no amplía el corte del Gateway. La entrada del generador admite `agentTimeoutSeconds` (1800 por defecto).

## Chat y proveedor son otras capas

En la instalación observada no había un límite global corto: OpenClaw 2026.11.1 documenta 48 horas por intento cuando `agents.defaults.timeoutSeconds` está ausente. La corrección afecta a los turnos programados que imponían explícitamente 3 minutos; no reduce ese default global ni modifica otros agentes.

Los logs también muestran `Google Interactions stream ended before a terminal event`, presentado como `LLM request timed out`. Un stream que se cierra antes de terminar no se arregla solo dando más tiempo. Los watchdogs del proveedor siguen siendo independientes; no se cambiaron silenciosamente el modelo, su transporte o las credenciales. Si persiste ese síntoma, diagnosticar el proveedor y no repetir acciones externas inciertas.

## Experimentos: ejecución asíncrona, no un chat esperando horas

El runner actualizado admite `manifest.timeout_seconds` de hasta **3600 segundos por prueba**. Hay dos pruebas (baseline/candidato); el workflow público dispone de **130 minutos**, incluidos 10 minutos de margen. El valor predeterminado del runner sigue siendo 30 segundos si el manifiesto no lo especifica: ampliar el máximo no convierte todos los experimentos en trabajos de una hora.

El workflow de la rama predeterminada se amplió en el commit `da7df2bf5a43cb70cddc84a74811bd4ff4680c01`. No se cancelaron ejecuciones ni se cambiaron sus solicitudes ya guardadas. El runner largo está en este snapshot; **el `source_commit` de un plan nuevo debe contener esa versión del runner**. Un experimento que fija un commit antiguo conserva el código y el límite de ese commit. No se reescriben planes/manifiestos ya aprobados: el tiempo es parte del manifiesto público y su SHA256.

`experiment_submit` solicita el trabajo y termina; `experiment_poll` comprueba su estado en ticks posteriores. Un estado `running` conserva la solicitud y programa otra consulta, sin ocupar un turno del modelo durante todo el experimento ni dispararlo otra vez. Esta separación permite que el experimento dure más que un turno local.

Se mantienen los requisitos de repositorio/código/datos públicos, runner estándar, presupuesto monetario cero y procedencia verificada. GitHub documenta [hasta 6 horas por job hospedado](https://docs.github.com/en/enterprise-cloud@latest/actions/reference/limits) y [runners estándar gratuitos en repositorios públicos](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job). No se habilitan runners grandes, datos privados ni experimentos locales.

## Verificación y despliegue

La suite pasa 74 pruebas. Se comprueba que el CLI recibe 1800, que un hijo bloqueado se termina con un presupuesto reducido de prueba, que la reserva sigue ocupada al llegar el siguiente tick y que el runner acepta 3600/rechaza 3601. El workflow cubre ambos trials más el margen. Esto prueba los presupuestos y su coherencia; no afirma haber mantenido un experimento real una hora para medir el reloj.

En Windows se respaldaron código, configuración y estado; se actualizaron el worker/MCP y el único job existente, conservando el expediente. Se reanudó la fase pendiente sin reinicializar el proyecto ni borrar su historial de fallos. La [guía de réplica](REPLICAR_EN_WINDOWS.md) y su generador contienen los mismos valores. El snapshot anterior sigue disponible sin modificaciones.
