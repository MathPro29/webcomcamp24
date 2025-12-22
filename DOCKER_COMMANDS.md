# Docker Build Commands - Quick Reference

## Build Backend

```powershell
cd e:\UniversityWork\webcomcamp24\server
docker build -f infra/Dockerfile.prod -t 371methat/backend-comcamp:1.0.1 .
```

## Build Frontend

```powershell
cd e:\UniversityWork\webcomcamp24
docker build -f src/infra/Dockerfile.prod -t 371methat/frontend-comcamp:1.0.4 .
```

## Build Both (Automated Script)

```powershell
cd e:\UniversityWork\webcomcamp24
.\build-docker.ps1
```

## Verify Images

```powershell
docker images | Select-String "371methat"
```

## Run Locally

```powershell
# Backend
cd e:\UniversityWork\webcomcamp24\server
docker-compose -f docker-compose-server.yml up -d

# Frontend
cd e:\UniversityWork\webcomcamp24\infra
docker-compose -f docker-compose-frontend.yml up -d
```

## Push to Docker Hub

```powershell
docker push 371methat/backend-comcamp:1.0.1
docker push 371methat/frontend-comcamp:1.0.4
```

## Stop Containers

```powershell
docker-compose -f docker-compose-server.yml down
docker-compose -f docker-compose-frontend.yml down
```
