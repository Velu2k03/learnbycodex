param(
    [ValidateSet('login','whoami','deploy','inspect')]
    [string]$Action = 'whoami',
    [string]$DeploymentUrl = ''
)
. (Join-Path $PSScriptRoot 'env.ps1')
$labVercel = Join-Path $labRoot '.local\vercel-tool\node_modules\.bin\vercel.cmd'
$labVercelConfig = Join-Path $labRoot '.local\vercel-config'
New-Item -ItemType Directory -Path $labVercelConfig -Force | Out-Null
if (-not (Test-Path -LiteralPath $labVercel)) {
    throw 'Vercel CLI is missing. In this environment run npm install --prefix .local\vercel-tool vercel after sourcing scripts/env.ps1.'
}
switch ($Action) {
    'login' { & $labVercel login --global-config $labVercelConfig }
    'whoami' { & $labVercel whoami --global-config $labVercelConfig }
    'deploy' { & $labVercel deploy --global-config $labVercelConfig }
    'inspect' {
        if (-not $DeploymentUrl.StartsWith('https://')) { throw 'Provide the exact HTTPS deployment URL returned by Vercel.' }
        & $labVercel inspect $DeploymentUrl --global-config $labVercelConfig --wait
    }
}
exit $LASTEXITCODE
