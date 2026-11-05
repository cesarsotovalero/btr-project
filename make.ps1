<#
.SYNOPSIS
  BTR — Beat The Risk — Windows development helper (PowerShell equivalent of Makefile)

.DESCRIPTION
  Run: .\make.ps1 <target>
  Targets: help, dev, dev-api, dev-ui, db-up, db-wait, db-migrate, db-seed,
           db-reset, test, lint, format, docker-up, docker-down, docker-logs, clean

.EXAMPLE
  .\make.ps1 dev          # Start DB + API + UI locally
  .\make.ps1 test         # Run all tests
  .\make.ps1 docker-up    # Full stack via Docker Compose
#>

param(
    [Parameter(Position = 0)]
    [string]$Target = "help"
)

# ─── Environment ──────────────────────────────────────────────
# Load .env.local if it exists
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $Matches[1].Trim()
            $val = $Matches[2].Trim()
            if (-not [System.Environment]::GetEnvironmentVariable($key)) {
                [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
}

# Defaults
if (-not $env:POSTGRES_PASSWORD) { Write-Warning "POSTGRES_PASSWORD is not set — load .env.local or set it manually"; $env:POSTGRES_PASSWORD = "" }
if (-not $env:DATABASE_URL) { Write-Warning "DATABASE_URL is not set — load .env.local"; $env:DATABASE_URL = "" }
if (-not $env:LLM_BACKEND) { $env:LLM_BACKEND = "gemini" }
if (-not $env:VERTEX_AI_LOCATION) { $env:VERTEX_AI_LOCATION = "europe-west1" }
if (-not $env:GOOGLE_APPLICATION_CREDENTIALS) {
    $env:GOOGLE_APPLICATION_CREDENTIALS = Join-Path $env:USERPROFILE ".config\gcloud\application_default_credentials.json"
}
if (-not $env:UPLOAD_DIR) { $env:UPLOAD_DIR = "./uploads" }
if (-not $env:API_URL) { $env:API_URL = "http://localhost:8000" }

# ─── Helper Functions ─────────────────────────────────────────

function Show-Help {
    Write-Host ""
    Write-Host "  BTR - Beat The Risk (Windows)"
    Write-Host "  ----------------------------------------"
    Write-Host ""
    Write-Host "  Usage: .\make.ps1 <target>"
    Write-Host ""
    Write-Host "  Local development (requires Docker for Postgres):"
    Write-Host "    dev            Start DB + API + UI locally"
    Write-Host "    dev-api        Start only the API server"
    Write-Host "    dev-ui         Start only the UI server"
    Write-Host ""
    Write-Host "  Database:"
    Write-Host "    db-up          Start Postgres container only"
    Write-Host "    db-wait        Wait for Postgres to be ready"
    Write-Host "    db-migrate     Run Alembic migrations (local)"
    Write-Host "    db-seed        Seed sample data (local)"
    Write-Host "    db-reset       Drop + re-migrate + re-seed"
    Write-Host ""
    Write-Host "  Testing & quality:"
    Write-Host "    test           Run all tests (SQLite, no Docker needed)"
    Write-Host "    lint           Lint and format check"
    Write-Host "    format         Auto-format code"
    Write-Host ""
    Write-Host "  Docker (production-like):"
    Write-Host "    docker-up      Full stack via Docker Compose"
    Write-Host "    docker-down    Stop and remove containers + volumes"
    Write-Host "    docker-logs    Tail logs for all services"
    Write-Host ""
    Write-Host "  Cleanup:"
    Write-Host "    clean          Kill dev processes, remove local DB files"
    Write-Host ""
}

function Invoke-DbUp {
    docker compose up -d db
    Write-Host "[*] Postgres container starting..."
}

function Invoke-DbWait {
    Write-Host "[*] Waiting for Postgres to accept connections..."
    do {
        Start-Sleep -Seconds 1
        $ready = docker compose exec -T db pg_isready -U btr -d btr 2>$null
    } while ($LASTEXITCODE -ne 0)
    Write-Host "[OK] Postgres is ready"
}

function Invoke-DbMigrate {
    Push-Location project-api
    try {
        $env:PYTHONPATH = "src"
        uv run alembic upgrade head
        Write-Host "[OK] Migrations applied"
    }
    finally { Pop-Location }
}

function Invoke-DbSeed {
    Push-Location project-api
    try {
        $env:PYTHONPATH = "src"
        uv run python -m app.seed.seed_data
        Write-Host "[OK] Seed data loaded"
    }
    finally { Pop-Location }
}

function Invoke-DbReset {
    Push-Location project-api
    try {
        $env:PYTHONPATH = "src"
        uv run alembic downgrade base
    }
    finally { Pop-Location }
    Invoke-DbMigrate
    Invoke-DbSeed
    Write-Host "[OK] Database reset complete"
}

function Invoke-DevApi {
    # Stop the Docker worker if running to prevent duplicate workflow execution
    docker stop btr-project-worker-1 2>$null | Out-Null
    Push-Location project-api
    try {
        $env:PYTHONPATH = "src"
        uv run uvicorn app.main:app --reload --port 8000
    }
    finally { Pop-Location }
}

function Invoke-DevUi {
    Push-Location project-ui
    try {
        npm install --silent
        $env:API_URL = $env:API_URL
        npm start
    }
    finally { Pop-Location }
}

function Invoke-Dev {
    Invoke-DbUp
    Invoke-DbWait
    Invoke-DbMigrate
    Invoke-DbSeed
    Write-Host ""
    Write-Host "[OK] Database ready. Starting API + UI..."
    Write-Host ""

    # Start API and UI as background jobs
    $apiJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        & "$using:PWD\make.ps1" dev-api
    }
    $uiJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        & "$using:PWD\make.ps1" dev-ui
    }

    Write-Host "  API job: $($apiJob.Id)   UI job: $($uiJob.Id)"
    Write-Host "  Press Ctrl+C to stop both."
    Write-Host ""

    try {
        # Stream output from both jobs
        while ($true) {
            Receive-Job $apiJob -ErrorAction SilentlyContinue
            Receive-Job $uiJob  -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 500
        }
    }
    finally {
        Stop-Job $apiJob, $uiJob -ErrorAction SilentlyContinue
        Remove-Job $apiJob, $uiJob -Force -ErrorAction SilentlyContinue
        Write-Host "`n[OK] Stopped API and UI."
    }
}

