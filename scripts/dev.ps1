. (Join-Path $PSScriptRoot 'env.ps1')
npm.cmd run dev -- --hostname 127.0.0.1
exit $LASTEXITCODE
