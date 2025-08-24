#!/bin/bash

# CochesPalma Deployment Script for AWS EC2
# Usage: ./scripts/deploy.sh [--seed-data]

set -e

echo "🚀 Starting CochesPalma deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}❌ Please don't run this script as root${NC}"
  exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists docker; then
    echo -e "${RED}❌ Docker not found. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}⚠️  Please log out and back in for Docker permissions to take effect${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose not found. Installing...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.production .env
    echo -e "${RED}❌ Please edit .env file with your actual values before continuing${NC}"
    echo "Required variables:"
    echo "  - DB_PASSWORD"
    echo "  - MYSQL_ROOT_PASSWORD" 
    echo "  - OPENAI_API_KEY"
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/log/caddy
sudo chown -R $USER:$USER /var/log/caddy
mkdir -p caddy mysql-conf

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
for service in mysql api frontend; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "${service}.*Up"; then
        echo -e "${GREEN}✅ $service is running${NC}"
    else
        echo -e "${RED}❌ $service failed to start${NC}"
        docker-compose -f docker-compose.prod.yml logs $service
        exit 1
    fi
done

# Seed data if requested
if [ "$1" = "--seed-data" ]; then
    echo "🌱 Seeding database with vehicle data..."
    docker-compose -f docker-compose.prod.yml exec -T api node scripts/scrapeCoches.js
    echo "🚗 Seeding rental car data..."
    docker-compose -f docker-compose.prod.yml exec -T api node scripts/scrapeRentacars.js
fi

# Display status
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Your application is now available at:"
echo "  • https://trendsunion.com (Main site)"
echo "  • https://trendsunion.com/admin/ (PHPMyAdmin - if admin profile enabled)"
echo ""
echo "📋 Useful commands:"
echo "  • View logs: docker-compose -f docker-compose.prod.yml logs [service]"
echo "  • Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  • Start admin panel: docker-compose -f docker-compose.prod.yml --profile admin up -d phpmyadmin"
echo "  • Seed data: ./scripts/deploy.sh --seed-data"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to configure your domain DNS to point to this server's IP!${NC}"
