# Build Production Images
Write-Host "Building production images..." -ForegroundColor Cyan
docker-compose -f infra/docker-compose.prod.yml build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nProduction images built successfully!" -ForegroundColor Green
    Write-Host "`nTo start the production environment, run:" -ForegroundColor Yellow
    Write-Host "  .\infra\start-prod.ps1" -ForegroundColor White
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    exit 1
}
