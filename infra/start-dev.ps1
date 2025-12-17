# Start Development Environment
Write-Host "Starting development environment..." -ForegroundColor Cyan
Write-Host "This will start MongoDB, Server, and Frontend with hot-reload" -ForegroundColor Yellow
Write-Host ""

docker-compose -f infra/docker-compose.dev.yml up

# Note: Press Ctrl+C to stop all services
