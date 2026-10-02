$ErrorActionPreference = 'Stop'
$labRoot = Split-Path -Parent $PSScriptRoot
if (-not $labRoot.StartsWith('F:\', [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'This project is configured to keep runtime, caches, and temporary files on F:.'
}
$labNode = Join-Path $labRoot '.local\node-v24.21.0-win-x64'
if (-not (Test-Path -LiteralPath (Join-Path $labNode 'node.exe'))) {
    throw 'Portable Node is missing. Install an official Node 24 LTS Windows x64 runtime under .local on F: and update scripts/env.ps1 to its folder.'
}
$env:Path = $labNode + ';' + $env:Path
$env:TEMP = Join-Path $labRoot '.local\temp'
$env:TMP = $env:TEMP
$env:npm_config_cache = Join-Path $labRoot '.local\npm-cache'
$env:NEXT_TELEMETRY_DISABLED = '1'
$env:VERCEL_TELEMETRY_DISABLED = '1'
$env:XDG_CACHE_HOME = Join-Path $labRoot '.local\cache'
New-Item -ItemType Directory -Path $env:TEMP,$env:npm_config_cache -Force | Out-Null
Set-Location -LiteralPath $labRoot
