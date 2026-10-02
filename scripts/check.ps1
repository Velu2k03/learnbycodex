. (Join-Path $PSScriptRoot 'env.ps1')
npm.cmd test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm.cmd run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm.cmd run build
exit $LASTEXITCODE
