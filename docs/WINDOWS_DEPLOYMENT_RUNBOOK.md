# Investigador 0.4.0-dev — procedimiento de actualización en Windows (Codex)

**Objetivo:** instalar y comprobar el punto 2 sin borrar el agente existente, sin alterar otros agentes de OpenClaw y sin publicar secretos. Este procedimiento es para el implementador en la PC; no afirma haber ejecutado esos pasos.

## 0. Alcance y entrada

Repo: https://github.com/mxlzz/investigador-lab

Fuente de implementación: rama `implementacion/investigador-local` y su commit concreto más reciente. No descargar solamente `main`: puede contener únicamente diseño y el workflow de despacho.

Antes de tocar Windows: revisar `docs/EXPERIMENT_RUNNER_STATUS.md`, último resultado verde de `.github/workflows/node-tests.yml` y este runbook. No marcar entrega completa hasta pasar aceptación.

## 1. Inventario real, sin suponer rutas

Con herramientas locales autorizadas de Codex:

1. Determinar qué instalación de OpenClaw Gateway utiliza la app de Microsoft Store (en la evidencia previa era 2026.11.1). No crear Gateway o instalación adicional.
2. Localizar agente `investigador`, workspace, ruta del Node.js 24 en uso, definición MCP `research` y automatización existente `investigador-documental-local`.
3. Leer `research health` y `scheduler`, registrar versión activa, raíz `INVESTIGADOR_ROOT` y si hay lease/job ejecutándose. Si hay ejecución activa, esperar el punto seguro sin terminarla a la fuerza.
4. Copiar **fuera del repositorio público** los datos locales `research-state/`, registro de tareas, configuración del MCP y archivos de identidad/instrucciones del agente. No incluir tokens en logs, evidencia ni GitHub.
5. Registrar un rollback: rutas de origen y copia, versión/código actual, definición de job y procedimiento para volver al MCP anterior.

## 2. Actualización de archivos

1. Obtener un checkout limpio de `implementacion/investigador-local` y fijar su SHA completo; comprobar que contiene `implementation/`, `spec/`, `tests/` y `experiments/`.
2. Ejecutar pruebas con el Node 24 real: `node --test tests/engine.test.mjs tests/mcp.test.mjs tests/scheduler.test.mjs tests/remote-experiment-runner.test.mjs tests/github-experiments.test.mjs`.
3. Sin sobrescribir los expedientes privados, actualizar la raíz del motor y `spec/` que utiliza el MCP existente. El runtime debe poder abrir sus prompts desde `INVESTIGADOR_ROOT/spec/07-prompts/` y escribir exclusivamente en `research-state/`.
4. Actualizar `AGENTS.md` del agente de forma controlada y conservando identidad/configuración local: el texto de referencia se encuentra en `implementation/workspace/AGENTS.md`. No reemplazar otros agentes.
5. Si cambió el ejecutable Node o `implementation/scheduler-tick.mjs`, ajustar solamente el job ya instalado (no duplicarlo). Registrar cualquier cambio de rutas en configuración privada local.

## 3. GitHub Actions — autorización mínima

1. Comprobar que `.github/workflows/investigador-experiment.yml` está en la **rama predeterminada** del repo (GitHub exige esto para `workflow_dispatch`). El workflow solo acepta dispatch manual, usa runner efímero, `contents: read`, checkout de commit SHA y no contiene secretos.
2. Configurar `INVESTIGADOR_GITHUB_REPO=mxlzz/investigador-lab` en el proceso del motor.
3. Para `experiment_submit` hace falta **credencial de GitHub** con acceso a ese repositorio y permiso de Actions para disparar workflows; para lectura de runs/artefactos, Actions lectura. Guardarla usando un mecanismo local protegido y proporcionar `INVESTIGADOR_GITHUB_TOKEN` únicamente al proceso MCP/worker; nunca en `AGENTS.md`, tareas, JSON de expediente ni repositorio.
4. Si no existe credencial autorizada, conservar la investigación documental activa y reportar `experiment_submit` como bloqueo explícito. No inventar un token ni abrir permisos generales para resolverlo.
5. Comprobar que se mantiene el presupuesto monetario cero, la visibilidad pública seleccionada expresamente para el proyecto y el límite de tiempo del runner. Ningún dato privado se envía.

## 4. Prueba de aceptación real, con proyecto público de infraestructura

