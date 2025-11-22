#!/bin/bash

# SEO Performance Testing Script
# Tests Core Web Vitals and SEO metrics

echo "🔍 Running SEO Performance Tests..."
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SITE_URL="${1:-http://localhost:5173}"
REPORT_DIR="./seo-reports"

# Create reports directory
mkdir -p "$REPORT_DIR"

echo "📊 Testing: $SITE_URL"
echo ""

# Test 1: Check robots.txt
echo "1️⃣  Checking robots.txt..."
if curl -sf "$SITE_URL/robots.txt" > /dev/null; then
    echo -e "${GREEN}✓${NC} robots.txt is accessible"
    curl -s "$SITE_URL/robots.txt" | head -n 5
else
    echo -e "${RED}✗${NC} robots.txt not found"
fi
echo ""

# Test 2: Check sitemap.xml
echo "2️⃣  Checking sitemap.xml..."
if curl -sf "$SITE_URL/sitemap.xml" > /dev/null; then
    echo -e "${GREEN}✓${NC} sitemap.xml is accessible"
    SITEMAP_COUNT=$(curl -s "$SITE_URL/sitemap.xml" | grep -c "<sitemap>")
    echo "   Found $SITEMAP_COUNT service sitemaps"
else
    echo -e "${RED}✗${NC} sitemap.xml not found"
fi
echo ""

# Test 3: Check meta tags
echo "3️⃣  Checking meta tags..."
HTML=$(curl -s "$SITE_URL")

# Check title
if echo "$HTML" | grep -q "<title>"; then
    TITLE=$(echo "$HTML" | grep -oP '(?<=<title>).*?(?=</title>)' | head -1)
    TITLE_LENGTH=${#TITLE}
    if [ $TITLE_LENGTH -ge 50 ] && [ $TITLE_LENGTH -le 60 ]; then
        echo -e "${GREEN}✓${NC} Title length optimal: $TITLE_LENGTH chars"
    elif [ $TITLE_LENGTH -lt 50 ]; then
        echo -e "${YELLOW}⚠${NC} Title too short: $TITLE_LENGTH chars (recommend 50-60)"
    else
        echo -e "${YELLOW}⚠${NC} Title too long: $TITLE_LENGTH chars (recommend 50-60)"
    fi
    echo "   Title: $TITLE"
else
    echo -e "${RED}✗${NC} No title tag found"
fi

# Check meta description
if echo "$HTML" | grep -q 'name="description"'; then
    DESC=$(echo "$HTML" | grep -oP '(?<=name="description" content=")[^"]*' | head -1)
    DESC_LENGTH=${#DESC}
    if [ $DESC_LENGTH -ge 150 ] && [ $DESC_LENGTH -le 160 ]; then
        echo -e "${GREEN}✓${NC} Description length optimal: $DESC_LENGTH chars"
    elif [ $DESC_LENGTH -lt 150 ]; then
        echo -e "${YELLOW}⚠${NC} Description too short: $DESC_LENGTH chars (recommend 150-160)"
    else
        echo -e "${YELLOW}⚠${NC} Description too long: $DESC_LENGTH chars (recommend 150-160)"
    fi
else
    echo -e "${RED}✗${NC} No meta description found"
fi

# Check Open Graph
if echo "$HTML" | grep -q 'property="og:title"'; then
    echo -e "${GREEN}✓${NC} Open Graph tags present"
else
    echo -e "${RED}✗${NC} Open Graph tags missing"
fi

# Check schema markup
if echo "$HTML" | grep -q 'application/ld+json'; then
    SCHEMA_COUNT=$(echo "$HTML" | grep -c 'application/ld+json')
    echo -e "${GREEN}✓${NC} Schema markup found ($SCHEMA_COUNT blocks)"
else
    echo -e "${RED}✗${NC} No schema markup found"
fi
echo ""

# Test 4: Performance (if Lighthouse CLI is installed)
echo "4️⃣  Running Lighthouse audit (if available)..."
if command -v lighthouse &> /dev/null; then
    echo "   Running Lighthouse..."
    lighthouse "$SITE_URL" \
        --output=json \
        --output=html \
        --output-path="$REPORT_DIR/lighthouse" \
        --only-categories=performance,seo,accessibility \
        --chrome-flags="--headless" \
        --quiet
    
    # Parse results
    if [ -f "$REPORT_DIR/lighthouse.report.json" ]; then
        PERF_SCORE=$(cat "$REPORT_DIR/lighthouse.report.json" | grep -oP '(?<="performance":{"score":)[0-9.]+' | head -1)
        SEO_SCORE=$(cat "$REPORT_DIR/lighthouse.report.json" | grep -oP '(?<="seo":{"score":)[0-9.]+' | head -1)
        A11Y_SCORE=$(cat "$REPORT_DIR/lighthouse.report.json" | grep -oP '(?<="accessibility":{"score":)[0-9.]+' | head -1)
        
        PERF_PERCENT=$(echo "$PERF_SCORE * 100" | bc)
        SEO_PERCENT=$(echo "$SEO_SCORE * 100" | bc)
        A11Y_PERCENT=$(echo "$A11Y_SCORE * 100" | bc)
        
        echo ""
        echo "   📈 Lighthouse Scores:"
        echo "   Performance: ${PERF_PERCENT%.*}%"
        echo "   SEO: ${SEO_PERCENT%.*}%"
        echo "   Accessibility: ${A11Y_PERCENT%.*}%"
        echo ""
        echo "   Full report: $REPORT_DIR/lighthouse.report.html"
    fi
else
    echo -e "${YELLOW}⚠${NC} Lighthouse not installed (install with: npm install -g lighthouse)"
fi
echo ""

# Test 5: Image optimization check
echo "5️⃣  Checking image optimization..."
IMG_COUNT=$(echo "$HTML" | grep -c "<img")
IMG_ALT_COUNT=$(echo "$HTML" | grep -c 'alt="')
IMG_LOADING_COUNT=$(echo "$HTML" | grep -c 'loading="lazy"')
IMG_DIMENSIONS_COUNT=$(echo "$HTML" | grep -oP 'width="\d+"' | wc -l)

echo "   Total images: $IMG_COUNT"
echo "   Images with alt text: $IMG_ALT_COUNT"
echo "   Images with lazy loading: $IMG_LOADING_COUNT"
echo "   Images with dimensions: $IMG_DIMENSIONS_COUNT"

if [ $IMG_COUNT -eq $IMG_ALT_COUNT ]; then
    echo -e "${GREEN}✓${NC} All images have alt text"
else
    MISSING_ALT=$((IMG_COUNT - IMG_ALT_COUNT))
    echo -e "${YELLOW}⚠${NC} $MISSING_ALT images missing alt text"
fi

if [ $IMG_LOADING_COUNT -gt 0 ]; then
    LAZY_PERCENT=$((IMG_LOADING_COUNT * 100 / IMG_COUNT))
    echo -e "${GREEN}✓${NC} ${LAZY_PERCENT}% images use lazy loading"
fi
echo ""

# Summary
echo "=================================="
echo "✅ SEO Performance Test Complete"
echo "=================================="
echo ""
echo "📁 Reports saved to: $REPORT_DIR"
echo ""
echo "Next steps:"
echo "1. Review Lighthouse report for detailed recommendations"
echo "2. Fix any missing alt text or meta tags"
echo "3. Submit sitemaps to Google Search Console"
echo "4. Monitor Core Web Vitals in production"
