# Docker Infrastructure Scripts

This directory contains Docker configuration and helper scripts for the webcomcamp24 project.

## Directory Structure

```
infra/
├── docker-compose.dev.yml   # Development environment configuration
├── docker-compose.prod.yml  # Production environment configuration
├── build-dev.ps1           # Build development images
├── build-prod.ps1          # Build production images
├── start-dev.ps1           # Start development environment
├── start-prod.ps1          # Start production environment
└── stop.ps1                # Stop all containers
```

## Quick Start

### Development Environment

1. **Build development images:**

   ```powershell
   .\infra\build-dev.ps1
   ```

2. **Start development environment:**

   ```powershell
   .\infra\start-dev.ps1
   ```

   This will start:

   - MongoDB on `localhost:27017`
   - Backend server on `http://localhost:5000` (with hot-reload)
   - Frontend on `http://localhost:5173` (with HMR)

3. **Stop all containers:**
   ```powershell
   .\infra\stop.ps1
   ```

### Production Environment

1. **Build production images:**

   ```powershell
   .\infra\build-prod.ps1
   ```

2. **Start production environment:**

   ```powershell
   .\infra\start-prod.ps1
   ```

   This will start:

   - MongoDB on `localhost:27017`
   - Backend server on `http://localhost:5000`
   - Frontend on `http://localhost` (port 80)

3. **View logs:**

   ```powershell
   docker-compose -f infra/docker-compose.prod.yml logs -f
   ```

4. **Stop all containers:**
   ```powershell
   .\infra\stop.ps1
   ```

## Dockerfile Locations

### Server (Backend)

- Development: `server/infra/Dockerfile.dev`
- Production: `server/infra/Dockerfile.prod`

### Frontend

- Development: `src/infra/Dockerfile.dev`
- Production: `src/infra/Dockerfile.prod`

## Environment Variables

Make sure to set up your `.env` files:

- `server/.env` - Backend environment variables
- `.env` - Frontend environment variables (if needed)

## Manual Docker Commands

If you prefer to use Docker commands directly:

### Development

```powershell
# Build
docker-compose -f infra/docker-compose.dev.yml build

# Start
docker-compose -f infra/docker-compose.dev.yml up

# Stop
docker-compose -f infra/docker-compose.dev.yml down
```

### Production

```powershell
# Build
docker-compose -f infra/docker-compose.prod.yml build

# Start (detached)
docker-compose -f infra/docker-compose.prod.yml up -d

# Stop
docker-compose -f infra/docker-compose.prod.yml down
```

## Notes

- Development mode includes hot-reload for both frontend and backend
- Production mode uses optimized builds with nginx serving the frontend
- MongoDB data is persisted in Docker volumes
- All services are connected via a Docker network
