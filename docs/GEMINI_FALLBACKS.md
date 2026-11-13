# Respaldos Gemini del investigador

Configuración aplicada el 2026-11-13, OpenClaw 2026.11.1. El investigador hereda google/gemini-3.5-flash-lite como principal y tiene fallbacks propios, en este orden:

1. google/gemini-3.6-flash
2. google/gemini-3.1-flash-lite

Los tres están en el catálogo del Gateway instalado. Se conservó el principal global y la configuración del agente main. Se añadieron las dos referencias al listado de modelos permitidos. No se crearon agentes adicionales ni se cambiaron credenciales o facturación.

## Presupuesto y réplica

INVESTIGADOR_AGENT_TIMEOUT_SECONDS=1800 sigue siendo el límite de cada candidato. El nuevo INVESTIGADOR_MODEL_ATTEMPTS=3 reserva tiempo para el principal y ambos respaldos. Debe estar tanto en el entorno del MCP como en el payload del job.

| Componente | Segundos | Minutos |
| --- | ---: | ---: |
| Cada modelo | 1800 | 30 |
| Worker completo | 5460 | 91 |
| Job sin salida | 5970 | 99,5 |
| Job completo | 6000 | 100 |
| Reserva exclusiva del proyecto | 6300 | 105 |

La reserva evita que los ticks de 15 minutos dupliquen trabajo. Este cambio no modifica el presupuesto de los experimentos remotos. Son techos, no una espera obligatoria antes de cambiar de modelo; el runtime decide cuándo reintentar o avanzar según el error y la seguridad de repetición.

Para replicarlo, usar la guía REPLICAR_EN_WINDOWS.md con la rama fix/gemini-fallbacks. En la entrada local del generador tools/openclaw-setup-files.mjs agregar:

```json
{
  "model": "google/gemini-3.5-flash-lite",
  "modelFallbacks": ["google/gemini-3.6-flash", "google/gemini-3.1-flash-lite"],
  "agentTimeoutSeconds": 1800
}
```

Esto se agrega a las rutas y demás campos personales requeridos por la guía. El generador produce un fragmento con modelo y respaldos específicos del investigador, los dos entornos coherentes y un job inicialmente pausado. Al aplicarlo a una instalación existente, actualizar el job existente, no crear otro; conservar el resto del payload. Si se agregan o eliminan candidatos, ajustar también MODEL_ATTEMPTS (1 a 3). Ausente, conserva el presupuesto previo de un modelo.

## Verificación y límites

78 pruebas locales pasan, incluyendo cálculo para tres candidatos, rechazo de un worker demasiado corto y generación coherente de los fragmentos. El Gateway aceptó y aplicó en caliente el cambio de configuración; el job existente quedó habilitado con los nuevos tiempos y se recargó MCP. Copias previas privadas permiten restaurar los dos módulos y la configuración.

El intento de prueba directa seleccionando cada modelo fue rechazado antes de contactar al proveedor: el RPC agent no autoriza overrides provider/model para este cliente. Por eso no se afirma una prueba real de respuesta de cada respaldo ni una conmutación end-to-end. El catálogo no garantiza cuota de la cuenta. Los respaldos Gemini pueden compartir límites del proyecto Google y no solucionan una caída de todo el proveedor ni errores de contrato de herramientas.

Referencias: [OpenClaw model failover](https://docs.openclaw.ai/concepts/model-failover), [catálogo oficial Gemini](https://aistudio.google.com/docs/models). Los snapshots anteriores se conservan; este documento describe la nueva instalación, sin publicar estado de investigación ni secretos.
