# Quick Setup Guide - Email Templates

## Step-by-Step Instructions

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your EACSL project
3. Navigate to **Authentication** → **Email Templates**

### 2. Customize Each Template

For each template below, follow these steps:
1. Click on the template name in the left sidebar
2. Delete the existing template content
3. Copy the entire HTML from the corresponding file in this folder
4. Paste it into the template editor
5. Click **Save**

### 3. Template Mapping

| Template File | Supabase Template Name | When It's Sent |
|--------------|----------------------|----------------|
| `signup-confirmation.html` | **Confirm signup** | When a new user signs up |
| `password-reset.html` | **Reset Password** | When user requests password reset or admin creates account |
| `invite-user.html` | **Invite user** | When admin invites a user (if used) |
| `magic-link.html` | **Magic Link** | When using passwordless login (if enabled) |
| `change-email.html` | **Change Email Address** | When user changes their email |

### 4. Testing

After saving each template:
1. **Test Signup Email**: Create a test account and check the confirmation email
2. **Test Password Reset**: Use "Forgot Password" and check the reset email
3. **Check Mobile**: Open emails on mobile devices to ensure they look good
4. **Check Different Email Clients**: Test in Gmail, Outlook, Apple Mail, etc.

### 5. Customization Tips

- **Logo**: Replace the text "EACSL" in the header with an `<img>` tag pointing to your logo URL
- **Colors**: The primary color `#4C9A8F` (teal) can be changed to match your exact brand color
- **Content**: Edit the text content to match your organization's tone and style
- **Links**: All `{{ .ConfirmationURL }}` variables are automatically replaced by Supabase

### 6. Important Notes

- ✅ **Always keep** the `{{ .ConfirmationURL }}` variable - this is required for the links to work
- ✅ **Test thoroughly** before deploying to production
- ✅ **Use inline CSS** - email clients don't support external stylesheets
- ✅ **Keep it simple** - complex layouts may break in some email clients

### 7. Need Help?

- Check the main guide: `EMAIL_TEMPLATES_GUIDE.md`
- Supabase Docs: [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- Test your HTML: Use [Email on Acid](https://www.emailonacid.com/) or [Litmus](https://www.litmus.com/)

---

**Ready to go!** Once you've pasted all templates, your emails will have a professional, branded design that matches your EACSL website.

