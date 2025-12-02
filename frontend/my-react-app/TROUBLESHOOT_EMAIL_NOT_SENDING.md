# Quick Troubleshooting: Email Not Sending

If the forgot password email isn't being sent, follow these steps:

## Step 1: Check Browser Console

1. Open your browser DevTools (Press F12)
2. Go to the **Console** tab
3. Try the forgot password flow again
4. Look for these messages:
   - ✅ `Sending password reset email to: [email]` - Request started
   - ✅ `Password reset email sent successfully` - Supabase accepted the request
   - ❌ Any error messages - These will tell you what's wrong

## Step 2: Check Supabase Email Logs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Find the user by email address
5. Click on the user
6. Go to **Email Logs** tab
7. Look for the password reset email attempt

**What to look for:**
- ✅ Email shows as "Sent" - Email was sent (check spam folder)
- ❌ Email shows error - Check the error message
- ⚠️ No email log entry - Request might not have reached Supabase

## Step 3: Verify Supabase Configuration

### 3.1 Check Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Verify these URLs are in **Redirect URLs**:
   - `http://localhost:5173/set-password` (or your dev port)
   - `https://yourdomain.com/set-password` (production)
3. If missing, add them and save

### 3.2 Check SMTP Configuration

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Check if **Custom SMTP** is enabled
3. If not enabled:
   - **For Testing**: Use Supabase's built-in email (limited to 3/hour)
   - **For Production**: Enable Custom SMTP and configure your email provider

### 3.3 Check Email Template

1. Go to **Authentication** → **Email Templates**
2. Click on **Reset Password** template
3. Verify it contains `{{ .ConfirmationURL }}` in the body
4. This variable is required for the reset link to work

## Step 4: Common Issues & Solutions

### Issue: "No error, but email never arrives"

**Most Likely Cause**: No SMTP configured or email in spam

**Solutions**:
1. Check spam/junk folder
2. Configure SMTP in Supabase (Project Settings → Auth → SMTP Settings)
3. Check email logs in Supabase Dashboard

### Issue: "Rate limit" or "Too many requests" error

**Cause**: Free tier limit (3 emails/hour)

**Solutions**:
1. Wait 1 hour before trying again
2. Configure custom SMTP to bypass limit
3. Upgrade to paid plan

### Issue: "User not found" error

**Cause**: Email not registered in Supabase

**Solutions**:
1. Verify user exists: Authentication → Users
2. User must sign up first before password reset works
3. Check if email is correct (typos)

### Issue: "Redirect URL not allowed" error

**Cause**: Redirect URL not in allowed list

**Solutions**:
1. Go to Authentication → URL Configuration
2. Add your redirect URL to the list
3. Format: `http://localhost:5173/set-password` or `https://yourdomain.com/set-password`

## Step 5: Test with Console Logging

The code now includes detailed console logging. When you try forgot password:

1. Open Console (F12)
2. You should see:
   ```
   Sending password reset email to: user@example.com
   Redirect URL: http://localhost:5173/set-password
   Password reset email sent successfully
   ```

3. If you see an error instead, it will show the exact problem

## Step 6: Verify User Exists

1. Go to Supabase Dashboard → Authentication → Users
2. Search for the email address
3. If user doesn't exist:
   - They need to sign up first
   - Or create user manually in dashboard

## Still Not Working?

1. **Check Supabase Status**: [status.supabase.com](https://status.supabase.com)
2. **Check Network Tab**: DevTools → Network → Look for failed requests
3. **Try Different Email**: Test with a known working email
4. **Check Supabase Logs**: Dashboard → Logs → API Logs

## Quick Fix Checklist

- [ ] Browser console shows no errors
- [ ] Redirect URL is in Supabase allowed list
- [ ] SMTP is configured (or using built-in email)
- [ ] User exists in Supabase Authentication
- [ ] Email template has `{{ .ConfirmationURL }}`
- [ ] Checked spam folder
- [ ] Checked Supabase email logs
- [ ] Not hitting rate limit (3/hour on free tier)

