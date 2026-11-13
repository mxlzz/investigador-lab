# Replicar la instalación del investigador en Windows

Esta es la entrada única para reconstruir la instalación documentada. El snapshot `replica/windows-2026-11-13-timeouts` contiene todo el código de las PR #4, #5 y #6 y estas herramientas de reproducción. **No alcanza con clonar `main`**, ni hace falta aplicar las PR una por una. El enlace por SHA del snapshot permite fijar una copia inmutable aunque cambien las ramas.

El procedimiento es parametrizado, no un instalador universal de un clic. La instalación de OpenClaw, la conexión del proveedor del modelo y el guardado del token son pasos personales. No se incluyen sus credenciales en GitHub.

## 1. Qué se está reproduciendo

| Componente | Referencia verificada |
|---|---|
| Plataforma | Windows x64; OpenClaw Gateway MSIX |
| OpenClaw | 2026.11.1, paquete MSIX 2026.11.100.0 |
| Node utilizado | 24.22.1; suite de CI en Node 24 |
| Modelo de la instalación original | `google/gemini-3.5-flash-lite`, configurado en OpenClaw |
| Modo de herramientas observado | `tools.codeMode.enabled=false` |
| Identidad GitHub | Fine-grained PAT guardado por OpenClaw, conexión **System GitHub** |
| Dependencias copiadas del paquete oficial | `@openclaw/fs-safe` 0.26.5, native win32-x64 0.26.5, yaml 2.9.1, esbuild win32-x64 0.28.2 |
| GitHub CLI observada | 2.104.0; no es necesaria para las operaciones MCP de repositorios |
| Continuidad | Un solo job nativo cada 900000 ms (15 minutos), 24 intentos diarios del motor |
| Datos | `research-state/` privado y persistente; repositorios de investigación privados por defecto |
| Día de investigación/informes | Buenos Aires (`America/Argentina/Buenos_Aires`), incluso al copiar a otra zona |

`replication/environment.json` registra estas referencias. OpenClaw y sus binarios oficiales no se redistribuyen aquí. El preparador del runtime rechaza versiones diferentes de OpenClaw: hay que revisar el launcher y sus dependencias antes de adaptar otra versión. No se afirma una prueba de reinstalación del sistema operativo desde cero; sí se verificaron el motor instalado, la aceptación real en GitHub, los generadores locales y una construcción del runtime en un directorio vacío.

Instalá Git para clonar, Node 24 y OpenClaw desde sus fuentes oficiales. Abrí OpenClaw y configurá un proveedor/modelo que responda. Para repetir el modelo de la referencia hace falta tu propia conexión del proveedor; el repositorio no contiene su clave, sesión, cuota ni facturación. GitHub Desktop no es un requisito.

## 2. Obtener una copia completa y registrar su versión

```powershell
git clone --branch replica/windows-2026-11-13-timeouts https://github.com/mxlzz/investigador-lab.git investigador-replica
Set-Location investigador-replica
$RepoRoot = (Get-Location).Path
git rev-parse HEAD
```

Conservá ese SHA junto al respaldo local. Para volver exactamente a una versión, usá `git checkout --detach SHA_COMPLETO` en una copia de trabajo limpia. El baseline del motor ya aceptado antes de agregar esta guía es `0ce89e9b1114926b155ca5d4b650872822a22733`; ese commit anterior no contiene las herramientas nuevas de esta guía, por lo que se debe usar el snapshot completo para reproducirla.

Ejecutá la suite sin credenciales ni acceso a GitHub:

```powershell
node --test tests/engine.test.mjs tests/mcp.test.mjs tests/scheduler.test.mjs tests/remote-experiment-runner.test.mjs tests/github-experiments.test.mjs tests/github-credential.test.mjs tests/github-projects.test.mjs tests/replication-tools.test.mjs tests/timing.test.mjs
```

Son 74 pruebas del motor, integración, tiempos y herramientas de reproducción. No ejecutar indiscriminadamente todos los `.mjs` de `tests/`: los scripts de aceptación live no son pruebas offline.

## 3. Identificar las rutas de esa PC

**Usá la misma cuenta de Windows que ejecuta el Gateway.** No copies el nombre de usuario, el ID del perfil ni las rutas de la PC original. Configuración, estado y credenciales deben pertenecer al Gateway real.

Ejemplo de variables; reemplazá las rutas marcadas con los valores observados:

