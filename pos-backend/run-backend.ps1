[CmdletBinding()]
param(
    [string]$Profile = "dev",
    [switch]$SkipBuild,
    [int]$Port = 8082
)

$ErrorActionPreference = 'Stop'
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$MvnwPath = Join-Path $ScriptDir "mvnw.cmd"
$ContextPath = "/api/v1"

function Write-Step { param([string]$Message, [string]$Color = "Cyan") Write-Host $Message -ForegroundColor $Color }

$JavaCandidates = @($env:JAVA_HOME, "C:\Program Files\Java\jdk-17", "C:\Program Files\Eclipse Adoptium\jdk-17*")
$ResolvedJavaHome = $null
foreach ($candidate in $JavaCandidates) {
    if (-not $candidate) { continue }
    $path = if ($candidate -match '\*') { (Get-Item $candidate -ErrorAction SilentlyContinue | Select-Object -First 1).FullName } else { $candidate }
    if ($path -and (Test-Path (Join-Path $path "bin\java.exe"))) { $ResolvedJavaHome = $path; break }
}
if (-not $ResolvedJavaHome) { Write-Step "JAVA_HOME not found. Install JDK 17 or set JAVA_HOME." "Red"; exit 1 }
$env:JAVA_HOME = $ResolvedJavaHome
$env:Path = "$($env:JAVA_HOME)\bin;$env:Path"

Set-Location $ScriptDir
if (-not $SkipBuild) {
    Write-Step "Maven compile..." "Cyan"
    & $MvnwPath compile -DskipTests
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$env:SPRING_PROFILES_ACTIVE = $Profile
$BaseUrl = "http://localhost:$Port$ContextPath"
Write-Step "Starting POS backend on $BaseUrl (profile: $Profile)" "Green"
Write-Step "Default login: admin / admin123" "Gray"
Write-Step "Stop with Ctrl+C" "Gray"

& $MvnwPath spring-boot:run "-Dspring-boot.run.profiles=$Profile" "-Dspring-boot.run.arguments=--server.port=$Port"
exit $LASTEXITCODE
