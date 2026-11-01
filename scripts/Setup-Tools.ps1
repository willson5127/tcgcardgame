$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$workspaceRoot = Split-Path $workspaceRoot -Parent
$toolsRoot = Join-Path $workspaceRoot 'Tools\tcgcardgame'
$null = New-Item -ItemType Directory -Path $toolsRoot -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'tooling\package.json') -Destination (Join-Path $toolsRoot 'package.json')
& npm.cmd install --prefix $toolsRoot --cache (Join-Path $toolsRoot 'npm-cache') --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Test tool installation failed.' }
Write-Output 'Tools installed in workspace Tools/tcgcardgame. Browser tests use installed Chrome and Edge.'
