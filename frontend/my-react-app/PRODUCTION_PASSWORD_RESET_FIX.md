# Fix: Password Reset Email Not Sending in Production

## Quick Fix for Your Deployed Site

Your production URL is: `https://splendid-pixie-7510ac.netlify.app`

### Step 1: Add Production Redirect URL to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. In the **Redirect URLs** section, add:
   ```
   https://splendid-pixie-7510ac.netlify.app/**
   https://splendid-pixie-7510ac.netlify.app/set-password
   ```
5. **Save** the configuration

### Step 2: Update Site URL (Optional but Recommended)

1. In the same **URL Configuration** page
2. Set **Site URL** to: `https://splendid-pixie-7510ac.netlify.app`
3. **Save**

### Step 3: Configure SMTP for Production (Required)

Supabase's free tier email service has limitations (3 emails/hour). For production, you need to configure SMTP:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Configure your email provider:
   - **SendGrid** (Recommended - Free tier: 100 emails/day)
   - **Mailgun** (Free tier: 5,000 emails/month)
   - **Amazon SES** (Pay-as-you-go)
   - **Gmail** (Not recommended for production)

**SendGrid Setup Example:**
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: Your SendGrid API key
- Sender email: `noreply@yourdomain.com`
- Sender name: `EACSL`

### Step 4: Test

1. Go to your production site: https://splendid-pixie-7510ac.netlify.app
2. Click "Sign In" → "Forgot password?"
3. Enter your email
4. Check your inbox (and spam folder)
5. If you see an error in the browser console, check the error message

## Common Issues

### Issue 1: "Email sent" but no email arrives
- **Cause**: Redirect URL not in allowed list OR SMTP not configured
- **Fix**: Add redirect URL (Step 1) and configure SMTP (Step 3)

### Issue 2: Error in console about redirect URL
- **Cause**: Production URL not added to Supabase redirect URLs
- **Fix**: Complete Step 1 above

### Issue 3: Rate limit error
- **Cause**: Using Supabase free tier (3 emails/hour limit)
- **Fix**: Configure custom SMTP (Step 3)

### Issue 4: Email goes to spam
- **Cause**: Using Supabase default email service
- **Fix**: Configure custom SMTP with a proper domain (Step 3)

## Verify Configuration

After making changes, verify:

1. **Check Redirect URLs**:
   - Supabase Dashboard → Authentication → URL Configuration
   - Should see: `https://splendid-pixie-7510ac.netlify.app/**`

2. **Check SMTP**:
   - Project Settings → Auth → SMTP Settings
   - Should show "Custom SMTP" as enabled

3. **Test Email**:
   - Request password reset
   - Check browser console for errors
   - Check email inbox (and spam)

## Still Not Working?

1. **Check Supabase Email Logs**:
   - Authentication → Users → Find your user → Email Logs
   - See if email was sent and any error messages

2. **Check Browser Console**:
   - Open DevTools (F12) → Console
   - Look for error messages when requesting password reset

3. **Verify User Exists**:
   - User must be registered in Supabase before password reset works
   - Check: Authentication → Users

4. **Check Email Template**:
   - Authentication → Email Templates → Reset Password
   - Should contain `{{ .ConfirmationURL }}` in the body

