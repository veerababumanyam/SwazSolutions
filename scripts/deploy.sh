#!/bin/bash

################################################################################
# Production Deployment Script for Swaz Solutions
# Deploys built dist folder and backend to production server
################################################################################

set -e  # Exit on error

# Configuration
SERVER_IP="185.199.52.230"
SERVER_USER="root"
SERVER_PATH="/var/www/swazsolutions"
SSH_KEY="$HOME/.ssh/id_ed25519_swazsolutions"
DOMAIN="https://swazdatarecovery.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if SSH key exists
    if [ ! -f "$SSH_KEY" ]; then
        log_error "SSH key not found at $SSH_KEY"
        exit 1
    fi

    # Check if dist folder exists
    if [ ! -d "dist" ]; then
        log_error "dist/ folder not found. Run 'npm run build' first."
        exit 1
    fi

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Not in project root?"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Build locally
build_locally() {
    log_info "Building locally..."

    if npm run build; then
        log_success "Build completed successfully"
    else
        log_error "Build failed"
        exit 1
    fi
}

# Deploy to server
deploy_to_server() {
    log_info "Deploying to server ($SERVER_IP)..."
    log_info "This may take a few minutes..."

    # Create tar archive and deploy
    if tar czf - \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='coverage' \
        --exclude='.cache' \
        --exclude='src' \
        --exclude='tests' \
        dist backend package.json package-lock.json | \
        ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "cd $SERVER_PATH && tar xzf - && npm install --omit=dev"; then
        log_success "Files deployed to server"
    else
        log_error "Failed to deploy files to server"
        exit 1
    fi
}

# Restart application
restart_app() {
    log_info "Restarting application on server..."

    if ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "cd $SERVER_PATH && pm2 restart swazsolutions && pm2 save"; then
        log_success "Application restarted successfully"
    else
        log_error "Failed to restart application"
        exit 1
    fi
}

# Wait for server to be ready
wait_for_server() {
    log_info "Waiting for server to be ready..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -sf "$DOMAIN/" > /dev/null 2>&1; then
            log_success "Server is ready"
            return 0
        fi

        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done

    log_warning "Server took longer than expected to start, but continuing..."
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."

    # Check if application is running
    if ! ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "pm2 status swazsolutions" | grep -q "online"; then
        log_error "Application is not running on server"
        return 1
    fi

    log_success "Application is running"

    # Check if endpoint responds
    if curl -sf "$DOMAIN/profile" > /dev/null 2>&1; then
        log_success "Endpoint is responding"
    else
        log_warning "Could not verify endpoint (may be due to network/SSL)"
    fi

    return 0
}

# Display final status
display_final_status() {
    log_info "===== Deployment Complete ====="
    echo ""
    echo "  Domain:         $DOMAIN"
    echo "  Server:         $SERVER_IP"
    echo "  Application:    swazsolutions"
    echo ""
    log_info "Next steps:"
    echo "  1. Monitor logs: ./scripts/check-logs.sh"
    echo "  2. Verify functionality: Visit $DOMAIN/profile"
    echo "  3. Run tests: npm run test:e2e"
    echo "  4. Check health: ./scripts/verify-deployment.sh"
    echo ""
}

# Main execution
main() {
    log_info "Starting deployment process..."
    echo ""

    check_prerequisites
    build_locally
    deploy_to_server
    restart_app
    wait_for_server

    if verify_deployment; then
        log_success "Deployment verified successfully!"
        display_final_status
        exit 0
    else
        log_error "Deployment verification failed"
        log_info "Run './scripts/check-logs.sh' for more details"
        exit 1
    fi
}

# Run main function
main "$@"