```powershell
$ErrorActionPreference = 'Stop'
$Node = (Get-Command node -ErrorAction Stop).Source
$ClawRoot = 'C:\RUTA-REAL-DE-OPENCLAW\app'
$StateRoot = Join-Path $env:USERPROFILE '.openclaw'
$ConfigPath = Join-Path $StateRoot 'openclaw.json'
$Workspace = Join-Path $StateRoot 'workspace-investigador'
$ToolsRoot = Join-Path $StateRoot 'tools'
$GitHubRuntime = Join-Path $ToolsRoot 'github-identity-2026.11.1'
$Owner = 'TU-USUARIO-GITHUB'
$RunnerRepo = "$Owner/investigador-lab"
$Model = 'google/gemini-3.5-flash-lite'
```

`$ClawRoot` debe contener `openclaw.mjs`, `package.json`, `dist/` y `node_modules/`. Se puede localizar el paquete con `Get-AppxPackage '*OpenClaw*'` y comprobar su `InstallLocation`; no elegir silenciosamente uno si aparecen varios. `$Node` también puede ser la ruta absoluta del Node 24 que utiliza la app, si no está en PATH. `$StateRoot` y `$ConfigPath` deben coincidir con el Gateway, no con un directorio temporal de un operador.

```powershell
if (!(Test-Path (Join-Path $ClawRoot 'openclaw.mjs'))) { throw 'Ruta de OpenClaw incorrecta' }
$env:OPENCLAW_CONFIG_PATH = $ConfigPath
$env:OPENCLAW_STATE_DIR = $StateRoot
$env:OPENCLAW_NO_RESPAWN = '1'
& $Node (Join-Path $ClawRoot 'openclaw.mjs') --version
& $Node --version
```

En otra cuenta GitHub, `$RunnerRepo` debe corresponder a infraestructura propia si se quieren experimentos. No se pueden despachar workflows de la cuenta original usando un token ajeno. Para investigación documental no hace falta ejecutar un runner; ver la sección 11.

## 4. Crear o conservar el agente y respaldar

```powershell
& $Node (Join-Path $ClawRoot 'openclaw.mjs') agents list --json
```

Si no existe `investigador`, crealo sobre el Gateway abierto:

```powershell
& $Node (Join-Path $ClawRoot 'openclaw.mjs') agents add investigador --workspace $Workspace --model $Model --non-interactive --json
```

Si ya existe, conservá su workspace real y no lo vuelvas a crear. El worker utiliza el ID `investigador`: renombrarlo exige adaptar el código. No cambiar el agente principal ni los otros agentes.

Antes de una actualización: deshabilitar el job del investigador, pausar sus proyectos y esperar a que no haya un lease activo. Guardar fuera del checkout público una copia de `openclaw.json`, la definición del job, el workspace y `research-state/`. Proteger el respaldo como los demás datos privados del Gateway. No imprimir la configuración completa ni subir ese respaldo a GitHub. En una instalación nueva no hay expedientes que restaurar.

Copiá los componentes del snapshot, conservando identidad y datos del agente:

```powershell
foreach ($dir in @('implementation','spec','tests','experiments','docs')) {
    $destination = Join-Path $Workspace $dir
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    Copy-Item -Path (Join-Path $RepoRoot "$dir\*") -Destination $destination -Recurse -Force
}
Copy-Item -LiteralPath (Join-Path $RepoRoot 'implementation\workspace\AGENTS.md') -Destination (Join-Path $Workspace 'AGENTS.md')
```

No copiar `.git/` ni sobrescribir `SOUL.md`, `IDENTITY.md`, `USER.md`, `memory/` o `research-state/`. La plantilla `AGENTS.md` es parte de la implementación y sí se actualiza de forma controlada; respaldar cualquier personalización previa.

## 5. Configurar tu identidad GitHub

En GitHub, crear o editar un **fine-grained token**:

1. Resource owner: tu cuenta (`$Owner`).
2. Repository access: **All repositories**, para los actuales y futuros. Si se eligen repos individuales, habrá que crear cada destino manualmente, añadirlo al token y pasarlo al agente.
3. Repository permissions: **Repository creation → Read and write**, **Contents → Read and write**. Metadata se añade automáticamente.
4. **Actions → Read and write** si se utilizará el runner experimental. No hace falta Administration cuando está disponible el permiso específico Repository creation.
5. Pulsar **Update** al editar. Seleccionar permisos sin guardar no cambia el token.

