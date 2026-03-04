# Authentication System - Development Commands

.PHONY: setup dev-web dev-mobile build docker-up docker-down

# Install all dependencies across all projects
setup:
    cd mobile && npm install
    cd web && npm install
    cd shared && npm install
    @echo "✅ All dependencies installed!"

# Start web in development
dev-web:
    cd web && npm run dev

# Start mobile in development
dev-mobile:
    cd mobile && npm run start

# Build web for production
build-web:
    cd web && npm run build

# Docker commands
docker-up:
    docker-compose up --build

docker-down:
    docker-compose down

# Help command
help:
    @echo "Available commands:"
    @echo "  make setup       - Install all dependencies"
    @echo "  make dev-web     - Start web development server"
    @echo "  make dev-mobile  - Start mobile development server"
    @echo "  make build-web   - Build web for production"
    @echo "  make docker-up   - Start Docker containers"
    @echo "  make docker-down - Stop Docker containers"