function Invoke-Test {
    Push-Location project-api
    try {
        uv run pytest src/tests/ -v
    }
    finally { Pop-Location }
}

function Invoke-Lint {
    Push-Location project-api
    try {
        uv run ruff check src/
        uv run ruff format --check src/
    }
    finally { Pop-Location }
}

function Invoke-Format {
    Push-Location project-api
    try {
        uv run ruff check --fix src/
        uv run ruff format src/
    }
    finally { Pop-Location }
}

function Invoke-DockerUp {
    docker compose up --build -d
    Write-Host "[OK] Stack is up -> http://localhost:3000"
}

function Invoke-DockerDown {
    docker compose down -v
}

function Invoke-DockerLogs {
    docker compose logs -f
}

function Invoke-Clean {
    Write-Host "[*] Cleaning up..."
    # Kill processes on ports 8000 and 3000
    Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    # Remove local dev DB if it exists
    Remove-Item -Path "project-api\btr_dev.db" -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Clean"
}

# ─── Dispatch ─────────────────────────────────────────────────
switch ($Target) {
    "help" { Show-Help }
    "dev" { Invoke-Dev }
    "dev-api" { Invoke-DevApi }
    "dev-ui" { Invoke-DevUi }
    "db-up" { Invoke-DbUp }
    "db-wait" { Invoke-DbWait }
    "db-migrate" { Invoke-DbMigrate }
    "db-seed" { Invoke-DbSeed }
    "db-reset" { Invoke-DbReset }
    "test" { Invoke-Test }
    "lint" { Invoke-Lint }
    "format" { Invoke-Format }
    "docker-up" { Invoke-DockerUp }
    "docker-down" { Invoke-DockerDown }
    "docker-logs" { Invoke-DockerLogs }
    "clean" { Invoke-Clean }
    default { Write-Host "Unknown target: $Target"; Show-Help }
}