En OpenClaw: **Settings → Profile → GitHub connections → System GitHub / For the system → Use a PAT instead**. Pegar el token **ahí**, localmente, y guardar la identidad. `My GitHub` es otra conexión y no sustituye la identidad del sistema para esta réplica. No pegar el token en el chat, `AGENTS.md`, JSON de configuración ni variables de la guía.

Resolver el perfil administrado del sistema sin leer el secreto:

```powershell
$CurrentConfig = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$ProfileId = $CurrentConfig.tools.github.profileId
if (!$ProfileId) { throw 'Falta System GitHub; configurar la identidad en OpenClaw' }
$GitHubProfile = Join-Path $StateRoot "credentials\github\system\$ProfileId"
if (!(Test-Path -LiteralPath $GitHubProfile)) { throw 'El perfil no está en el estado del Gateway seleccionado' }
```

Esta guía utiliza la identidad del sistema heredada. Si hay un override GitHub específico del agente, resolverlo desde OpenClaw antes de continuar; no adivinar ni mezclar perfiles. El ID del perfil no es el valor del token.

## 6. Preparar el runtime GitHub fuera de WindowsApps

El paquete MSIX observado impide que ciertos hijos carguen el addon nativo o ejecuten el helper desde WindowsApps. Se copia el launcher oficial y sus dependencias a un runtime separado, manteniendo sus verificaciones. No se desactiva la comprobación de seguridad.

```powershell
& $Node (Join-Path $RepoRoot 'tools\prepare-openclaw-github-runtime.mjs') $ClawRoot $GitHubRuntime
if ($LASTEXITCODE -ne 0) { throw 'Preparación del runtime rechazada' }
```

El destino debe ser nuevo y vacío. Para actualizar, preparar otro directorio y cambiar las rutas después; no sobrescribir DLLs cargadas. `runtime-manifest.json` registra versión y hashes comparados contra los archivos instalados oficiales. No contiene credenciales.

El perfil debe tener propietario confiable y acceso privado. Si la validación falla por permisos, comprobar primero que se está trabajando bajo la cuenta del Gateway. Para quitar permisos **heredados** sobrantes en ese perfil, con propietario coincidente:

```powershell
$Account = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
if ((Get-Acl -LiteralPath $GitHubProfile).Owner -ne $Account) { throw 'El propietario no es la cuenta actual; usar la cuenta del Gateway' }
icacls $GitHubProfile /inheritance:r /grant:r ('{0}:(OI)(CI)F' -f $Account) /grant:r '*S-1-5-18:(OI)(CI)F'
icacls (Join-Path $GitHubProfile 'hosts.yml') /inheritance:r /grant:r ('{0}:F' -f $Account) /grant:r '*S-1-5-18:F'
```

No abrir el perfil a Everyone/Users, no cambiar su propietario para sortear el control y no ejecutar el launcher directamente: **su stdout es el token**. El proveedor del motor lo captura en memoria y limpia sus buffers. Una entrada explícita de otro usuario puede necesitar revisión adicional: los comandos anteriores no borran ACLs explícitas ajenas y no garantizan por sí solos la aceptación. La prueba real del MCP es la que debe pasar.

## 7. Generar y aplicar configuración local, sin secretos

```powershell
$LocalSetupRoot = Join-Path $StateRoot 'replication'
$Prepared = Join-Path $LocalSetupRoot 'prepared'
$SetupFile = Join-Path $LocalSetupRoot 'setup.local.json'
New-Item -ItemType Directory -Path $LocalSetupRoot -Force | Out-Null
@{
    node = $Node; openclawRoot = $ClawRoot; configPath = $ConfigPath
    stateRoot = $StateRoot; workspace = $Workspace
    githubProfile = $GitHubProfile; githubRuntime = $GitHubRuntime
    githubOwner = $Owner; githubRepo = $RunnerRepo; model = $Model
    codeModeEnabled = $false; agentTimeoutSeconds = 1800
} | ConvertTo-Json | Set-Content -LiteralPath $SetupFile -Encoding utf8
& $Node (Join-Path $RepoRoot 'tools\openclaw-setup-files.mjs') $SetupFile $Prepared
```

