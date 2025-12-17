#!/bin/bash

# Webcomcamp24 - Ubuntu Deployment Script
# This script automates the deployment process on Ubuntu server

set -e  # Exit on error

echo "🚀 Webcomcamp24 Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/webcomcamp24"
REPO_URL="${REPO_URL:-}"  # Set via environment variable

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Ask for confirmation to cleanup old deployment
echo ""
print_warning "This will remove existing deployment if present."
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deployment cancelled"
    exit 0
fi

# Cleanup old deployment
echo ""
print_info "Cleaning up old deployment..."

# Stop and remove containers
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    if [ -f "infra/docker-compose.prod.yml" ]; then
        print_info "Stopping containers..."
        docker-compose -f infra/docker-compose.prod.yml down || true
    fi
fi

# Remove containers
print_info "Removing old containers..."
docker ps -a --filter name=webcomcamp24 -q | xargs -r docker rm -f || true

# Remove images
print_info "Removing old images..."
docker images --filter=reference='infra-*' -q | xargs -r docker rmi -f || true

# Ask about volumes
echo ""
print_warning "Do you want to remove database volumes? (This will DELETE all data)"
read -p "Remove volumes? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Removing volumes..."
    docker volume rm infra_mongodb_data || true
    print_warning "Database volumes removed"
else
    print_info "Keeping existing database volumes"
fi

# Remove old code
if [ -d "$PROJECT_DIR" ]; then
    print_info "Removing old code..."
    sudo rm -rf "$PROJECT_DIR"
fi

print_success "Cleanup completed"

# Clone repository
echo ""
print_info "Cloning repository..."

if [ -z "$REPO_URL" ]; then
    print_error "REPO_URL environment variable is not set"
    read -p "Enter repository URL: " REPO_URL
fi

sudo mkdir -p "$PROJECT_DIR"
sudo chown $USER:$USER "$PROJECT_DIR"
git clone "$REPO_URL" "$PROJECT_DIR"
cd "$PROJECT_DIR"

print_success "Repository cloned"

# Setup environment variables
echo ""
print_info "Setting up environment variables..."

cat > server/.env << 'EOF'
MONGO_URI=mongodb://mongodb:27017/webcomampdb
PORT=5000
EOF

print_success "Environment variables configured"

# Build images
echo ""
print_info "Building Docker images (this may take a while)..."
docker-compose -f infra/docker-compose.prod.yml build --no-cache

print_success "Docker images built"

# Start services
echo ""
print_info "Starting services..."
docker-compose -f infra/docker-compose.prod.yml up -d

print_success "Services started"

# Wait for services to be ready
echo ""
print_info "Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
print_info "Checking service status..."
docker-compose -f infra/docker-compose.prod.yml ps

# Create admin account
echo ""
print_warning "Do you want to create an admin account?"
read -p "Create admin? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter admin username: " ADMIN_USER
    read -s -p "Enter admin password: " ADMIN_PASS
    echo ""
    
    print_info "Creating admin account..."
    docker exec -it webcomcamp24-server-prod node scripts/seedAdmin.js "$ADMIN_USER" "$ADMIN_PASS"
    print_success "Admin account created"
fi

# Show logs
echo ""
print_info "Showing recent logs..."
docker-compose -f infra/docker-compose.prod.yml logs --tail=50

# Final status
echo ""
echo "=================================="
print_success "Deployment completed!"
echo "=================================="
echo ""
print_info "Services are running at:"
echo "  - Frontend: http://localhost (port 80)"
echo "  - Backend:  http://localhost:5000"
echo "  - MongoDB:  localhost:27017"
echo ""
print_info "Useful commands:"
echo "  - View logs:    cd $PROJECT_DIR && docker-compose -f infra/docker-compose.prod.yml logs -f"
echo "  - Stop:         cd $PROJECT_DIR && docker-compose -f infra/docker-compose.prod.yml down"
echo "  - Restart:      cd $PROJECT_DIR && docker-compose -f infra/docker-compose.prod.yml restart"
echo "  - Status:       cd $PROJECT_DIR && docker-compose -f infra/docker-compose.prod.yml ps"
echo ""
print_warning "Remember to configure your firewall to allow ports 80 and 5000"
