# 🚀 Quick Start: Enable Contact Form Emails

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Enable 2-Factor Authentication (if not already)
3. Create new App Password for "Mail"
4. Copy the 16-digit password

### Step 3: Configure Environment
```bash
cd backend
cp .env.example .env
nano .env  # or use any text editor
```

Add these lines:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Your 16-digit app password
EMAIL_TO=contactus@swazdatarecovery.com
```

### Step 4: Start the Server
```bash
npm run dev
```

Look for:
```
✅ Email service initialized: gmail
✅ Database ready
```

### Step 5: Test It!

Open your browser to the contact form and submit a test ticket. You should receive an email within seconds!

---

## 📧 Email You'll Receive

**Subject:** 📋 New Ticket TICK-1 - Customer Name

**Content:**
- Customer contact details
- Device information
- Problem description
- Quick reply button

---

## ⚠️ Troubleshooting

### "Email credentials not configured"
→ Check your `.env` file has EMAIL_USER and EMAIL_PASSWORD

### Gmail says "Less secure app"
→ Use App Password (see Step 2) instead of regular password

### Not receiving emails
→ Check spam folder
→ Verify EMAIL_TO address in `.env`
→ Check server logs for email errors

---

## 🎯 Next Steps

1. **Test emergency mode** - Toggle the emergency checkbox
2. **Test rate limiting** - Try submitting 6 times in 1 hour
3. **Review security** - See `docs/CONTACT_FORM_SETUP.md`
4. **Go production** - Consider SendGrid for higher volume

---

**Ready to receive customer inquiries! 🎉**
