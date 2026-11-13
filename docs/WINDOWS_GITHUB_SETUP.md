# GitHub del investigador: configuración local y límite pendiente

## Cambios instalados

- GitHub CLI oficial 2.104.0 portable, con SHA256 comprobado contra el checksum oficial.
- Perfil administrado restringido al propietario y SYSTEM; directorio y hosts.yml pasan la comprobación nativa de ACL, sin acceso de grupo o público.
- Puente de credencial en memoria para MCP y worker. Configuración local contiene solo rutas; no se publica el token ni el perfil privado.
- Launcher oficial y dependencias fs-safe 0.26.5/yaml copiados fuera de WindowsApps, con hashes comparados. Se conservan todas las verificaciones del launcher original. El script de preparación fija los nombres de chunks de OpenClaw 2026.11.1: revisar ante actualización del paquete.
- Operación MCP `github_status`, que permite comprobar lectura y workflow sin usar shell ni inferir permiso de ejecución.

## Verificación en el equipo

51 pruebas Node aprobadas, incluidas captura privada, supresión de secretos en errores, rechazo de salida multilínea y ausencia de Authorization en redirecciones de artefactos. La CI incluye las nuevas pruebas.

El agente real invocó `research(operation="github_status")` y obtuvo:

```json
{"repository":"mxlzz/investigador-lab","authenticated":true,"workflow":"active","dispatch_permission":"not_checked"}
```

El job documental existente conserva su frecuencia de 15 minutos y recibe las mismas rutas de identidad. No se duplicó el job periódico ni se habilitó un proyecto de investigación nuevo. Los expedientes previos se preservan.

## Bloqueo confirmado por GitHub

La prueba sintética aislada registró un único intento de dispatch. GitHub respondió 403. Una comprobación negativa sin `ref` (incapaz de iniciar un workflow) confirmó `Resource not accessible by personal access token` y `X-Accepted-GitHub-Permissions: actions=write`.

Hace falta modificar el token fine-grained en GitHub: seleccionar el repositorio investigador-lab y habilitar **Repository permissions → Actions → Read and write**. No ampliar a todos los repositorios. Si cambia el valor del token, guardarlo de nuevo en OpenClaw → Settings → Profile → System GitHub. Nunca enviarlo al chat.

No se afirma aceptación experimental completa: no hubo run remoto, importación ni evaluación Windows con esta credencial. Conservar el intento rechazado y, tras resolver el permiso, comprobar que no hubo run antes de preparar una nueva solicitud controlada. La fixture está en `.acceptance/`, separada del journal de investigaciones reales, y no establece novedad científica.

## Limitación adicional de OpenClaw MSIX

La herramienta general `exec` todavía falla en su launcher propio al cargar el componente de validación desde WindowsApps. El MCP del investigador usa el runtime portable y sí funciona; no se modificaron binarios del paquete MSIX, ni se desactivaron comprobaciones para corregir `exec`. No presentar la shell general como validada. Telegram, auditor independiente y ejecución con PC apagada siguen fuera de esta etapa.

Referencia del permiso requerido: https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event
