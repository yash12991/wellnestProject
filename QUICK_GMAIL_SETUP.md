# ⚡ Quick Gmail Setup - WellNest Email Service

## 🚀 5-Minute Setup

### 1️⃣ Generate App Password (2 minutes)
```
1. Visit: https://myaccount.google.com/apppasswords
2. Sign in to yash129912@gmail.com
3. Click "Select app" → Mail
4. Click "Select device" → Other → Type "WellNest"
5. Click Generate
6. Copy the 16-character password (e.g., abcd efgh ijkl mnop)
```

### 2️⃣ Update Environment (1 minute)
```bash
cd backend
nano .env
```

Add these two lines:
```bash
GMAIL_USER=yash129912@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```
*Remove spaces from the password!*

### 3️⃣ Test Email (1 minute)
```bash
node test_email.js
```

### 4️⃣ Start Server (1 minute)
```bash
npm start
```

Look for:
```
✅ Gmail email service initialized
📧 Emails will be sent from: yash129912@gmail.com
✅ Gmail server is ready to send emails
```

## ✅ Done!

Your email service is now configured with Gmail.

---

## 📋 Quick Commands

```bash
# Test emails
node test_email.js

# Start server
npm start

# Check if app password is set
echo $GMAIL_APP_PASSWORD

# Test via API
curl http://localhost:5000/debug/test-email
```

## 🔧 Troubleshooting One-Liners

**"Invalid login"** → Enable 2-Step Verification first  
**"Not found"** → App Passwords requires 2-Step Verification  
**"Connection timeout"** → Check internet connection  
**Emails in spam** → Ask recipient to mark as "Not Spam"

## 📚 Full Docs

- Detailed Setup: `GMAIL_APP_PASSWORD_SETUP.md`
- Migration Info: `EMAIL_MIGRATION_GMAIL.md`

## 🎯 What Changed

| Before | After |
|--------|-------|
| Resend API | Gmail SMTP |
| RESEND_API_KEY | GMAIL_APP_PASSWORD |
| onboarding@resend.dev | yash129912@gmail.com |

## ⚠️ Important Notes

- ✅ App password ≠ Your Gmail password
- ✅ Limit: 500 emails/day (free Gmail)
- ✅ Works with all existing code
- ✅ No code changes needed elsewhere

---

**Need help?** Check `GMAIL_APP_PASSWORD_SETUP.md` for detailed instructions.
