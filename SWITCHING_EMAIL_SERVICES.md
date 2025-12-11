# 🔄 Switching Between Gmail and Resend

## Current Setup: Gmail ✅

Your email service is currently configured to use Gmail. When your Resend account is reactivated, you can easily switch back.

---

## 📝 Two Options to Switch

### Option 1: Use the Flexible Email File (RECOMMENDED)

I've created `email_flexible.js` that can switch between Gmail and Resend with just one environment variable change.

**To use it:**

1. **Replace your current email.js**
```bash
cd /home/yashprashantsonawane/Videos/new/wellnestProject/backend/src/config
mv email.js email_gmail_only.js.backup
mv email_flexible.js email.js
```

2. **Switch between services by changing `.env`**
```bash
# For Gmail (current)
EMAIL_SERVICE=gmail
GMAIL_USER=yash129912@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# For Resend (when reactivated)
EMAIL_SERVICE=resend
RESEND_API_KEY=your_resend_api_key
```

3. **Restart your server**
```bash
npm start
```

That's it! No code changes needed - just change the environment variable.

---

### Option 2: Keep Original Resend Code (Manual)

I've saved the original Resend code for you. When you want to switch back:

**Step 1: Save this as `email_resend.js`**

```javascript
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { generateMealPlanPDF } from '../utils/pdfGenerator.js';

dotenv.config();

let resend = null;
const apiKey = process.env.RESEND_API_KEY;

try {
    if (apiKey) {
        resend = new Resend(apiKey);
        console.log("✅ Resend email service initialized");
        console.log("📧 Emails will be sent from: onboarding@resend.dev");
    } else {
        console.warn("⚠️  RESEND_API_KEY is not set");
    }
} catch (error) {
    console.error("❌ Failed to initialize Resend:", error.message);
}

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email, otp) => {
    try {
        if (!resend) {
            throw new Error("Email service is not configured.");
        }

        const { data, error } = await resend.emails.send({
            from: 'WellNest <onboarding@resend.dev>',
            to: email,
            subject: "Verify Your Email - WellNest OTP Code",
            html: \`... [HTML content from your original file] ...\`
        });

        if (error) throw error;
        console.log("✅ OTP Email sent via Resend:", data.id);
        return true;
    } catch (error) {
        console.error("❌ Failed to send OTP:", error.message);
        return false;
    }
};

// ... other functions follow same pattern
```

**Step 2: When Resend is ready, swap files**
```bash
cd backend/src/config
mv email.js email_gmail.js.backup
cp email_resend.js email.js
```

**Step 3: Update .env**
```bash
RESEND_API_KEY=your_new_resend_api_key
```

---

## 🎯 Recommended Approach: Option 1 (Flexible File)

**Why Option 1 is better:**
- ✅ Switch with just one environment variable
- ✅ No file swapping needed
- ✅ Keep both services configured
- ✅ Easy to test both
- ✅ Quick rollback if needed
- ✅ Same code works for both

**To activate it now:**
```bash
cd /home/yashprashantsonawane/Videos/new/wellnestProject/backend/src/config
cp email.js email_original_backup.js
cp email_flexible.js email.js
```

Then in your `.env`:
```bash
EMAIL_SERVICE=gmail  # Currently using Gmail
GMAIL_APP_PASSWORD=your_password

# When Resend is ready, just change to:
# EMAIL_SERVICE=resend
# RESEND_API_KEY=your_key
```

---

## 📋 Quick Switch Guide

### From Gmail to Resend:

1. Edit `.env`:
```bash
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_actual_key_here
```

2. Restart server:
```bash
npm start
```

3. Look for this log:
```
✅ Resend email service initialized
📧 Emails will be sent from: onboarding@resend.dev
```

### From Resend back to Gmail:

1. Edit `.env`:
```bash
EMAIL_SERVICE=gmail
GMAIL_APP_PASSWORD=your_app_password
```

2. Restart server:
```bash
npm start
```

3. Look for this log:
```
✅ Gmail email service initialized
📧 Emails will be sent from: yash129912@gmail.com
```

---

## 🔍 How It Works

The flexible email file checks the `EMAIL_SERVICE` environment variable:

```javascript
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

if (EMAIL_SERVICE === 'gmail') {
    // Use Nodemailer with Gmail
    emailService = nodemailer.createTransport({...});
} else if (EMAIL_SERVICE === 'resend') {
    // Use Resend
    emailService = new Resend(apiKey);
}
```

All email functions (OTP, meal plans, test) automatically use the configured service.

---

## ✅ What to Do Right Now

**Use the flexible version:**

```bash
cd /home/yashprashantsonawane/Videos/new/wellnestProject/backend/src/config
cp email_flexible.js email.js
```

**Your `.env` should have:**
```bash
EMAIL_SERVICE=gmail
GMAIL_USER=yash129912@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here

# Keep this ready for when Resend is back:
RESEND_API_KEY=your_future_resend_key
```

**When Resend is reactivated:**
1. Add your Resend API key to `.env`
2. Change `EMAIL_SERVICE=gmail` to `EMAIL_SERVICE=resend`
3. Restart server
4. Done! ✅

---

## 💾 Backup of Original Code

Your original Resend code is preserved in the Git repository. You can always retrieve it:

```bash
git log --all --full-history -- backend/src/config/email.js
git show <commit-hash>:backend/src/config/email.js > email_resend_original.js
```

Or I can provide the complete original Resend code if you need it.

---

## 🆘 Need Help?

If you need the complete original Resend code, just ask and I'll create a file with all the original Resend implementations intact.

The flexible version is recommended because it future-proofs your application and makes switching services trivial!
