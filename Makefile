.PHONY: start stop build test install clean logs help

# ═══════════════════════════════════════
#  ABHA-Sync MVP - Makefile
# ═══════════════════════════════════════

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Single Command Startup ───
start: ## Start all services (ONE COMMAND)
	docker compose up --build -d
	@echo ""
	@echo "═══════════════════════════════════════"
	@echo "  ABHA-Sync MVP is running!"
	@echo "═══════════════════════════════════════"
	@echo ""
	@echo "  Dashboard:    http://localhost:3011"
	@echo "  API Gateway:  http://localhost:3010"
	@echo "  API Health:   http://localhost:3010/api/health"
	@echo ""
	@echo "  Existing Backend: http://localhost:8000"
	@echo "  Existing Frontend: http://localhost:3000"
	@echo ""

stop: ## Stop all services
	docker compose down

build: ## Build all Docker images
	docker compose build

restart: ## Restart all services
	docker compose restart

logs: ## View logs from all services
	docker compose logs -f

logs-gateway: ## View API Gateway logs
	docker compose logs -f api-gateway

# ─── Local Development ───
install: ## Install dependencies for all services locally
	cd services/shared && npm install
	cd services/ai-extraction && npm install
	cd services/medical-normalization && npm install
	cd services/fhir-generator && npm install
	cd services/abha-mock-service && npm install
	cd services/api-gateway && npm install
	cd front-end-1 && npm install

# ─── Testing ───
test: ## Run all tests
	@echo "Running Shared Module tests..."
	cd services/shared && npm test
	@echo ""
	@echo "Running AI Extraction tests..."
	cd services/ai-extraction && npm test
	@echo ""
	@echo "Running Medical Normalization tests..."
	cd services/medical-normalization && npm test
	@echo ""
	@echo "Running FHIR Generator tests..."
	cd services/fhir-generator && npm test
	@echo ""
	@echo "Running ABHA Mock Service tests..."
	cd services/abha-mock-service && npm test
	@echo ""
	@echo "Running API Gateway tests..."
	cd services/api-gateway && npm test
	@echo ""
	@echo "════════════════════════"
	@echo "  All tests complete!"
	@echo "════════════════════════"

test-shared: ## Run shared module tests
	cd services/shared && npm test

test-extraction: ## Run AI Extraction tests
	cd services/ai-extraction && npm test

test-normalization: ## Run Normalization tests
	cd services/medical-normalization && npm test

test-fhir: ## Run FHIR Generator tests
	cd services/fhir-generator && npm test

test-abha: ## Run ABHA Mock tests
	cd services/abha-mock-service && npm test

test-gateway: ## Run API Gateway tests
	cd services/api-gateway && npm test

# ─── Database ───
migrate: ## Run database migrations
	cd services/api-gateway && node src/migrate.js

# ─── Cleanup ───
clean: ## Remove all containers, volumes, and built images
	docker compose down -v --rmi all 2>/dev/null || true
	find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	rm -rf services/data 2>/dev/null || true
	@echo "Cleaned up successfully"