El generador escribe `openclaw-fragment.json` y `job-create.json`. **No modifica el Gateway ni registra tareas**. Las rutas y el propietario son los tuyos; no se acepta un campo token. Verificar los fragmentos localmente y no publicarlos como configuración personal.

Con respaldo previo, integrar el servidor MCP sin reemplazar la configuración completa:

```powershell
$Fragment = Get-Content (Join-Path $Prepared 'openclaw-fragment.json') -Raw | ConvertFrom-Json
$Config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
if (!$Config.mcp) { $Config | Add-Member -NotePropertyName mcp -NotePropertyValue ([pscustomobject]@{}) }
if (!$Config.mcp.servers) { $Config.mcp | Add-Member -NotePropertyName servers -NotePropertyValue ([pscustomobject]@{}) }
$Config.mcp.servers | Add-Member -NotePropertyName investigador -NotePropertyValue $Fragment.mcp.servers.investigador -Force
if (!$Config.tools) { $Config | Add-Member -NotePropertyName tools -NotePropertyValue ([pscustomobject]@{}) }
if (!$Config.tools.codeMode) { $Config.tools | Add-Member -NotePropertyName codeMode -NotePropertyValue ([pscustomobject]@{}) }
$Config.tools.codeMode | Add-Member -NotePropertyName enabled -NotePropertyValue $Fragment.tools.codeMode.enabled -Force
$Config | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $ConfigPath -Encoding utf8
& $Node (Join-Path $ClawRoot 'openclaw.mjs') mcp reload
```

`tools.codeMode.enabled=false` es una configuración **global** observada en la referencia para evitar llamadas incompatibles con Gemini. Revisar su efecto si esa PC tiene otros agentes. No aplicar esa parte del fragmento si se decide conservar otro modo: omitir `codeModeEnabled` de la entrada y las líneas que modifican `$Config.tools`. El resto del generador no cambia defaults de modelo ni credenciales. El agente creado en el paso 4 ya conserva su workspace y modelo; no sustituir toda la lista de agentes con el fragmento.

El MCP y el job deben recibir las mismas variables de raíz/identidad GitHub y de tiempo. El job agrega `INVESTIGADOR_OPENCLAW_ENTRY`. No configurar `INVESTIGADOR_GITHUB_TOKEN`: esta réplica utiliza el perfil administrado.

## 8. Registrar un solo job, inicialmente detenido

El archivo generado es una definición nueva sin IDs de la PC original. No copiar el GUID anterior. `tools/openclaw-rpc.mjs` pasa JSON por archivo para evitar problemas de comillas de PowerShell; usa el Gateway/configuración de `$SetupFile`.

```powershell
$ListParams = Join-Path $Prepared 'list-params.json'
$ListResult = Join-Path $Prepared 'jobs-before.json'
'{"includeDisabled":true}' | Set-Content $ListParams -Encoding utf8
& $Node (Join-Path $RepoRoot 'tools\openclaw-rpc.mjs') $SetupFile cron.list $ListParams > $ListResult
if ($LASTEXITCODE -ne 0) { throw 'No se pudo listar el Gateway' }
$Jobs = (Get-Content $ListResult -Raw | ConvertFrom-Json).jobs
$ResearchJobs = @($Jobs | Where-Object { $_.agentId -eq 'investigador' -and $_.name -eq 'investigador-documental-local' })
if ($ResearchJobs.Count -gt 1) { throw 'Hay jobs duplicados: conciliarlos antes de continuar' }
$Declaration = Get-Content (Join-Path $Prepared 'job-create.json') -Raw | ConvertFrom-Json
if ($ResearchJobs.Count -eq 0) {
    $CreatedFile = Join-Path $Prepared 'job-created.json'
    & $Node (Join-Path $RepoRoot 'tools\openclaw-rpc.mjs') $SetupFile cron.add (Join-Path $Prepared 'job-create.json') > $CreatedFile
    if ($LASTEXITCODE -ne 0) { throw 'Creación no confirmada: listar antes de reintentar' }
    $Created = Get-Content $CreatedFile -Raw | ConvertFrom-Json
    $JobId = $Created.id
    if (!$JobId) { $JobId = $Created.job.id }
} else {
    $JobId = $ResearchJobs[0].id
    $PatchFile = Join-Path $Prepared 'job-update.json'
    @{ id=$JobId; patch=@{enabled=$false; payload=$Declaration.payload; schedule=$Declaration.schedule} } | ConvertTo-Json -Depth 12 | Set-Content $PatchFile -Encoding utf8
    & $Node (Join-Path $RepoRoot 'tools\openclaw-rpc.mjs') $SetupFile cron.update $PatchFile
}
if (!$JobId) { throw 'No se confirmó el ID del job; revisar la respuesta antes de reintentar' }
```

