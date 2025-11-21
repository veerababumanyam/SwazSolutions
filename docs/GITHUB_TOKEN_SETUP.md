# Camera Updates AI Scraper - Quick Setup

## 🚀 Get GitHub Token (Free - Takes 2 minutes)

### Option 1: Automated Script
```bash
chmod +x setup_github_token.sh
./setup_github_token.sh
```

### Option 2: Manual Setup

1. **Get Token**:
   - Visit: https://github.com/settings/tokens
   - Click **"Generate new token (classic)"**
   - Name: `Camera Updates Scraper`
   - **Scopes**: Leave ALL unchecked (no permissions needed)
   - Click **"Generate token"**
   - Copy token (starts with `ghp_`)

2. **Add to .env**:
   ```bash
   # Open .env file
   nano .env
   
   # Add this line:
   GITHUB_TOKEN=ghp_your_token_here
   
   # Save: Ctrl+X, Y, Enter
   ```

3. **Install & Start**:
   ```bash
   cd backend
   rm package-lock.json
   npm install
   npm start
   ```

## ✅ Verification

Server logs should show:
```
🔍 Searching for Canon updates...
Found 15 Canon URLs to check
✅ Canon: 3 updates extracted
```

## 🔧 Troubleshooting

**"GITHUB_TOKEN not set"**
- Token missing from `.env`
- Check spelling: `GITHUB_TOKEN=` (all caps)
- No spaces around `=`
- Token should start with `ghp_`

**"0 updates found"**
- This is normal! The scraper is working
- No NEW updates found (existing data preserved)
- Check database: `curl http://localhost:3000/api/camera-updates`

**DuckDuckGo search blocked**
- Rate limited (wait 5 minutes)
- Use VPN if needed
- System will preserve existing data automatically

## 📊 How It Works

1. **Search Phase**: Uses DuckDuckGo to find latest camera update pages
2. **Scrape Phase**: Fetches HTML from discovered URLs
3. **AI Phase**: GitHub Models extracts structured data
4. **Store Phase**: Saves to SQLite with deduplication

## 🎯 Without GitHub Token

System will:
- ✅ Search for URLs (works)
- ✅ Scrape HTML (works)
- ❌ AI extraction (skipped)
- ✅ Preserve existing database (works)

Result: **Existing updates remain active, no data loss**

## 💡 Free Tier Limits

GitHub Models free tier:
- ✅ 15 requests per minute
- ✅ 100K tokens per request
- ✅ Unlimited daily usage
- ✅ No credit card required

Perfect for daily camera update scraping!

---

**Quick Link**: https://github.com/settings/tokens
