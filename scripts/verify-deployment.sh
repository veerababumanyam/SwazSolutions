#!/bin/bash

################################################################################
# Deployment Verification Script
# Verifies that the deployment was successful
################################################################################

set -e

# Configuration
SERVER_IP="185.199.52.230"
SERVER_USER="root"
SERVER_PATH="/var/www/swazsolutions"
SSH_KEY="$HOME/.ssh/id_ed25519_swazsolutions"
DOMAIN="https://swazdatarecovery.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_TOTAL=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((CHECKS_PASSED++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((CHECKS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_check() {
    echo -e "${BLUE}Checking:${NC} $1"
    ((CHECKS_TOTAL++))
}

# Check SSH connection
check_ssh_connection() {
    log_check "SSH connection"
    if ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "echo 'SSH connection OK'" > /dev/null 2>&1; then
        log_success "SSH connection established"
    else
        log_error "Cannot connect via SSH"
        exit 1
    fi
}

# Check application status
check_app_status() {
    log_check "Application status"
    local status=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "pm2 status swazsolutions" 2>/dev/null | grep swazsolutions)

    if echo "$status" | grep -q "online"; then
        log_success "Application is running (online)"
    elif echo "$status" | grep -q "stopped"; then
        log_error "Application is stopped"
    else
        log_error "Application status unknown"
    fi
}

# Check application logs
check_app_logs() {
    log_check "Application logs (last 20 lines)"
    local logs=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "pm2 logs swazsolutions --lines 20 --nostream" 2>/dev/null)

    if echo "$logs" | grep -i "error\|exception\|failed" > /dev/null; then
        log_error "Errors detected in application logs"
        echo "  Recent errors:"
        echo "$logs" | grep -i "error\|exception\|failed" | head -5 | sed 's/^/    /'
    else
        log_success "No critical errors in logs"
    fi
}

# Check HTTP endpoint
check_http_endpoint() {
    log_check "HTTP endpoint ($DOMAIN/profile)"
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" -I "$DOMAIN/profile" 2>/dev/null || echo "000")

    if [ "$http_code" = "200" ]; then
        log_success "Endpoint responds with 200 OK"
    elif [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
        log_success "Endpoint responds with redirect ($http_code)"
    else
        log_error "Endpoint returned HTTP $http_code"
    fi
}

# Check HTTPS certificate
check_https_certificate() {
    log_check "HTTPS certificate"
    local cert_info=$(openssl s_client -connect "$DOMAIN:443" -servername swazdatarecovery.com 2>/dev/null | openssl x509 -noout -text 2>/dev/null | grep -A2 "Not After" || echo "")

    if [ -z "$cert_info" ]; then
        log_error "Could not retrieve certificate information"
    else
        log_success "Certificate is valid"
        echo "  $cert_info" | sed 's/^/    /'
    fi
}

# Check nginx status
check_nginx_status() {
    log_check "nginx status"
    local nginx_status=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "systemctl status nginx" 2>/dev/null | grep -i "active\|inactive")

    if echo "$nginx_status" | grep -qi "active"; then
        log_success "nginx is running"
    else
        log_error "nginx is not running"
    fi
}

# Check disk space
check_disk_space() {
    log_check "Disk space"
    local disk_usage=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "df / | awk 'NR==2 {print \$5}' | sed 's/%//'")

    if [ "$disk_usage" -lt 80 ]; then
        log_success "Disk usage is $disk_usage% (healthy)"
    elif [ "$disk_usage" -lt 90 ]; then
        log_warning "Disk usage is $disk_usage% (moderate)"
    else
        log_error "Disk usage is $disk_usage% (critical)"
    fi
}

# Check database
check_database() {
    log_check "Database file"
    local db_size=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "ls -lah $SERVER_PATH/backend/music.db 2>/dev/null | awk '{print \$5}'" || echo "0B")

    if [ "$db_size" != "0B" ]; then
        log_success "Database exists (size: $db_size)"
    else
        log_error "Database not found or inaccessible"
    fi
}

# Check dist folder
check_dist_folder() {
    log_check "Dist folder"
    local dist_files=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "ls -la $SERVER_PATH/dist/ 2>/dev/null | wc -l" || echo "0")

    if [ "$dist_files" -gt 5 ]; then
        log_success "Dist folder exists with $dist_files items"
    else
        log_error "Dist folder is empty or missing"
    fi
}

# Check Node.js and npm
check_nodejs() {
    log_check "Node.js installation"
    local node_version=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "node --version" 2>/dev/null || echo "not found")

    if echo "$node_version" | grep -q "v"; then
        log_success "Node.js is installed ($node_version)"
    else
        log_error "Node.js not found or version mismatch"
    fi
}

# Check PM2
check_pm2() {
    log_check "PM2 installation"
    local pm2_status=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "pm2 --version" 2>/dev/null || echo "not found")

    if echo "$pm2_status" | grep -qE "^[0-9]"; then
        log_success "PM2 is installed (v$pm2_status)"
    else
        log_error "PM2 not found"
    fi
}

# Check memory usage
check_memory_usage() {
    log_check "Memory usage"
    local memory_usage=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "free | awk 'NR==2 {printf \"%.1f\", \$3/\$2 * 100}'" || echo "0")

    if (( $(echo "$memory_usage < 80" | bc -l) )); then
        log_success "Memory usage is ${memory_usage}% (healthy)"
    elif (( $(echo "$memory_usage < 90" | bc -l) )); then
        log_warning "Memory usage is ${memory_usage}% (moderate)"
    else
        log_error "Memory usage is ${memory_usage}% (high)"
    fi
}

# Check port 3000
check_port_3000() {
    log_check "Port 3000 availability"
    local port_status=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "netstat -tlnp | grep 3000 | wc -l" || echo "0")

    if [ "$port_status" -gt 0 ]; then
        log_success "Port 3000 is in use (application listening)"
    else
        log_error "Port 3000 is not in use"
    fi
}

# Display summary
display_summary() {
    echo ""
    echo "===== Verification Summary ====="
    echo ""
    echo -e "Total Checks:  $CHECKS_TOTAL"
    echo -e "${GREEN}Passed:${NC}        $CHECKS_PASSED"
    echo -e "${RED}Failed:${NC}        $CHECKS_FAILED"
    echo ""

    if [ $CHECKS_FAILED -eq 0 ]; then
        log_success "All checks passed!"
    else
        log_error "$CHECKS_FAILED check(s) failed. Review above for details."
    fi

    echo ""
    log_info "Deployment Details:"
    echo "  Domain:         $DOMAIN"
    echo "  Server:         $SERVER_IP"
    echo "  Application:    swazsolutions"
    echo "  Path:           $SERVER_PATH"
    echo ""
}

# Main execution
main() {
    log_info "Starting deployment verification..."
    echo ""

    check_ssh_connection
    check_app_status
    check_app_logs
    check_http_endpoint
    check_https_certificate
    check_nginx_status
    check_disk_space
    check_database
    check_dist_folder
    check_nodejs
    check_pm2
    check_memory_usage
    check_port_3000

    display_summary

    if [ $CHECKS_FAILED -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
