# Production Deployment Guide - Hostinger

This guide covers all the steps needed to deploy your EACSL React application to production on Hostinger.

## Pre-Deployment Checklist

### ✅ 1. Environment Variables Setup

**IMPORTANT**: Never commit your actual `.env` file to Git. It's already in `.gitignore`.

1. **Create `.env` file** in the project root:
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your production values**:
   ```env
   VITE_SUPABASE_URL=https://jwhvfugznhwtpfurdkxm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aHZmdWd6bmh3dHBmdXJka3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzE4OTAsImV4cCI6MjA3ODcwNzg5MH0.Hz79ipl3g-hPPYkEIqZGKQNDQxCvKCR8Ctg94dXfT-s
   VITE_SITE_URL=https://yourdomain.com
   ```

3. **Verify environment variables are loaded**:
   - The app will use these values during build
   - Check that `src/lib/supabase.js` uses `import.meta.env.VITE_SUPABASE_URL`

### ✅ 2. Update Supabase Settings

1. **Update Site URL in Supabase Dashboard**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Navigate to **Authentication** → **URL Configuration**
   - Set **Site URL** to your production domain: `https://yourdomain.com`
   - Add **Redirect URLs**: 
     - `https://yourdomain.com/**`
     - `https://yourdomain.com/auth/callback`

2. **Update Email Templates** (if needed):
   - Go to **Authentication** → **Email Templates**
   - Update `{{ .SiteURL }}` references to use your production domain
   - Test email links point to production URLs

### ✅ 3. Build the Application

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Create production build**:
   ```bash
   npm run build
   ```

3. **Verify build output**:
   - Check that `dist/` folder is created
   - Verify all assets are included
   - Test the build locally: `npm run preview`

### ✅ 4. Hostinger Deployment Steps

#### Option A: Using File Manager (Recommended for beginners)

1. **Access Hostinger File Manager**:
   - Log in to Hostinger hPanel
   - Navigate to **File Manager**

2. **Upload files**:
   - Navigate to `public_html` (or your domain's root folder)
   - Upload **all contents** of the `dist/` folder
   - **Important**: Upload the contents, not the `dist` folder itself
   - Structure should be:
     ```
     public_html/
       ├── index.html
       ├── assets/
       │   ├── index-xxxxx.js
       │   ├── index-xxxxx.css
       │   └── ...
       └── vite.svg
     ```

3. **Set up .htaccess for SPA routing**:
   - Create or edit `.htaccess` in `public_html/`
   - Add this content:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     
     # Enable compression
     <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
     </IfModule>
     
     # Browser caching
     <IfModule mod_expires.c>
       ExpiresActive On
       ExpiresByType image/jpg "access plus 1 year"
       ExpiresByType image/jpeg "access plus 1 year"
       ExpiresByType image/gif "access plus 1 year"
       ExpiresByType image/png "access plus 1 year"
       ExpiresByType image/svg+xml "access plus 1 year"
       ExpiresByType text/css "access plus 1 month"
       ExpiresByType application/javascript "access plus 1 month"
     </IfModule>
     ```

#### Option B: Using FTP/SFTP

1. **Connect via FTP client** (FileZilla, WinSCP, etc.):
   - Host: `ftp.yourdomain.com` or your server IP
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Upload files**:
   - Navigate to `public_html/` directory
   - Upload all contents from `dist/` folder
   - Ensure file permissions are correct (644 for files, 755 for directories)

3. **Create .htaccess** (same as Option A)

#### Option C: Using Git (Advanced)

If you have SSH access and Git installed on Hostinger:

1. **SSH into your server**:
   ```bash
   ssh username@yourdomain.com
   ```

2. **Clone and build on server**:
   ```bash
   cd ~/domains/yourdomain.com/public_html
   git clone your-repo-url .
   npm install
   npm run build
   ```

3. **Set up .htaccess** (same as Option A)

### ✅ 5. Post-Deployment Verification

1. **Test the website**:
   - Visit `https://yourdomain.com`
   - Check all pages load correctly
   - Test navigation and routing
   - Verify images and assets load

2. **Test authentication**:
   - Try logging in
   - Test signup flow
   - Verify email links work
   - Check password reset functionality

3. **Test forms**:
   - Contact form submission
   - Membership application
   - Event registration
   - Reservation booking

4. **Check browser console**:
   - Open DevTools (F12)
   - Look for any errors
   - Verify API calls are working
   - Check network requests

5. **Test on mobile devices**:
   - Verify responsive design
   - Test touch interactions
   - Check mobile navigation

### ✅ 6. SSL/HTTPS Configuration

1. **Enable SSL Certificate**:
   - In Hostinger hPanel, go to **SSL**
   - Install free SSL certificate (Let's Encrypt)
   - Force HTTPS redirect

2. **Update .htaccess** to force HTTPS:
   ```apache
   # Force HTTPS
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteCond %{HTTPS} off
     RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   </IfModule>
   ```

### ✅ 7. Performance Optimization

1. **Enable Gzip compression** (already in .htaccess above)

2. **Set up CDN** (optional but recommended):
   - Consider using Cloudflare for CDN
   - This will cache static assets globally

3. **Optimize images**:
   - Ensure images are optimized before upload
   - Use WebP format where possible
   - Compress large images

### ✅ 8. Monitoring & Maintenance

1. **Set up error tracking** (optional):
   - Consider adding Sentry or similar service
   - Monitor production errors

2. **Regular backups**:
   - Backup your database regularly
   - Keep backups of your code

3. **Update dependencies**:
   - Regularly update npm packages
   - Test updates in development first

## Troubleshooting

### Issue: 404 errors on page refresh
**Solution**: Ensure `.htaccess` file is properly configured with SPA routing rules

### Issue: Environment variables not working
**Solution**: 
- Verify `.env` file exists in project root
- Rebuild the application after changing `.env`
- Check that variables start with `VITE_` prefix

### Issue: Supabase authentication not working
**Solution**:
- Verify Site URL in Supabase Dashboard matches your domain
- Check Redirect URLs include your production domain
- Ensure CORS settings allow your domain

### Issue: Assets not loading (404 on CSS/JS files)
**Solution**:
- Verify all files from `dist/` folder are uploaded
- Check file permissions (should be 644)
- Verify base path in `vite.config.js` is correct

### Issue: Build fails
**Solution**:
- Check Node.js version (should be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript/ESLint errors

## Important Notes

- ⚠️ **Never commit `.env` file** - It contains sensitive credentials
- ⚠️ **Always test in development** before deploying to production
- ⚠️ **Keep backups** of your database and code
- ⚠️ **Monitor your Supabase usage** - Check quotas and limits
- ⚠️ **Update dependencies regularly** for security patches

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server error logs in Hostinger
3. Verify Supabase dashboard for database issues
4. Test locally with `npm run preview` to isolate issues

## Quick Reference

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Check build output
ls -la dist/
```

---

**Last Updated**: Based on current project configuration
**Next Steps**: Follow this guide step-by-step for your Hostinger deployment

