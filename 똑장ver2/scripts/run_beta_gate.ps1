param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$results = New-Object System.Collections.Generic.List[object]

function Invoke-GateStep {
    param(
        [string]$Name,
        [string]$Command,
        [string]$Workdir
    )

    Write-Host ""
    Write-Host "[$Name]"
    Write-Host "  > $Command"

    Push-Location $Workdir
    try {
        Invoke-Expression $Command
        $results.Add([pscustomobject]@{ Step = $Name; Status = "PASS"; Detail = "" })
    }
    catch {
        $results.Add([pscustomobject]@{ Step = $Name; Status = "FAIL"; Detail = $_.Exception.Message })
        throw
    }
    finally {
        Pop-Location
    }
}

$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$backendPython = Join-Path $backendDir ".venv\Scripts\python.exe"
if (-not (Test-Path $backendPython)) {
    $backendPython = "python"
}

try {
    if (-not $SkipBackend) {
        Invoke-GateStep -Name "Backend pytest" -Command "$backendPython -m pytest -q" -Workdir $backendDir
    }

    if (-not $SkipFrontend) {
        Invoke-GateStep -Name "Frontend type-check" -Command "npx tsc --noEmit" -Workdir $frontendDir
        Invoke-GateStep -Name "Frontend build" -Command "npm run build" -Workdir $frontendDir
    }
}
finally {
    Write-Host ""
    Write-Host "===== Beta Gate Summary ====="
    $results | Format-Table -AutoSize
}

