@echo off
cd /d "%~dp0"
set "PORT=8080"
start "" cmd /c "ping 127.0.0.1 -n 2 >nul & start http://127.0.0.1:%PORT%/"
if exist ".tools\node\node.exe" (
  ".tools\node\node.exe" server.mjs
) else (
  node server.mjs
)
