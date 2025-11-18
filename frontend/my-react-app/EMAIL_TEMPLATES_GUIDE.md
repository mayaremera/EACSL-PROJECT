# Email Templates Customization Guide

## Overview

This guide explains how to customize all email templates sent by Supabase for your EACSL website. You can fully customize the design, branding, and content of all authentication emails.

## Emails Sent by the Application

The following emails are sent through Supabase:

1. **Signup Confirmation Email** - Sent when a new user signs up
2. **Password Reset Email** - Sent when a user requests to reset their password or when an admin creates an account
3. **Magic Link Email** - (If used) Sent for passwordless login

## How to Customize Email Templates

### Step 1: Access Email Templates in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. You'll see templates for:
   - Confirm signup
   - Invite user
   - Magic Link
   - Change Email Address
   - Reset Password

### Step 2: Customize Each Template

Each template supports HTML and CSS. You can use:
- Custom HTML structure
- Inline CSS styles
- Supabase template variables (see below)
- Your brand colors and logo

### Step 3: Available Template Variables

Supabase provides these variables you can use in your templates:

- `{{ .ConfirmationURL }}` - The confirmation/reset link URL
- `{{ .Email }}` - The user's email address
- `{{ .Token }}` - The confirmation token (rarely needed)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site's base URL
- `{{ .RedirectTo }}` - The redirect URL after confirmation

### Step 4: Test Your Templates

After saving, test by:
1. Creating a test account
2. Requesting a password reset
3. Checking how emails render in different email clients

## Template Examples

See the `email-templates/` folder for ready-to-use HTML templates that match your EACSL branding.

## Important Notes

- **HTML Email Limitations**: Email clients have limited CSS support. Use inline styles and table-based layouts for best compatibility.
- **Mobile Responsive**: Test on mobile devices as many users read emails on phones.
- **Link Colors**: Make sure links are clearly visible and use your brand color (#4C9A8F).
- **Logo**: Include your EACSL logo in the email header for brand recognition.

## Next Steps

1. Review the example templates in `email-templates/` folder
2. Customize them with your specific content
3. Copy and paste into Supabase Dashboard → Authentication → Email Templates
4. Test by sending test emails
5. Deploy and monitor

