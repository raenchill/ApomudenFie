$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

$hostAddress = if ($env:HOST) { $env:HOST } else { "0.0.0.0" }
$port = if ($env:PORT) { $env:PORT } else { "8000" }

Write-Host "Starting AidFidelis API on http://${hostAddress}:${port}"
python -m uvicorn main:app --host $hostAddress --port $port