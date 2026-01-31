#!/bin/bash

################################################################################
# Check Logs Script
# View application logs from production server
################################################################################

# Configuration
SERVER_IP="185.199.52.230"
SERVER_USER="root"
SSH_KEY="$HOME/.ssh/id_ed25519_swazsolutions"

# Colors
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Default to last 50 lines
LINES=${1:-50}

log_info "Fetching last $LINES lines of application logs..."
echo ""

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
    "pm2 logs swazsolutions --lines $LINES --nostream"

echo ""
log_info "Use --follow to watch logs in real-time:"
echo "  ssh -i ~/.ssh/id_ed25519_swazsolutions $SERVER_USER@$SERVER_IP 'pm2 logs swazsolutions'"