Si el CLI perdió una respuesta, volver a listar antes de crear otra tarea. La automatización permanece deshabilitada hasta pasar aceptación. No cambiar jobs de otros agentes.

## 9. Aceptación sin inventar resultados

Abrir una conversación nueva con el agente `investigador` y pedir operaciones reales de `research`:

```json
{"operation":"health"}
{"operation":"github_repositories","query":"","page":1}
{"operation":"research_start","project":"prueba-instalacion","request":"Prueba técnica de instalación: leer el README público del agente, crear un destino privado y guardar el avance; no investigar ciencia ni ejecutar experimentos.","workflow":"documentary","sources":["mxlzz/investigador-lab"]}
{"operation":"github_read","project":"prueba-instalacion","repository":"mxlzz/investigador-lab","file":"README.md"}
{"operation":"github_sync","project":"prueba-instalacion"}
{"operation":"github_sync","project":"prueba-instalacion"}
{"operation":"control","project":"prueba-instalacion","enabled":false,"reason":"Prueba técnica terminada"}
{"operation":"project_github_status","project":"prueba-instalacion"}
```

Comprobar: capacidades del motor presentes, fuente guardada con commit real, repositorio **privado** creado, primer sync confirmado, segundo `unchanged`, proyecto técnico pausado. Si falla un paso, no declarar éxito y mantener la prueba pausada. No se agrega una fase científica `ok` vacía para superar validaciones.

Lectura independiente desde la cuenta Windows del Gateway, sin escribir en GitHub:

```powershell
& $Node (Join-Path $RepoRoot 'tools\verify-project-repository.mjs') $SetupFile prueba-instalacion
```

Debe devolver `ok:true`, `remote_branch_matches:true` y `remote_snapshot_matches:true`. Compara identidad, privacidad, ref y el archivo descargado por commit con el snapshot local. Si hay cambios locales posteriores al sync, sincronizar de nuevo antes de verificar. En GitHub, abrir el enlace devuelto: el avance está en la rama `investigador-...`, no necesariamente en la portada de la rama principal.

Solo entonces habilitar la continuidad:

```powershell
$EnableFile = Join-Path $Prepared 'job-enable.json'
@{id=$JobId;patch=@{enabled=$true}} | ConvertTo-Json | Set-Content $EnableFile -Encoding utf8
& $Node (Join-Path $RepoRoot 'tools\openclaw-rpc.mjs') $SetupFile cron.update $EnableFile
```

La prueba técnica sigue pausada; un encargo real nuevo se inicia con `research_start` y puede comenzar intake en el mismo chat. Consultar `scheduler` y `state` para comprobar continuidad. Con PC apagada, el Gateway local no ejecuta ciclos.

## 10. Diagnóstico y recuperación

La política actual permite 30 minutos por turno programado; el worker espera 31, el job nativo 40 (39,5 sin salida) y la reserva del planificador 45. Se configuran juntos mediante `INVESTIGADOR_AGENT_TIMEOUT_SECONDS` (60–7200 segundos) y el generador. No ampliar solo el plazo interior. Ver [política de tiempos](TIEMPOS_DE_EJECUCION.md).

| Síntoma | Comprobación |
|---|---|
| 403 al crear repo | Confirmar que el token guardado tiene Repository creation con escritura y que se pulsó Update. Actions no sustituye ese permiso. |
| 403 al guardar commit | Contents debe tener escritura y el token debe abarcar el repositorio nuevo. |
| Repo privado no aparece | Revisar Repository access y propietario del token; la lista puede estar paginada. |
| Identidad insegura/no disponible | Revisar cuenta Windows del Gateway, raíz de estado, perfil, ACL y runtime portable. No imprimir el token ni desactivar el control. |
| Helper nativo falla dentro de WindowsApps | Revisar ruta del runtime portable en MCP **y** job. La shell general `gh` del MSIX no se declara reparada por esta guía. |
| Modelo intenta herramientas equivocadas | Conversación nueva, instrucciones AGENTS actualizadas, esquema MCP visible y Code Mode conforme al modelo/configuración elegidos. |
| Se narra éxito sin guardar | Solo los eventos aceptados por el motor y los commits verificados cuentan como progreso. |
| No continúa | Job único habilitado, Gateway/PC activos, proyecto habilitado, lease y cuota diaria. Tras tres fallos, revisar motivo antes de reanudar. |

