Set-Location $PSScriptRoot
$env:PORT = "8080"
Start-Process powershell -WindowStyle Hidden -ArgumentList @(
  "-NoProfile", "-Command", "Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:8080/'"
)
$node = Join-Path $PSScriptRoot '.tools\node\node.exe'
if (Test-Path $node) { & $node server.mjs } else { node server.mjs }
