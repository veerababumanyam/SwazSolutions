#!/bin/bash

echo "🔐 GitHub Token Setup for Camera Updates AI Scraper"
echo ""
echo "This script will help you set up your GitHub Personal Access Token"
echo "for the AI-powered camera updates scraper."
echo ""
echo "Step 1: Get your GitHub token"
echo "----------------------------------------"
echo "1. Visit: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Give it a name: 'Camera Updates Scraper'"
echo "4. Select scopes: (none needed for GitHub Models)"
echo "5. Click 'Generate token'"
echo "6. Copy the token (starts with ghp_)"
echo ""
echo "Step 2: Enter your token"
echo "----------------------------------------"
read -p "Paste your GitHub token here: " github_token
echo ""

if [ -z "$github_token" ]; then
    echo "❌ No token provided. Exiting..."
    exit 1
fi

# Update .env file
cd "$(dirname "$0")"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
fi

# Update GitHub token in .env
if grep -q "GITHUB_TOKEN=" .env; then
    sed -i.bak "s/GITHUB_TOKEN=.*/GITHUB_TOKEN=$github_token/" .env
    rm .env.bak 2>/dev/null
    echo "✅ Updated GITHUB_TOKEN in .env"
else
    echo "GITHUB_TOKEN=$github_token" >> .env
    echo "✅ Added GITHUB_TOKEN to .env"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. cd backend && npm install"
echo "2. npm start"
echo ""
echo "The camera updates scraper will now use AI to extract real data!"
