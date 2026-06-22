[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [int]$Port = 4200
)

$ErrorActionPreference = 'Stop'
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }

function Write-Step { param([string]$Message, [string]$Color = "Cyan") Write-Host $Message -ForegroundColor $Color }

Set-Location $ScriptDir

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Step "Node.js is not installed or not in PATH." "Red"
    exit 1
}

$env:NG_CLI_ANALYTICS = "false"
$env:CI = "true"

if (-not $SkipInstall -and -not (Test-Path "node_modules")) {
    Write-Step "Installing dependencies..." "Cyan"
    & npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Step "Starting POS frontend on http://localhost:$Port" "Green"
Write-Step "Backend expected at http://localhost:8082/api/v1" "Gray"
Write-Step "Stop with Ctrl+C" "Gray"

& npx ng serve --port=$Port
exit $LASTEXITCODE
