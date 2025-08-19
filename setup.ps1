# Requires PowerShell 5+
# One-click setup for SheCanCode Leave Management System (Windows)
# - Ensures .env files exist
# - Builds & starts all services with Docker Compose
# - Opens Frontend and Swagger UIs

param(
  [switch]$Recreate = $false,      # Recreate containers
  [switch]$NoDetach = $false,      # Run in foreground
  [switch]$NoOpen = $false         # Do not open browser tabs automatically
)

$ErrorActionPreference = "Stop"

function Write-Info($msg){ Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg){ Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Move to repository root (where this script resides)
Set-Location -Path $PSScriptRoot

# Ensure Docker is available
try {
  $dockerVer = (docker --version) 2>$null
  if (-not $dockerVer){ throw "Docker CLI not found" }
  Write-Info "Docker detected: $dockerVer"
} catch {
  Write-Err "Docker is not installed or not on PATH. Please install Docker Desktop and retry."
  exit 1
}

# Try to ping daemon
try {
  docker info | Out-Null
} catch {
  Write-Warn "Docker daemon not responding. Attempting to proceed; if it fails, start Docker Desktop and re-run."
}

function Ensure-EnvFile($path, $samplePath){
  if (Test-Path $path){
    Write-Info "Found $path"
  } elseif (Test-Path $samplePath) {
    Copy-Item $samplePath $path
    Write-Info "Created $path from $samplePath"
  } else {
    Write-Warn "Missing $path and no sample at $samplePath. Skipping."
  }
}

# Ensure env files exist
Ensure-EnvFile ".env" ".env.sample"
Ensure-EnvFile "auth-service\ .env" "auth-service\ .env.sample"  # Spaces handled below
Ensure-EnvFile "leave-service\ .env" "leave-service\ .env.sample"
Ensure-EnvFile "frontend\ .env" "frontend\ .env.sample"

# Correct potential space issue in paths above (PowerShell concatenation safety)
Ensure-EnvFile (Join-Path "auth-service" ".env") (Join-Path "auth-service" ".env.sample")
Ensure-EnvFile (Join-Path "leave-service" ".env") (Join-Path "leave-service" ".env.sample")
Ensure-EnvFile (Join-Path "frontend" ".env") (Join-Path "frontend" ".env.sample")

# Compose arguments
$composeArgs = @("up", "--build")
if (-not $NoDetach) { $composeArgs += "-d" }
if ($Recreate) { $composeArgs += "--force-recreate" }

Write-Info "Running: docker compose $($composeArgs -join ' ')"
try {
  docker compose @composeArgs
} catch {
  Write-Err "docker compose failed. Review Docker Desktop status and logs, then retry."
  throw
}

Write-Info "Containers status:"
try { docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" } catch { }

if (-not $NoOpen) {
  Write-Info "Opening application pages in your default browser..."
  Start-Process "http://localhost:5173" | Out-Null
  Start-Process "http://localhost:8081/swagger-ui.html" | Out-Null
  Start-Process "http://localhost:8082/swagger-ui.html" | Out-Null
}

Write-Host "\nAll set!" -ForegroundColor Green
Write-Host "- Frontend:  http://localhost:5173"
Write-Host "- Auth API:  http://localhost:8081/swagger-ui.html"
Write-Host "- Leave API: http://localhost:8082/swagger-ui.html"

Write-Info "Tips:"
Write-Host "  • To see logs: docker logs -f lms-auth | docker logs -f lms-leave | docker logs -f lms-frontend"
Write-Host "  • To stop everything: docker compose down"
Write-Host "  • Recreate containers: .\setup.ps1 -Recreate"
