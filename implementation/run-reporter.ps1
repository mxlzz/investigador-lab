$ErrorActionPreference='Stop'
$privateDir=Join-Path $env:LOCALAPPDATA 'Investigador'
$settings=Get-Content -LiteralPath (Join-Path $privateDir 'settings.json') -Raw | ConvertFrom-Json
$secure=Get-Content -LiteralPath (Join-Path $privateDir 'telegram.dpapi') -Raw | ConvertTo-SecureString
$ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try{
 $env:INVESTIGADOR_TELEGRAM_TOKEN=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
 $env:INVESTIGADOR_TELEGRAM_CHAT_ID=$settings.chat_id
 $env:INVESTIGADOR_ROOT=$settings.workspace
 & $settings.node (Join-Path $settings.workspace 'implementation\reporter.mjs') 2>&1 | Out-File -LiteralPath (Join-Path $privateDir 'reporter-last.log') -Encoding utf8
 if($LASTEXITCODE -ne 0){throw 'El reporter terminó con error; ver reporter-last.log'}
}finally{
 [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
 Remove-Item Env:\INVESTIGADOR_TELEGRAM_TOKEN -ErrorAction SilentlyContinue
 Remove-Item Env:\INVESTIGADOR_TELEGRAM_CHAT_ID -ErrorAction SilentlyContinue
 Remove-Item Env:\INVESTIGADOR_ROOT -ErrorAction SilentlyContinue
}