Rollback: detener el job del investigador y esperar a que termine el paso activo; restaurar archivos de código/instrucciones y las secciones de configuración respaldadas; volver a la ruta anterior del runtime, recargar MCP y comprobar health. **Conservar `research-state/` y la historia nueva**: no borrar expedientes ni revertirlos ciegamente al respaldo. No borrar repositorios o commits creados para hacer parecer que no hubo efectos. Verificar el job existente antes de habilitarlo otra vez.

Tras una actualización MSIX, volver a localizar Node/OpenClaw y revisar la compatibilidad del preparador; no conservar una ruta obsoleta dentro de WindowsApps. Un runtime nuevo debe prepararse en otro directorio antes de cambiar las rutas del MCP/job.

## 11. Lo que este snapshot no entrega como completamente validado

- El flujo documental y los repositorios por investigación tienen aceptación real en Windows; [evidencia](PROJECT_REPOSITORIES_ACCEPTANCE.json).
- Los experimentos públicos tienen runner, workflow y validación en CI, pero la aceptación experimental completa desde Windows (dispatch → importación → evaluación) se documenta por separado y no se da por cumplida por crear un repo. Ver [runbook experimental](WINDOWS_DEPLOYMENT_RUNBOOK.md).
- Para replicar experimentos en otra cuenta, preparar infraestructura pública propia con `.github/workflows/investigador-experiment.yml` en la rama predeterminada y los scripts/manifiestos del commit autorizado. No subir fuentes privadas al runner.
- Telegram, auditor independiente y ejecución con PC apagada no se activan aquí.
- No se incluyen tokens, perfiles, sesiones, configuración personal, expedientes privados ni binarios MSIX. Cada instalación conecta sus propias cuentas.

Guías complementarias: [repositorios por investigación](PROJECT_REPOSITORIES.md), [implementación del motor](../implementation/README.md), [registro de cambios](IMPLEMENTATION_LOG.md). Los documentos históricos describen estados anteriores; para reconstruir la referencia de este snapshot prevalecen esta guía y su manifest de entorno.

## Apéndice: GitHub CLI de la referencia (opcional)

La integración del motor usa REST y no necesita ejecutar `gh`. Para reproducir también la herramienta CLI observada, se puede usar el ZIP oficial 2.104.0 y comprobar su checksum antes de ejecutarla:

```powershell
$GhVersion = '2.104.0'
$GhRelease = "https://github.com/cli/cli/releases/download/v$GhVersion"
$GhStage = Join-Path $LocalSetupRoot 'gh-download'
New-Item -ItemType Directory -Path $GhStage -Force | Out-Null
$GhZip = Join-Path $GhStage "gh_${GhVersion}_windows_amd64.zip"
$GhChecksums = Join-Path $GhStage 'checksums.txt'
Invoke-WebRequest "$GhRelease/gh_${GhVersion}_windows_amd64.zip" -OutFile $GhZip
Invoke-WebRequest "$GhRelease/gh_${GhVersion}_checksums.txt" -OutFile $GhChecksums
$GhLine = @(Get-Content $GhChecksums | Where-Object { $_ -match ('\s+gh_' + [regex]::Escape($GhVersion) + '_windows_amd64.zip$') })
if ($GhLine.Count -ne 1) { throw 'Checksum oficial no encontrado de forma inequívoca' }
$GhExpected = ($GhLine[0] -split '\s+')[0]
if ((Get-FileHash $GhZip -Algorithm SHA256).Hash -ne $GhExpected) { throw 'Checksum incorrecto' }
$GhDestination = Join-Path $ToolsRoot "gh-$GhVersion"
Expand-Archive -LiteralPath $GhZip -DestinationPath $GhDestination
& (Join-Path $GhDestination 'bin\gh.exe') --version
```

La carpeta `bin` puede agregarse al PATH del Gateway si se necesita `gh` en otras funciones. Eso no reemplaza la conexión System GitHub ni corrige por sí solo el fallo del launcher genérico MSIX. El token del motor sigue administrado por OpenClaw.
