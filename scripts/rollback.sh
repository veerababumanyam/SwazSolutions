#!/bin/bash

################################################################################
# Rollback Script
# Reverts to previous deployment version
################################################################################

set -e

# Configuration
SERVER_IP="185.199.52.230"
SERVER_USER="root"
SERVER_PATH="/var/www/swazsolutions"
SSH_KEY="$HOME/.ssh/id_ed25519_swazsolutions"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Confirm rollback
confirm_rollback() {
    log_warning "This will rollback to the previous deployment version"
    echo -e "${YELLOW}ATTENTION:${NC} All changes will be reverted!"
    echo ""
    read -p "Are you sure you want to rollback? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Rollback cancelled"
        exit 0
    fi
}

# Stop application
stop_application() {
    log_info "Stopping application..."
    if ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "cd $SERVER_PATH && pm2 stop swazsolutions"; then
        log_success "Application stopped"
    else
        log_error "Failed to stop application"
        exit 1
    fi
}

# Restore previous version
restore_previous_version() {
    log_info "Restoring previous version from git..."

    if ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "cd $SERVER_PATH && git fetch origin && git reset --hard HEAD~1"; then
        log_success "Previous version restored"
    else
        log_error "Failed to restore previous version"
        exit 1
    fi
}

# Rebuild
rebuild() {
    log_info "Rebuilding application..."

    if ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "cd $SERVER_PATH && npm run build"; then
        log_success "Application rebuilt"
    else
        log_error "Failed to rebuild application"
        exit 1
    fi
}

# Start application
start_application() {
    log_info "Starting application..."

    if ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "cd $SERVER_PATH && pm2 restart swazsolutions && pm2 save"; then
        log_success "Application started"
    else
        log_error "Failed to start application"
        exit 1
    fi
}

# Verify rollback
verify_rollback() {
    log_info "Verifying rollback..."

    # Wait for app to start
    sleep 3

    # Check if app is running
    if ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "pm2 status swazsolutions" | grep -q "online"; then
        log_success "Rollback verified - application is running"
        return 0
    else
        log_error "Rollback verification failed - application not running"
        return 1
    fi
}

# Display results
display_results() {
    echo ""
    echo "===== Rollback Complete ====="
    echo ""
    log_success "Application has been rolled back to previous version"
    echo ""
    log_info "Next steps:"
    echo "  1. Monitor logs: ./scripts/check-logs.sh"
    echo "  2. Verify functionality: https://swazdatarecovery.com"
    echo "  3. Investigate previous deployment issue"
    echo ""
}

# Main execution
main() {
    log_info "Starting rollback process..."
    echo ""

    confirm_rollback
    stop_application
    restore_previous_version
    rebuild
    start_application

    if verify_rollback; then
        display_results
        exit 0
    else
        log_error "Rollback failed. Application may not be running."
        log_info "Check logs with: ./scripts/check-logs.sh"
        exit 1
    fi
}

# Run main function
main "$@"
