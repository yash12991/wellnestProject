# Gmail App Password Setup Guide for WellNest

Your Resend account is temporarily suspended, so we've switched to Gmail with an app password for all email services.

## Quick Setup Steps

### 1. Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** section
3. Enable **2-Step Verification** if not already enabled:
   - Click on "2-Step Verification"
   - Follow the setup wizard
4. Once 2-Step Verification is enabled, go back to Security
5. Scroll down to "How you sign in to Google"
6. Click on **App passwords**
7. You may need to sign in again
8. Select app: Choose "Mail"
9. Select device: Choose "Other (Custom name)" and enter "WellNest"
10. Click **Generate**
11. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

### 2. Update Your Environment Variables

Add or update these variables in your `.env` file:

```bash
# Gmail Configuration
GMAIL_USER=yash129912@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password_here
```

**Important:** Remove any spaces from the app password when pasting it.

### 3. Remove Old Resend Configuration (Optional)

You can remove or comment out the old Resend API key:

```bash
# RESEND_API_KEY=re_xxxxx  # No longer needed
```

## What Changed

### Email Configuration File Updated
✅ `backend/src/config/email.js` now uses Nodemailer with Gmail instead of Resend

### All Email Functions Updated:
- ✅ **sendOTPEmail()** - Sends verification codes
- ✅ **sendMealPlanEmail()** - Sends meal plans with PDF attachments
- ✅ **sendTestMail()** - Test email function

### Email Features:
- Sends from: `yash129912@gmail.com`
- Supports HTML emails with beautiful templates
- Supports PDF attachments for meal plans
- Full error handling and logging

## Testing Your Email Setup

### Option 1: Use the Debug Route

```bash
curl http://localhost:5000/debug/test-email
```

### Option 2: Test from Node.js

```javascript
import { sendTestMail } from './src/config/email.js';
await sendTestMail();
```

### Option 3: Register a New User
The OTP email will be sent automatically during registration.

## Email Sending Limits

Gmail has sending limits for app passwords:
- **500 emails per day** for regular Gmail accounts
- **2000 emails per day** for Google Workspace accounts

This should be sufficient for most applications. If you need higher limits, consider:
- Using Google Workspace
- Upgrading to a dedicated email service
- Using multiple Gmail accounts with load balancing

## Troubleshooting

### Error: "Invalid login"
- ✅ Make sure 2-Step Verification is enabled
- ✅ Make sure you copied the app password correctly (no spaces)
- ✅ Use the app password, not your regular Gmail password

### Error: "Less secure app access"
- Gmail app passwords work even with this disabled
- Make sure you're using 2-Step Verification + App Password method

### Emails going to spam
- Ask recipients to mark your emails as "Not Spam"
- Add a proper email signature
- Consider using a custom domain with Google Workspace

### Error: "Daily sending quota exceeded"
- You've hit Gmail's 500/day limit
- Wait 24 hours or use Google Workspace for higher limits

## Production Recommendations

For production use, consider:

1. **Google Workspace Email** ($6/user/month)
   - Higher sending limits (2000/day)
   - Professional email address
   - Better deliverability

2. **Custom Domain Email**
   - Use your own domain (e.g., noreply@wellnest.com)
   - Better branding and trust

3. **Dedicated Email Service**
   - When Resend is available again
   - Or services like SendGrid, Mailgun, AWS SES

## Need Help?

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify your `.env` file has the correct values
3. Test with the debug route first
4. Make sure your Gmail account has 2-Step Verification enabled

## Current Configuration

```
Email Service: Gmail (Nodemailer)
Sender: yash129912@gmail.com
Methods: OTP, Meal Plans, Test Emails
Status: ✅ Configured and Ready
```

---

**Note:** Keep your app password secure! Don't commit it to Git. It's already added to `.gitignore` via the `.env` file.
