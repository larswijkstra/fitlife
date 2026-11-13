$ErrorActionPreference = 'Stop'

Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "FitLife wordt gestart..." -ForegroundColor Cyan

if (-not (Test-Path ".\node_modules")) {
    Write-Host "Dependencies installeren..." -ForegroundColor Yellow
    npm install
}

Write-Host "Expo starten..." -ForegroundColor Green
npm start

