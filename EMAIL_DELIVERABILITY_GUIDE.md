# Email Deliverability Guide - Avoiding Spam Folder

## 🎯 Current Issues Fixed

### ✅ Code-Level Improvements Applied:
1. **Added plain text version** - Emails now include both HTML and text versions
2. **Removed excessive emojis from subject lines** - Changed from "🍽️ Your Weekly..." to "Your Weekly..."
3. **Added proper DOCTYPE and HTML structure** - Better spam score
4. **Added reply-to address** - Shows legitimacy
5. **Improved email copy** - More professional, less "spammy" language
6. **Better formatting** - Clean, professional design

## 🚀 Critical Next Steps (MUST DO for Production)

### 1. **Verify Your Own Domain with Resend** ⭐ MOST IMPORTANT
Currently using: `onboarding@resend.dev` (This can trigger spam filters!)

**Action Required:**
1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Add your domain (e.g., `wellnest.com` or `mail.wellnest.com`)
4. Add the DNS records Resend provides to your domain registrar:
   - **SPF Record** (Sender Policy Framework)
   - **DKIM Record** (DomainKeys Identified Mail)
   - **DMARC Record** (Domain-based Message Authentication)

5. Update your code to use your verified domain:
```javascript
from: 'WellNest <noreply@yourdomain.com>'
reply_to: 'support@yourdomain.com'
```

**Why this matters:** 
- Emails from `@resend.dev` are shared with many users = higher spam risk
- Your own verified domain = trusted sender = inbox delivery

### 2. **Set Up SPF, DKIM, and DMARC Records** ⭐ CRITICAL

These authentication protocols tell email providers your emails are legitimate:

#### SPF (Sender Policy Framework)
Verifies that emails are sent from authorized servers.

**DNS Record Example:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

#### DKIM (DomainKeys Identified Mail)
Cryptographic signature that proves email authenticity.

**Resend provides this automatically** when you verify your domain.

#### DMARC (Domain-based Message Authentication)
Tells email providers what to do if authentication fails.

**DNS Record Example:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

### 3. **Warm Up Your Sending Domain** 📈

Don't send 1000s of emails immediately!

**Email Warm-Up Schedule:**
- **Week 1:** 10-20 emails/day
- **Week 2:** 50-100 emails/day
- **Week 3:** 200-500 emails/day
- **Week 4+:** Full volume

**Why:** Email providers flag new domains sending high volumes as spam.

### 4. **Improve Email Content** ✍️

#### ❌ Avoid Spam Trigger Words:
- "Free", "Winner", "Cash", "Prize"
- "Act now", "Limited time", "Urgent"
- Excessive "!!!" or "???"
- ALL CAPS TEXT
- Too many links
- Suspicious attachments

#### ✅ Use Professional Language:
- Clear, concise subject lines
- Proper grammar and spelling
- Balanced text-to-image ratio
- Relevant, valuable content
- Clear unsubscribe option

### 5. **Monitor Your Sender Reputation** 📊

**Check your domain reputation:**
- [Google Postmaster Tools](https://postmaster.google.com/)
- [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/)
- [MXToolbox Blacklist Check](https://mxtoolbox.com/blacklists.aspx)

**Key metrics to track:**
- Delivery rate (should be >95%)
- Open rate (healthcare: 20-25% is good)
- Bounce rate (should be <2%)
- Spam complaint rate (should be <0.1%)

### 6. **Implement Double Opt-In** ✅ ALREADY DONE

Good news! Your OTP verification is essentially double opt-in:
- User registers with email
- User must verify email with OTP
- This proves the email is valid and wanted

### 7. **Add Unsubscribe Link** (For Marketing Emails)

For meal plan emails, add an unsubscribe option:

```html
<div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #6b7280;">
        Don't want to receive meal plan emails? 
        <a href="https://yourdomain.com/unsubscribe?email={{email}}" style="color: #05d8a7;">Unsubscribe</a>
    </p>
</div>
```

### 8. **Use a Dedicated IP Address** (For High Volume)

If sending 50,000+ emails/month:
- Get a dedicated IP from Resend
- Warm up the IP properly
- Better control over sender reputation

## 🧪 Testing Your Emails

### Check Spam Score Before Sending:
1. **Mail Tester** - https://www.mail-tester.com/
   - Send a test email to the provided address
   - Get a spam score out of 10
   - Get specific recommendations

2. **GlockApps** - https://glockapps.com/
   - Test inbox placement across providers
   - See if emails land in Gmail, Outlook, etc.

3. **Litmus Spam Testing** - https://www.litmus.com/
   - Professional spam testing
   - Preview across email clients

## 📋 Quick Checklist

- [ ] Verify your domain with Resend
- [ ] Set up SPF, DKIM, DMARC records
- [ ] Update `from` address to use your domain
- [ ] Add plain text version (✅ Already done!)
- [ ] Remove spam trigger words
- [ ] Test emails with Mail Tester
- [ ] Monitor sender reputation
- [ ] Start with low volume (warm-up)
- [ ] Add unsubscribe link for marketing emails
- [ ] Keep content professional and valuable

## 🎓 Best Practices Summary

### DO:
✅ Use your verified domain
✅ Include plain text version
✅ Write clear, professional subject lines
✅ Personalize emails (use recipient's name)
✅ Include physical address in footer
✅ Make unsubscribe easy
✅ Send consistent volumes
✅ Monitor engagement metrics
✅ Clean your email list regularly

### DON'T:
❌ Use shared domains for production
❌ Buy email lists
❌ Send to unverified addresses
❌ Use deceptive subject lines
❌ Include suspicious links
❌ Send high volumes immediately
❌ Ignore spam complaints
❌ Use all caps or excessive punctuation!!!

## 🔧 Resend-Specific Tips

1. **Use Resend's Analytics**
   - Track opens, clicks, bounces
   - Monitor spam complaints
   - Identify problematic emails

2. **Set Up Webhooks**
```javascript
// Track delivery status
resend.webhooks.listen({
  delivered: (email) => console.log('Delivered:', email),
  bounced: (email) => console.log('Bounced:', email),
  complained: (email) => console.log('Spam complaint:', email)
});
```

3. **Use Tags for Tracking**
```javascript
await resend.emails.send({
  // ... other options
  tags: [
    { name: 'category', value: 'otp' },
    { name: 'environment', value: 'production' }
  ]
});
```

## 📞 Support Resources

- **Resend Docs:** https://resend.com/docs
- **Resend Domain Setup:** https://resend.com/docs/dashboard/domains/introduction
- **Email Authentication Guide:** https://resend.com/docs/dashboard/domains/authentication
- **Deliverability Best Practices:** https://resend.com/blog/email-deliverability-best-practices

## 💰 Cost Consideration

**Resend Pricing:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Enterprise: Custom pricing

**Custom Domain:** 
- Costs: ~$10-15/year for domain registration
- DNS management: Usually free with domain registrar

---

**Next Immediate Action:** 
1. Buy a domain if you don't have one (Google Domains, Namecheap, etc.)
2. Verify it with Resend
3. Update your email config to use the verified domain
4. Your deliverability will improve dramatically! 🚀
