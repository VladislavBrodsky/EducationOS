.PHONY: install dev-api dev-web check schema compose-up
install:
	cd backend && uv sync --frozen
	npm ci
dev-api:
	cd backend && uv run --frozen uvicorn educationos.main:app --reload --host 127.0.0.1 --port 8000 --no-access-log
dev-web:
	npm run dev
check:
	cd backend && uv run --frozen ruff check . && uv run --frozen pytest
	npm run check
schema:
	cd backend && uv run --frozen python -m educationos.export_openapi
	npm run api:generate
compose-up:
	docker compose up --build -d
