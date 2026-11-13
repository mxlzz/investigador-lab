param([Parameter(Mandatory=$true)][string]$Workspace,[Parameter(Mandatory=$true)][string]$Node,[Parameter(Mandatory=$true)][string]$OpenClawEntry,[string]$Every='15m')
$ErrorActionPreference='Stop'
foreach($file in @($Node,$OpenClawEntry,(Join-Path $Workspace 'implementation\scheduler-tick.mjs'))){if(-not (Test-Path -LiteralPath $file)){throw 'Falta un componente requerido del planificador'}}
$raw=& $Node $OpenClawEntry automations list --json
if($LASTEXITCODE -ne 0){throw 'No se pudo consultar el Gateway'}
$jobs=$raw | ConvertFrom-Json
$existing=@($jobs.jobs | Where-Object declarationKey -eq 'investigador:documentary-local:v1')
if($existing.Count){Write-Host ('Planificador existente: '+$existing[0].id);return}
$argv=@($Node,(Join-Path $Workspace 'implementation\scheduler-tick.mjs')) | ConvertTo-Json -Compress
& $Node $OpenClawEntry automations add --name 'investigador-documental-local' --declaration-key 'investigador:documentary-local:v1' --agent investigador --every $Every --command-argv $argv --command-cwd $Workspace --command-env ('INVESTIGADOR_ROOT='+$Workspace) --command-env ('INVESTIGADOR_OPENCLAW_ENTRY='+$OpenClawEntry) --timeout-seconds 240 --no-output-timeout-seconds 230 --output-max-bytes 65536 --no-deliver --json
if($LASTEXITCODE -ne 0){throw 'Falló el alta del planificador'}
