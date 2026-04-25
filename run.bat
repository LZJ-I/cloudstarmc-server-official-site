@echo off
cd /d "%~dp0"
if exist ".tools\node\node.exe" (
  ".tools\node\node.exe" server\server.mjs
) else (
  node server\server.mjs
)
