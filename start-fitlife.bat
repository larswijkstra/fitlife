@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File ".\scripts\start-fitlife.ps1"
pause
