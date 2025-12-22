# Docker Build Script - Frontend & Backend
# สำหรับ build Docker images ทั้ง frontend และ backend

Write-Host "🐳 Docker Build Script" -ForegroundColor Cyan
Write-Host "Building Frontend and Backend Images`n" -ForegroundColor Yellow

# ==========================================
# BACKEND BUILD
# ==========================================
Write-Host "📦 Building Backend Image..." -ForegroundColor Green
Write-Host "Image: 371methat/backend-comcamp:1.0.0`n" -ForegroundColor Gray

# Navigate to server directory
Set-Location -Path "e:\UniversityWork\webcomcamp24\server"

# Build backend image
docker build -f infra/Dockerfile.prod -t 371methat/backend-comcamp:1.0.0 .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend image built successfully!`n" -ForegroundColor Green
}
else {
    Write-Host "❌ Backend build failed!`n" -ForegroundColor Red
    exit 1
}

# ==========================================
# FRONTEND BUILD
# ==========================================
Write-Host "📦 Building Frontend Image..." -ForegroundColor Green
Write-Host "Image: 371methat/frontend-comcamp:1.0.0`n" -ForegroundColor Gray

# Navigate to project root
Set-Location -Path "e:\UniversityWork\webcomcamp24"

# Build frontend image
docker build -f src/infra/Dockerfile.prod -t 371methat/frontend-comcamp:1.0.0 .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend image built successfully!`n" -ForegroundColor Green
}
else {
    Write-Host "❌ Frontend build failed!`n" -ForegroundColor Red
    exit 1
}

# ==========================================
# SUMMARY
# ==========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎉 Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nBuilt Images:" -ForegroundColor Yellow
docker images | Select-String "371methat"

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test images locally:" -ForegroundColor White
Write-Host "   cd e:\UniversityWork\webcomcamp24\server" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-compose-server.yml up -d`n" -ForegroundColor Gray

Write-Host "2. Push to Docker Hub (optional):" -ForegroundColor White
Write-Host "   docker push 371methat/backend-comcamp:1.0.0" -ForegroundColor Gray
Write-Host "   docker push 371methat/frontend-comcamp:1.0.0`n" -ForegroundColor Gray

Write-Host "3. Deploy with docker-compose:" -ForegroundColor White
Write-Host "   cd e:\UniversityWork\webcomcamp24\infra" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-compose-frontend.yml up -d`n" -ForegroundColor Gray
