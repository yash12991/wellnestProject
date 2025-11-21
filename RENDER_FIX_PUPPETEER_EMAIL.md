# Render Deployment Fix for Email & PDF

## 🔴 Issues on Render:

1. **Puppeteer Chrome not installed** → PDF generation fails
2. **Gmail SMTP timeout** → Emails not sending

## ✅ Solutions Applied:

### 1. Fixed Puppeteer for Render

Created `render.yaml` with build command to install Chrome:
```yaml
buildCommand: npm install && npx puppeteer browsers install chrome
```

### 2. Fixed Gmail SMTP Timeout

Added connection timeouts to email config:
```javascript
connectionTimeout: 10000,
greetingTimeout: 10000,
socketTimeout: 10000
```

## 🚀 Deploy to Render:

### Option A: Use render.yaml (Recommended)

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix Render deployment: Puppeteer + SMTP"
   git push
   ```

2. In Render Dashboard:
   - Go to your service
   - Settings → Build & Deploy
   - **Build Command**: 
     ```
     npm install && npx puppeteer browsers install chrome
     ```
   - Save and redeploy

### Option B: Manual Configuration

In Render Dashboard → Environment Variables, add:

```bash
# Email (Gmail SMTP)
EMAIL_USER=yash129912@gmail.com
EMAIL_PASS=egpx jqvo tchr ulmy

# APIs
GEMINI_API_KEY=AIzaSyA7jWKZRTTkDOelzlWUMwGnVtJAxEiv9qI
GOOGLE_API_KEY=AIzaSyA7jWKZRTTkDOelzlWUMwGnVtJAxEiv9qI

# Database
MONGODB_URI=mongodb+srv://Rounak:Xl6ToMkAryiNlN3k@cluster0.4bp7jtu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=test

# JWT
JWT_SECRET=chetan123
ACCESS_TOKEN_SECRET=chetan_access_token_secret_123
REFRESH_TOKEN_SECRET=chetan_refresh_token_secret_123
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d
JWT_EXPIRE=30d

# App Config
NODE_ENV=production
PORT=5000

# Puppeteer (for PDF generation)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/opt/render/.cache/puppeteer/chrome/linux-141.0.7390.122/chrome-linux64/chrome
```

Then set **Build Command**:
```
npm install && npx puppeteer browsers install chrome
```

## ⚠️ Gmail SMTP on Render - Important Notes:

### Issue: Gmail May Still Block Render IPs

If emails still timeout on Render:

**Option 1: Use Google Workspace** ($6/month)
- More reliable for production
- Less likely to be blocked

**Option 2: Switch to SendGrid** (Recommended for Render)
- Free tier: 100 emails/day
- Works perfectly on Render
- Better deliverability

**Option 3: Use Resend** (Your original choice)
- Free tier: 100 emails/day
- No domain needed with `onboarding@resend.dev`
- Works great on Render

### To Switch Back to Resend:

I can revert the email config to use Resend if Gmail doesn't work on Render. Resend is actually **more reliable on cloud platforms** like Render.

## 📊 What to Check After Deploy:

1. **Logs should show**:
   ```
   ✅ Gmail SMTP service initialized
   📧 Emails will be sent from: yash129912@gmail.com
   ```

2. **PDF generation**:
   ```
   Generated PDF for USERNAME, size: XXXXX bytes
   ```
   (Not "Using fallback document generation...")

3. **Email sending**:
   ```
   ✅ OTP Email sent successfully: <message-id>
   ```
   (Not "❌ Email transporter configuration error")

## 🔄 If Gmail Still Fails on Render:

Gmail often blocks cloud server IPs. If you get timeouts:

### Quick Fix: Switch to Resend
```bash
# Let me know and I'll revert email.js to use Resend
# It's more reliable for Render deployment
```

Or use SendGrid:
```bash
npm install @sendgrid/mail
```

## 💡 Recommendation:

For production on Render, I recommend:
1. **Resend** - Best balance of free tier + reliability
2. **SendGrid** - More established, great deliverability
3. **Gmail** - Works but may have issues on cloud IPs

Would you like me to switch back to Resend for better Render compatibility?
