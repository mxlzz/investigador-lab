param([string]$Workspace='C:\Users\W7-C9\.openclaw\workspace-investigador')
$ErrorActionPreference='Stop'
# Run interactively as the Windows user who owns the scheduled task.
$node=(Get-Command node -ErrorAction SilentlyContinue).Source
if(-not $node){$node='C:\Users\W7-C9\AppData\Local\OpenClawGatewayMSIX\agent-node\node-v24.22.1-win-x64\node.exe'}
if(-not (Test-Path -LiteralPath $node)){throw 'No se encontró Node.js. No se instaló nada.'}
if(-not (Test-Path -LiteralPath (Join-Path $Workspace 'implementation\reporter.mjs'))){throw 'Falta instalar el motor.'}
$privateDir=Join-Path $env:LOCALAPPDATA 'Investigador'
New-Item -ItemType Directory -Path $privateDir -Force | Out-Null
$tokenSecure=Read-Host 'Token del bot de Telegram (oculto)' -AsSecureString
$ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($tokenSecure)
try{$token=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)}finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)}
if($token -notmatch '^\d+:[A-Za-z0-9_-]+$'){throw 'Formato de token inválido'}
try{$me=Invoke-RestMethod -Uri ('https://api.telegram.org/bot'+$token+'/getMe')}catch{throw 'No se pudo verificar el bot. El token no fue guardado.'}
if(-not $me.ok){throw 'Bot no verificado'}
Write-Host ('Bot verificado: @'+$me.result.username)
Write-Host 'Abrí el chat privado con ese bot en Telegram y enviá /start.'
Read-Host 'Presioná Enter cuando lo hayas hecho' | Out-Null
try{$updates=Invoke-RestMethod -Uri ('https://api.telegram.org/bot'+$token+'/getUpdates')}catch{throw 'No se pudo consultar el chat; comprobá si el bot ya usa webhook. No se modificó su webhook.'}
$chats=@($updates.result | ForEach-Object { $_.message.chat } | Where-Object { $_.type -eq 'private' } | Sort-Object id -Unique)
if($chats.Count -ne 1){$chatId=Read-Host 'Escribí el ID numérico de tu chat privado de Telegram'}else{$chatId=[string]$chats[0].id}
if($chatId -notmatch '^\d+$'){throw 'Se necesita el ID numérico del chat privado'}
$confirmation=Read-Host ('Enviar un mensaje de prueba al chat '+$chatId+' y programar informes a las 20:00 Buenos Aires? Escribí SI')
if($confirmation -ne 'SI'){throw 'Cancelado sin guardar credenciales ni programar tareas'}
try{$sent=Invoke-RestMethod -Uri ('https://api.telegram.org/bot'+$token+'/sendMessage') -Method Post -ContentType 'application/json' -Body (@{chat_id=$chatId;text='Investigador conectado. Este es un mensaje de prueba; todavía no hay resultados científicos.'} | ConvertTo-Json)}catch{throw 'Falló el mensaje de prueba; configuración no completada'}
if(-not $sent.ok){throw 'Telegram no confirmó el mensaje'}
$tokenSecure | ConvertFrom-SecureString | Set-Content -LiteralPath (Join-Path $privateDir 'telegram.dpapi')
@{chat_id=$chatId;workspace=$Workspace;node=$node} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $privateDir 'settings.json')
$runner=Join-Path $Workspace 'implementation\run-reporter.ps1'
$action=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -NonInteractive -File "'+$runner+'"')
$trigger=New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 365)
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'Investigador-Informes' -Action $action -Trigger $trigger -Settings $settings -Description 'Revisa informes pendientes; genera el consolidado desde las 20:00 de Buenos Aires. No ejecuta experimentos.' -Force | Out-Null
$token=$null
Write-Host 'Telegram conectado y tarea programada durante un año. La PC debe estar encendida; se ejecuta con tu sesión. El token está cifrado con DPAPI para tu usuario.'
