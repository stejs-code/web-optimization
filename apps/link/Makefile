.PHONY: build dev run clean test install

# Build the application
build:
	@go build -o bin/link main.go

# Run in development mode with hot reload
dev:
	@go run main.go

# Run the built binary
run: build
	@echo "Running link shortener..."
	@./bin/link

# Install dependencies
install:
	@echo "Installing dependencies..."
	@go mod download
	@go mod tidy
	@echo "Dependencies installed"

# Run tests
test:
	@echo "Running tests..."
	@go test -v ./...

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf bin/
	@rm -f links.db
	@echo "Clean complete"