1. Recuperar `health`: debe informar `version: 0.4.0-dev` y operaciones `experiment_plan`, `experiment_submit`, `experiment_poll`.
2. Crear un proyecto de prueba **explícitamente público** y un expediente auténtico con hipótesis, revisión focalizada y diseño aceptados. El smoke `runner-smoke` de `experiments/runner-smoke/manifest.json` sirve para verificar tubería, **no** para afirmar descubrimiento científico.
3. Obtener del commit fijado el SHA256 de `JSON.stringify(manifest)`; registrar `experiment_plan` vinculado a la hipótesis, con `classification:"public"` y `monetary_budget:0`. Verificar que un plan sin novedad/diseño o con proyecto privado sea rechazado.
4. Enviar `experiment_submit` **una vez**. Si la respuesta es incierta, no crear otro request: consultar `experiment_poll` y buscar el ID persistido.
5. Verificar un workflow `Investigador experiment <request_id>` realmente ejecutado por GitHub Actions; comprobar runner, commit inmutable, nombre del manifiesto y código baseline/candidato.
6. Continuar `experiment_poll` hasta recibir `status: imported`; comprobar en `research-state/` que hay **un solo** registro `experiment_result` con run ID, SHA, metricas, artefacto y enlace GH, sin secretos.
7. Solicitar `evaluation` sobre la **clave del evento** importado, no sobre un ID inventado. Evaluar comparación, validez y limitaciones; verificar que se pueda elegir `next_cycle` para nueva investigación.
8. Reiniciar solo el Gateway de OpenClaw si es necesario para cargar la nueva configuración; confirmar después `health`, persistencia del expediente, job único y ausencia de regresiones en otros agentes.

## 5. Criterios de aceptación

La actualización local se considera validada solo cuando:
- El MCP conectado es 0.4.0-dev, no un proceso temporal paralelo.
- Las pruebas Node pasan en la PC.
- Hubo un dispatch real con resultado descargado y ligado al plan registrado.
- La fase `evaluation` consumió ese resultado y el planificador puede continuar con evidencia.
- No se ejecutó código experimental dentro de Windows, no se exportaron secretos o datos privados, no se creó otro agente ni otro Gateway y no hubo gasto autorizado fuera de cero.
- El journal histórico sigue íntegro y el rollback sigue disponible.

En caso de fallo, conservar evidencia privada, revertir los binarios/instrucciones y configuración MCP al snapshot, sin borrar `research-state/`. No afirmar «entregado» por haber pasado solo las pruebas de GitHub Actions.

## Estado actual de la dependencia remota

El workflow de dispatch está habilitado en `main` y la prueba real de GitHub Actions pasó. Ver `docs/EXPERIMENT_LIVE_ACCEPTANCE.md`. El paso pendiente para Codex es instalar y probar el mismo circuito desde Windows; no volver a plantear la conexión remota como inexistente.

### Identidad administrada y empaquetado MSIX

El motor admite `INVESTIGADOR_GITHUB_CREDENTIAL_LAUNCHER` y `INVESTIGADOR_GITHUB_PROFILE`: son rutas locales sin secretos, no el token. Configurarlas tanto en el MCP stdio como en el payload del job existente. El cliente captura en memoria la salida del launcher validado; no reenvía stdout/stderr del hijo, no escribe el secreto en el expediente y no lo envía al host de descarga de artefactos. La identidad se valida de nuevo por operación. `research(operation="github_status")` permite verificar el acceso sin shell; lectura correcta no demuestra permiso de dispatch.

En la instalación MSIX observada, los hijos del agente no pudieron cargar el complemento nativo ni ejecutar el helper de seguridad dentro de WindowsApps. El planificador sí pudo. Se preparó una copia portable de las mismas dependencias oficiales y del launcher original, conservando la validación ACL, propietario, enlaces, identidad del archivo y YAML. Ver `tools/prepare-openclaw-github-runtime.mjs`. No desactivar validaciones ni abrir el perfil a otros usuarios para sortear el error.

La credencial fine-grained requiere **Actions: Read and write**, limitada al repositorio autorizado. Si GitHub devuelve `403 / Resource not accessible by personal access token` y `X-Accepted-GitHub-Permissions: actions=write`, el operador debe modificar ese permiso en GitHub. No repetir un dispatch incierto ni registrar resultados manualmente. La prueba Windows sintética aislada está en `tests/windows-github-acceptance.mjs` y requiere habilitación explícita; su estado permanece bajo `.acceptance/`, separado de investigaciones reales.
