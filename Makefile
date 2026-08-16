.DEFAULT_GOAL := help
.PHONY: help setup dev server test coverage lint build

help: ## List the available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-8s\033[0m %s\n", $$1, $$2}'

setup: ## Install dependencies and prepare the database
	bundle install
	yarn install
	bin/rails db:prepare

dev: ## Start the app (Rails server + JS watcher) on PORT, default 3000
	bin/dev

server: ## Start only the Rails server, without the JS watcher
	bin/rails server

test: ## Run the test suite with the 90% coverage check
	bin/rails test

coverage: ## Run tests and open the HTML coverage report
	bin/rails test
	@if command -v open >/dev/null 2>&1; then \
		open coverage/index.html; \
	else \
		echo "Coverage report: coverage/index.html"; \
	fi

lint: ## Run RuboCop
	bin/rubocop

build: ## Build the JavaScript bundle once
	yarn build
