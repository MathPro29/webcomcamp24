# Stop All Docker Containers
Write-Host "Stopping all containers..." -ForegroundColor Cyan

# Try to stop dev environment
docker-compose -f infra/docker-compose.dev.yml down 2>$null

# Try to stop prod environment
docker-compose -f infra/docker-compose.prod.yml down 2>$null

Write-Host "All containers stopped!" -ForegroundColor Green
