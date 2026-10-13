@echo off
REM ==============================================================================
REM CRM CARE - 1-CLICK LAUNCHER
REM Su dung: start.bat hoac .\start.bat
REM ==============================================================================
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File ".\start.ps1"
pause
