# Authentication System - Development Commands

.PHONY: help setup setup-env dev-web dev-mobile \
        test test-web test-shared test-web-watch test-shared-watch test-web-coverage test-shared-coverage \
        lint-web build-web \
        docker-up docker-down docker-build \
        clean

.DEFAULT_GOAL := help

# ──────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────

## Install all dependencies (shared + web + mobile)
setup:
	cd shared && npm install
	cd web && npm install
	cd mobile && npm install
	@echo "✅ All dependencies installed!"

## Copy .env.example files to .env.development (will NOT overwrite existing)
setup-env:
	@test -f web/.env.development || (cp web/.env.example web/.env.development && echo "📄 web/.env.development created")
	@test -f mobile/.env.development || (cp mobile/.env.example mobile/.env.development && echo "📄 mobile/.env.development created")
	@echo "⚠️  Fill in your Firebase credentials in web/.env.development and mobile/.env.development"

<<<<<<< Updated upstream
=======
## Create root .env for docker-compose (will NOT overwrite existing .env)
setup-env-docker:
	@if [ -f .env ]; then \
		echo "📄 .env already exists"; \
	elif [ -f web/.env.development ]; then \
		cp web/.env.development .env && echo "📄 .env created from web/.env.development"; \
	else \
		cp .env.example .env && echo "📄 .env created from .env.example"; \
	fi
	@echo "⚠️  Ensure Firebase credentials are set in .env before make docker-up"

>>>>>>> Stashed changes
# ──────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────

## Start Next.js web dev server (http://localhost:3000)
dev-web:
	cd web && npm run dev

## Start Expo mobile dev server
dev-mobile:
	cd mobile && npm run start

# ──────────────────────────────────────────────
# Testing
# ──────────────────────────────────────────────

## Run ALL tests (shared + web)
test:
	cd shared && npm test
	cd web && npm test

## Run web tests
test-web:
	cd web && npm test

## Run shared tests
test-shared:
	cd shared && npm test

## Run web tests in watch mode
test-web-watch:
	cd web && npm run test:watch

## Run shared tests in watch mode
test-shared-watch:
	cd shared && npm run test:watch

## Run web tests with coverage
test-web-coverage:
	cd web && npm run test:coverage

## Run shared tests with coverage
test-shared-coverage:
	cd shared && npm run test:coverage

# ──────────────────────────────────────────────
# Lint & Build
# ──────────────────────────────────────────────

## Lint the web project
lint-web:
	cd web && npm run lint

## Build web for production
build-web:
	cd web && npm run build

# ──────────────────────────────────────────────
# Docker
# ──────────────────────────────────────────────

## Build and start Docker containers
docker-up:
	docker-compose up --build

## Stop Docker containers
docker-down:
	docker-compose down

## Build Docker images without starting
docker-build:
	docker-compose build

# ──────────────────────────────────────────────
# Cleanup
# ──────────────────────────────────────────────

## Remove all node_modules directories
clean:
	rm -rf node_modules shared/node_modules web/node_modules mobile/node_modules
	@echo "🧹 All node_modules removed. Run 'make setup' to reinstall."

# ──────────────────────────────────────────────
# Help
# ──────────────────────────────────────────────

## Show this help message
help:
	@echo ""
	@echo "Authentication System — available commands:"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## //' | \
		awk 'BEGIN {target=""} /^[a-zA-Z]/ {target=$$0; next} {print "  " target}' || true
	@echo "  Setup"
	@echo "    make setup              Install all dependencies"
	@echo "    make setup-env          Create .env files from .env.example templates"
	@echo ""
	@echo "  Development"
	@echo "    make dev-web            Start Next.js dev server (localhost:3000)"
	@echo "    make dev-mobile         Start Expo dev server"
	@echo ""
	@echo "  Testing"
	@echo "    make test               Run all tests (shared + web)"
	@echo "    make test-web           Run web tests"
	@echo "    make test-shared        Run shared tests"
	@echo "    make test-web-watch     Run web tests in watch mode"
	@echo "    make test-shared-watch  Run shared tests in watch mode"
	@echo "    make test-web-coverage  Run web tests with coverage report"
	@echo "    make test-shared-coverage  Run shared tests with coverage report"
	@echo ""
	@echo "  Lint & Build"
	@echo "    make lint-web           Lint web project (ESLint)"
	@echo "    make build-web          Build web for production"
	@echo ""
	@echo "  Docker"
	@echo "    make docker-up          Build & start containers"
	@echo "    make docker-down        Stop containers"
	@echo "    make docker-build       Build images only"
	@echo ""
	@echo "  Cleanup"
	@echo "    make clean              Remove all node_modules"
	@echo ""