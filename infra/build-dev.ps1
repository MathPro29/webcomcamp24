# Build Development Images
Write-Host "Building development images..." -ForegroundColor Cyan
docker-compose -f infra/docker-compose.dev.yml build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDevelopment images built successfully!" -ForegroundColor Green
    Write-Host "`nTo start the development environment, run:" -ForegroundColor Yellow
    Write-Host "  .\infra\start-dev.ps1" -ForegroundColor White
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    exit 1
}
