# Start Production Environment
Write-Host "Starting production environment..." -ForegroundColor Cyan
Write-Host "This will start MongoDB, Server, and Frontend in production mode" -ForegroundColor Yellow
Write-Host ""

docker-compose -f infra/docker-compose.prod.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nProduction environment started!" -ForegroundColor Green
    Write-Host "`nServices:" -ForegroundColor Yellow
    Write-Host "  Frontend: http://localhost" -ForegroundColor White
    Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
    Write-Host "  MongoDB:  localhost:27017" -ForegroundColor White
    Write-Host "`nTo view logs: docker-compose -f infra/docker-compose.prod.yml logs -f" -ForegroundColor Cyan
    Write-Host "To stop: .\infra\stop.ps1" -ForegroundColor Cyan
} else {
    Write-Host "`nFailed to start production environment!" -ForegroundColor Red
    exit 1
}
