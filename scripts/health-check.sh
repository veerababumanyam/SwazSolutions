#!/bin/bash

################################################################################
# Health Check Script
# Monitors application health and performance
################################################################################

# Configuration
SERVER_IP="185.199.52.230"
SERVER_USER="root"
SSH_KEY="$HOME/.ssh/id_ed25519_swazsolutions"
DOMAIN="https://swazdatarecovery.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=90
RESPONSE_TIME_THRESHOLD=3000  # milliseconds

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check application health
check_health() {
    log_info "Checking application health..."
    echo ""

    # Check if running
    log_info "Application Status:"
    local status=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "pm2 status swazsolutions 2>/dev/null | grep swazsolutions | awk '{print \$13}'" || echo "unknown")

    if [ "$status" = "online" ]; then
        log_success "Application is running"
    else
        log_error "Application is not running (status: $status)"
    fi

    # Check uptime
    log_info "Uptime:"
    local uptime=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "pm2 status swazsolutions 2>/dev/null | grep swazsolutions | awk '{print \$14}'" || echo "unknown")
    echo "  $uptime"

    echo ""
}

# Check performance
check_performance() {
    log_info "Checking performance metrics..."
    echo ""

    # CPU and Memory
    log_info "Resource Usage:"
    local memory=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "pm2 status swazsolutions 2>/dev/null | grep swazsolutions | awk '{print \$10}'" || echo "0")
    local cpu=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "pm2 status swazsolutions 2>/dev/null | grep swazsolutions | awk '{print \$9}'" || echo "0")

    echo "  CPU:    ${cpu}%"
    echo "  Memory: ${memory}MB"

    if (( $(echo "$memory > $MEMORY_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
        log_warning "High memory usage detected"
    fi

    echo ""

    # Response time
    log_info "Response Time:"
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$DOMAIN/profile" 2>/dev/null || echo "0")
    local response_ms=$(echo "$response_time * 1000" | bc)

    echo "  ${response_ms}ms"

    if (( $(echo "$response_ms > $RESPONSE_TIME_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
        log_warning "Slow response time detected"
    else
        log_success "Response time is good"
    fi

    echo ""
}

# Check system resources
check_system() {
    log_info "Checking system resources..."
    echo ""

    # Disk space
    log_info "Disk Space:"
    local disk_usage=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "df / | awk 'NR==2 {print \$5}' | sed 's/%//'")

    echo "  Usage: ${disk_usage}%"

    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        log_error "Critical disk space usage"
    elif [ "$disk_usage" -gt 80 ]; then
        log_warning "High disk space usage"
    else
        log_success "Disk space is healthy"
    fi

    echo ""

    # Load average
    log_info "System Load:"
    local load=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "uptime | awk -F 'load average:' '{print \$2}'")

    echo "  $load"

    echo ""
}

# Check recent errors
check_errors() {
    log_info "Checking for recent errors..."
    echo ""

    local error_count=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
        "pm2 logs swazsolutions --lines 100 --nostream 2>/dev/null | grep -i 'error\|exception' | wc -l" || echo "0")

    if [ "$error_count" -gt 0 ]; then
        log_warning "Found $error_count error(s) in recent logs"
        echo ""
        log_info "Recent errors:"
        ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
            "pm2 logs swazsolutions --lines 100 --nostream 2>/dev/null | grep -i 'error\|exception' | tail -5" | \
            sed 's/^/  /'
    else
        log_success "No errors in recent logs"
    fi

    echo ""
}

# Check connectivity
check_connectivity() {
    log_info "Checking connectivity..."
    echo ""

    # HTTP endpoint
    log_info "HTTP Connectivity:"
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" -I "$DOMAIN/" 2>/dev/null || echo "000")

    if [ "$http_code" = "200" ]; then
        log_success "HTTP endpoint is responding"
    else
        log_error "HTTP endpoint returned status $http_code"
    fi

    # HTTPS
    log_info "HTTPS Certificate:"
    local cert_expiry=$(openssl s_client -connect swazdatarecovery.com:443 -servername swazdatarecovery.com 2>/dev/null | \
        openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d'=' -f2 || echo "unknown")

    echo "  Expires: $cert_expiry"

    echo ""
}

# Main execution
main() {
    log_info "========== Application Health Check =========="
    echo ""
    echo "Timestamp: $(date)"
    echo ""

    check_health
    check_performance
    check_system
    check_errors
    check_connectivity

    log_info "========== Health Check Complete =========="
}

# Run main function
main "$@"
