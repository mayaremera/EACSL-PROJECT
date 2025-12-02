x# Forgot Password - Supabase Email Configuration Setup

This guide will help you configure Supabase to send password reset emails for the "Forgot Password" functionality in the sign-in popup.

## Overview

The forgot password feature allows users to reset their password by:
1. Clicking "Forgot password?" link in the sign-in popup
2. Entering their email address
3. Receiving a password reset email from Supabase
4. Clicking the link in the email to set a new password

## Step 1: Configure Supabase Email Templates

### 1.1 Access Email Templates

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. You'll see several email templates including:
   - **Confirm signup**
   - **Magic Link**
   - **Change Email Address**
   - **Reset Password** ← This is the one we need

### 1.2 Configure Reset Password Email Template

1. Click on **Reset Password** template
2. You can customize the email subject and body
3. The default template includes:
   - Subject: `Reset Your Password`
   - Body: Contains a link with `{{ .ConfirmationURL }}` that redirects to `/set-password`

**Important**: The reset password link in the email will redirect to:
```
{{ .SiteURL }}/set-password
```

This matches the route configured in your application (`/set-password`).

### 1.3 Customize Email Template (Optional)

You can customize the email template to match your brand:

**Subject Example:**
```
Reset Your EACSL Password
```

**Body Example (HTML):**
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link will expire in 1 hour.</p>
```

**Note**: The `{{ .ConfirmationURL }}` variable is required and will be automatically replaced with the reset link.

## Step 2: Configure Site URL and Redirect URLs ⚠️ CRITICAL

**This is the most common issue!** If the email link opens the wrong URL (e.g., production instead of localhost), this is the fix.

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**

2. **Set your Site URL**:
   - For development: `http://localhost:5173` (or your Vite dev server port)
   - For production: `https://yourdomain.com`

3. **Add Redirect URLs** (this is critical!):
   - Click "Add URL" or use the input field
   - Add these URLs one by one:
     - `http://localhost:5173/**` (wildcard for all localhost paths)
     - `http://localhost:5173/set-password` (specific path)
     - `https://yourdomain.com/**` (wildcard for production)
     - `https://yourdomain.com/set-password` (specific production path)
   
   **Note**: You can use wildcards (`**`) to allow all paths under a domain, or specify exact paths.

4. **Save the configuration**

**Why this matters:**
- Supabase will **ONLY** redirect to URLs in this allowed list
- If your redirect URL isn't in the list, Supabase will use the Site URL instead
- This is why clicking the email link might open production instead of localhost

**Quick Check:**
- When you request a password reset, check the browser console
- You'll see: `Redirect URL: http://localhost:5173/set-password`
- Make sure this exact URL (or a wildcard pattern) is in your Supabase Redirect URLs list

## Step 3: Configure Email Provider (Required for Production)

By default, Supabase uses a test email service that has limitations. For production, you should configure a real email provider.

### Option A: Use Supabase's Built-in Email (Free Tier - Limited)

- Works out of the box for testing
- Limited to 3 emails per hour on free tier
- Emails may go to spam folder
- Good for development/testing only

### Option B: Configure Custom SMTP (Recommended for Production)

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Enter your SMTP provider details:
   - **Host**: Your SMTP server (e.g., `smtp.gmail.com`, `smtp.sendgrid.net`)
   - **Port**: Usually `587` for TLS or `465` for SSL
   - **Username**: Your SMTP username/email
   - **Password**: Your SMTP password or app password
   - **Sender email**: The email address that will send the reset emails
   - **Sender name**: Display name (e.g., "EACSL")

**Popular SMTP Providers:**
- **SendGrid**: Free tier (100 emails/day)
- **Mailgun**: Free tier (5,000 emails/month)
- **Amazon SES**: Pay-as-you-go
- **Gmail**: Requires app password (not recommended for production)

### Option C: Use Supabase's Email Service (Paid Plans)

Supabase offers managed email service on paid plans with better deliverability.

## Step 4: Test the Forgot Password Flow

### 4.1 Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the sign-in popup
3. Click "Forgot password?" link
4. Enter a valid email address (must be registered in Supabase)
5. Check your email inbox (and spam folder)
6. Click the reset link in the email
7. You should be redirected to `/set-password` page
8. Set a new password

### 4.2 Verify Email Delivery

- **Development**: Check Supabase Dashboard → **Authentication** → **Users** → Click on user → Check "Email Logs" tab
- **Production**: Check your email inbox and spam folder

## Step 5: Troubleshooting

### ⚠️ Emails Not Sending - Quick Diagnostic Checklist

**First, check the browser console for errors:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try the forgot password flow again
4. Look for any error messages - they will now show detailed information

