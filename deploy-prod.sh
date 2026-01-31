#!/bin/bash
set -e

SERVER_IP="185.199.52.230"
SERVER_USER="root"
SERVER_PATH="/var/www/swazsolutions"
SSH_KEY="$HOME/.ssh/id_ed25519_swazsolutions"

echo "========== PRODUCTION DEPLOYMENT =========="
echo ""
echo "Step 1: Verifying build..."
if [ ! -f "dist/index.html" ]; then
    echo "ERROR: dist/index.html not found"
    exit 1
fi
echo "✓ Build verified"
echo ""

echo "Step 2: Uploading files to server ($SERVER_IP)..."
tar czf - \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='coverage' \
    --exclude='.cache' \
    --exclude='src' \
    --exclude='tests' \
    dist backend package.json package-lock.json | \
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
"cd $SERVER_PATH && tar xzf - && npm install --omit=dev"

echo "✓ Files uploaded and dependencies installed"
echo ""

echo "Step 3: Restarting application..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" \
"cd $SERVER_PATH && pm2 restart swazsolutions && pm2 save"

echo "✓ Application restarted"
echo ""

echo "Step 4: Waiting for server to be ready..."
sleep 3

echo "Step 5: Verifying deployment..."
if curl -sf "https://swazdatarecovery.com/profile" > /dev/null 2>&1; then
    echo "✓ Application is responding"
else
    echo "⚠ Could not reach application (may be warming up)"
fi

echo ""
echo "========== DEPLOYMENT COMPLETE =========="
echo "Domain:     https://swazdatarecovery.com"
echo "Server:     $SERVER_IP"
echo ""
echo "Next steps:"
echo "  1. Verify at: https://swazdatarecovery.com/profile"
echo "  2. Check logs: bash scripts/check-logs.sh"
echo "  3. Health check: bash scripts/health-check.sh"
echo ""
