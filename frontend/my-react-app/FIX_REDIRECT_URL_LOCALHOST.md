# Quick Fix: Email Link Opens Production Instead of Localhost

## Problem
When you click the password reset link in the email, it opens your production website instead of `localhost:5173/set-password`.

## Solution: Add Localhost to Supabase Redirect URLs

### Step 1: Open Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**

### Step 2: Add Localhost Redirect URLs
In the **Redirect URLs** section, add these URLs:

```
http://localhost:5173/**
http://localhost:5173/set-password
```

**Or if your dev server uses a different port:**
```
http://localhost:3000/**
http://localhost:3000/set-password
```

**Using wildcards (`**`):**
- `http://localhost:5173/**` allows ALL paths under localhost:5173
- This is the easiest option - one entry covers everything

**Using specific paths:**
- `http://localhost:5173/set-password` only allows the exact path
- You'll need to add each path separately

### Step 3: Save
Click **Save** or the save button in the Supabase Dashboard

### Step 4: Test
1. Request a new password reset email
2. Check the browser console - you should see:
   ```
   Redirect URL: http://localhost:5173/set-password
   ```
3. Click the link in the email
4. It should now open `localhost:5173/set-password` instead of production

## Why This Happens

Supabase has a security feature that only allows redirects to URLs in an approved list. If your redirect URL isn't in the list, Supabase falls back to the "Site URL" which is usually set to your production domain.

## Verify It's Working

1. **Check Console Logs:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Request password reset
   - Look for: `Redirect URL: http://localhost:5173/set-password`

2. **Check Email Link:**
   - The link in the email should look like:
   - `https://[your-project].supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=http://localhost:5173/set-password`
   - Notice the `redirect_to` parameter should be your localhost URL

3. **Test the Flow:**
   - Click the email link
   - Should open `http://localhost:5173/set-password`
   - Should show "Set Your Password" form
   - Should allow you to set a new password

## Still Not Working?

1. **Clear browser cache** - Old redirect URLs might be cached
2. **Request a new email** - Old emails have the old redirect URL baked in
3. **Check the exact port** - Make sure you're using the correct port (check your `npm run dev` output)
4. **Check for typos** - The redirect URL must match exactly (including `http://` not `https://` for localhost)

## For Production

When deploying to production, also add your production URLs:
```
https://yourdomain.com/**
https://yourdomain.com/set-password
```

This ensures password reset works in both development and production environments.