**Common Issues and Solutions:**

#### 1. **No SMTP Configured (Most Common Issue)**
   - **Symptom**: No error shown, but email never arrives
   - **Solution**: 
     - Go to Supabase Dashboard → **Project Settings** → **Auth** → **SMTP Settings**
     - Enable **Custom SMTP** and configure your email provider
     - OR use Supabase's built-in email (limited to 3/hour on free tier)
   - **Check**: Look in Supabase Dashboard → **Authentication** → **Users** → Click user → **Email Logs** tab

#### 2. **Redirect URL Not Configured**
   - **Symptom**: Error about redirect URL or email sent but link doesn't work
   - **Solution**:
     - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
     - Add to **Redirect URLs**:
       - `http://localhost:5173/set-password` (or your dev port)
       - `https://yourdomain.com/set-password` (production)
   - **Note**: Supabase requires exact match or wildcard patterns

#### 3. **Email Rate Limiting (Free Tier)**
   - **Symptom**: Error message about "too many requests" or "rate limit"
   - **Solution**: 
     - Free tier allows only 3 emails per hour
     - Wait 1 hour or upgrade to paid plan
     - Configure custom SMTP to bypass this limit

#### 4. **User Doesn't Exist**
   - **Symptom**: Error about "user not found" or "no account"
   - **Solution**:
     - The email must be registered in Supabase Authentication
     - Check: Supabase Dashboard → **Authentication** → **Users**
     - User must exist before password reset can work

#### 5. **Email in Spam Folder**
   - **Symptom**: No error, but email not in inbox
   - **Solution**:
     - Check spam/junk folder
     - Check Supabase email logs (Dashboard → Users → Email Logs)
     - Configure custom SMTP for better deliverability

#### 6. **Email Template Missing ConfirmationURL**
   - **Symptom**: Email sent but link is broken
   - **Solution**:
     - Go to **Authentication** → **Email Templates** → **Reset Password**
     - Ensure template contains `{{ .ConfirmationURL }}` variable
     - This is required for the reset link to work

### How to Check Email Logs in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Find the user by email address
4. Click on the user
5. Go to **Email Logs** tab
6. You'll see:
   - Whether email was sent
   - Any delivery errors
   - Email content preview

### Reset Link Not Working

1. **Check Redirect URL**: Ensure `/set-password` is in allowed redirect URLs
2. **Check Route**: Verify `/set-password` route exists in your app (it should - it's already configured)
3. **Link Expired**: Reset links expire after 1 hour by default
4. **Check Browser Console**: Look for any JavaScript errors
5. **Check URL Format**: The link should be: `https://yourdomain.com/set-password#access_token=...`

### Debugging Steps

1. **Open Browser Console** (F12 → Console tab)
2. **Try forgot password** - you'll now see detailed logs:
   - `Sending password reset email to: [email]`
   - `Redirect URL: [url]`
   - `Password reset email sent successfully` (if successful)
   - Or error details if it fails
3. **Check Supabase Dashboard**:
   - Authentication → Users → [User] → Email Logs
   - Look for the password reset email attempt
4. **Verify Configuration**:
   - Authentication → URL Configuration (redirect URLs)
   - Project Settings → Auth → SMTP Settings
   - Authentication → Email Templates → Reset Password

## Step 6: Security Considerations

1. **Rate Limiting**: Supabase automatically rate-limits password reset requests
2. **Link Expiration**: Reset links expire after 1 hour (configurable in Supabase)
3. **Email Verification**: Users should verify their email before using forgot password
4. **HTTPS**: Always use HTTPS in production for secure password reset

## Code Implementation

The forgot password functionality is already implemented in:

- **Component**: `src/components/auth/AuthModal.jsx`
  - "Forgot password?" link in sign-in form
  - Forgot password form with email input
  - Uses `resetPassword` method from AuthContext

- **Context**: `src/contexts/AuthContext.jsx`
  - `resetPassword` method that calls `supabase.auth.resetPasswordForEmail`
  - Redirects to `/set-password` route

- **Page**: `src/pages/SetPasswordPage.jsx`
  - Handles password reset when user clicks email link
  - Allows user to set new password

- **Route**: `src/routes/AppRouter.jsx`
  - `/set-password` route is already configured

## Summary

✅ **What's Already Done:**
- Forgot password UI in sign-in popup
- Password reset email functionality
- Password reset page (`/set-password`)
- Route configuration

🔧 **What You Need to Do:**
1. Configure Supabase email templates (optional customization)
2. Add redirect URLs in Supabase Dashboard
3. Configure SMTP provider for production (recommended)
4. Test the forgot password flow

## Additional Resources

- [Supabase Auth Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/auth-redirect-urls)

