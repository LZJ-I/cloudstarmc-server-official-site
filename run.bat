@echo off
cd /d "%~dp0"
if exist ".tools\node\node.exe" (
  ".tools\node\node.exe" server.mjs
) else (
  node server.mjs
)
