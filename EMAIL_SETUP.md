# Email Notification Setup

This system sends automatic email notifications to participants when they check in or check out.

## Email Service Configuration

The system uses **Resend** for sending emails. Follow these steps to set it up:

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Navigate to the **API Keys** section in your Resend dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "KNS Training System")
4. Copy the API key (you'll only see it once!)

### 3. Add Domain (Optional but Recommended)

For production use, you should add and verify your domain:
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Follow the DNS verification steps
4. Once verified, you can use emails like `noreply@yourdomain.com`

### 4. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Resend API Key (required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email sender address (optional, defaults to KNS Training <noreply@kns.sl>)
EMAIL_FROM=KNS Training <noreply@yourdomain.com>
```

### 5. Test the Setup

1. Check in a participant
2. Check their email inbox (and spam folder)
3. You should receive a check-in confirmation email

## Email Templates

### Check-In Email
- **Subject:** "Check-In Confirmation - KNS Training"
- **Message:** "Thank you, [Name]! Have a wonderful session!"

### Check-Out Email
- **Subject:** "Check-Out Confirmation - KNS Training"
- **Message:** "Check-out successfully, [Name]! See you for tomorrow's session."

## Troubleshooting

### Emails Not Sending

1. **Check API Key:** Make sure `RESEND_API_KEY` is set correctly in your `.env.local`
2. **Check Logs:** Look for email-related errors in your server logs
3. **Resend Dashboard:** Check the Resend dashboard for delivery status and errors
4. **Domain Verification:** If using a custom domain, ensure it's verified

### Email Service Not Configured

If `RESEND_API_KEY` is not set, the system will:
- Continue to function normally (check-in/out will still work)
- Log a warning message
- Skip sending emails (no errors thrown)

This ensures the system works even if email is not configured.

## Alternative Email Services

If you prefer to use a different email service (SendGrid, AWS SES, etc.), you can modify the `lib/email.ts` file to use your preferred service's API.

