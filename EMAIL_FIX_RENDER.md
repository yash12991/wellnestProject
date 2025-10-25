# Email System Fix for Render Deployment

## Problem
Email system showing "Failed to send email" on Render deployment.

## Root Causes

### 1. **Missing or Incorrect Environment Variables**
   - `EMAIL_USER` and `EMAIL_PASS` not set in Render dashboard
   - Using regular Gmail password instead of App Password

### 2. **Gmail Security Restrictions**
   - Gmail blocks "Less Secure Apps"
   - Two-factor authentication required for App Passwords
   - App Password needed instead of regular password

### 3. **Network Configuration Issues**
   - Missing explicit port configuration
   - TLS/SSL settings not optimized for cloud deployment

## ✅ Solution Steps

### Step 1: Create Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - OR: Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" as app and "Other" as device
   - Name it "WellNest Render"
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Configure Environment Variables in Render

1. Go to your Render Dashboard
2. Select your backend service
3. Navigate to "Environment" tab
4. Add/Update these variables:

```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password (without spaces)
```

**Important:** 
- Use the App Password, NOT your regular Gmail password
- Remove all spaces from the App Password
- Example: `abcdwxyzabcdwxyz`

### Step 3: Verify Configuration

After setting environment variables:
1. Redeploy your service on Render
2. Check logs for: `✅ Email server is ready to send messages`
3. If you see `❌ Email transporter configuration error`, check your credentials

### Step 4: Test Email Functionality

Monitor your Render logs when an email is sent. You should see:
```
✅ Email server is ready to send messages
📧 Attempting to send OTP email to: user@example.com
✅ OTP Email sent successfully: <message-id>
```

## Common Error Messages & Solutions

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Cause:** Using regular password instead of App Password
**Solution:** Generate and use Gmail App Password (Step 1)

### Error: "EAUTH - Authentication failed"
**Cause:** Incorrect credentials or App Password not set
**Solution:** Double-check EMAIL_USER and EMAIL_PASS in Render dashboard

### Error: "ECONNECTION - Connection timeout"
**Cause:** Network/firewall issues
**Solution:** 
- Ensure port 587 is accessible
- Check Render's network status
- The updated code includes `rejectUnauthorized: false` to handle SSL issues

### Error: "Missing credentials"
**Cause:** Environment variables not set
**Solution:** Add EMAIL_USER and EMAIL_PASS in Render dashboard

## Code Changes Made

### Enhanced Transporter Configuration
- Added explicit SMTP host and port
- Configured TLS settings for cloud deployment
- Enabled debug logging
- Added transporter verification on startup

### Improved Error Handling
- Detailed error logging with error codes
- Environment variable validation
- Helpful error messages with solutions
- Specific handling for authentication and connection errors

## Alternative: Using SendGrid (If Gmail Issues Persist)

If Gmail continues to have issues, consider using SendGrid:

1. **Sign up for SendGrid**: https://sendgrid.com/ (Free tier: 100 emails/day)

2. **Get API Key**: SendGrid Dashboard → Settings → API Keys

3. **Update email.js**:
```javascript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
    },
});
```

4. **Update Environment Variables in Render**:
```
EMAIL_USER=your-verified-sender@yourdomain.com
SENDGRID_API_KEY=your-sendgrid-api-key
```

## Testing Locally

Before deploying to Render, test locally:

1. Create `.env` file in backend directory:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

2. Run your backend server
3. Test email functionality
4. Check console for success/error messages

## Checklist

- [ ] Two-factor authentication enabled on Gmail
- [ ] App Password generated
- [ ] EMAIL_USER set in Render (your Gmail address)
- [ ] EMAIL_PASS set in Render (16-char App Password, no spaces)
- [ ] Service redeployed on Render
- [ ] Logs checked for "✅ Email server is ready"
- [ ] Test email sent successfully

## Need More Help?

Check Render logs in real-time:
```bash
# In Render dashboard → Logs tab
# Or use Render CLI
render logs -s your-service-name --tail
```

Look for these indicators:
- ✅ Success: "Email server is ready to send messages"
- ❌ Problem: "Email transporter configuration error"
- 📧 Activity: "Attempting to send OTP email"

## Support Resources

- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Render Docs: https://render.com/docs/environment-variables
- Nodemailer Gmail Setup: https://nodemailer.com/usage/using-gmail/
