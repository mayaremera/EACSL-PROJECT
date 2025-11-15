# Member Application Approval Flow Guide

## Overview

When a member application is approved in the Dashboard, the system automatically:
1. ✅ Validates the email address
2. ✅ Creates a member profile in the members table
3. ✅ Adds the member to Active Members page

**Note**: No authentication account is created. Approved members are regular members who cannot log in.

## How It Works

### Step 1: Member Submits Application
- User fills out the "Become a Member" form at `/apply-membership`
- Form validates email format (must be valid email)
- Form stores: username, email, password, specialty, previous work, documents
- Application status: `pending`

### Step 2: Admin Reviews Application
- Admin goes to Dashboard → Applications tab
- Clicks on an application to view details
- Reviews all submitted information and documents

### Step 3: Admin Approves Application
When admin clicks "Approve Application":
1. **Email Validation**: System checks if email is valid format
2. **Duplicate Check**: Verifies member doesn't already exist
3. **Confirmation Dialog**: Shows what will happen
4. **Member Profile Creation**:
   - Creates member record in `members` table
   - Sets `supabase_user_id = null` (no authentication account)
   - Sets `is_active = true`
   - Uses profile image from application (from storage or base64)
5. **Status Updated**: Application status changes to `approved`

**Important**: No authentication account is created. The member is added as a regular member only.

## Email Validation

The form already validates email format using regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

This ensures:
- Email has @ symbol
- Email has domain name
- Email has top-level domain (.com, .net, etc.)

## Important Notes

### Regular Members Only
- **No Authentication Account**: Approved members are regular members who cannot log in
- **No Password Required**: Password from application is not used (not needed)
- **No Email Confirmation**: No confirmation email is sent
- **Members Table Only**: Member is added to `members` table with `supabase_user_id = null`

### Duplicate Members
- System checks if member with same email already exists
- If member exists, approval fails with clear error message
- Admin can update existing member instead

## Supabase Settings Required

### Members Table
- Ensure the `members` table exists (see `SUPABASE_SETUP.md`)
- Table should have `supabase_user_id` column (can be null for regular members)

### Storage Bucket (Optional)
- If using file uploads, ensure `MemberBucket` exists (see `SUPABASE_STORAGE_SETUP.md`)
- Files are stored in organized folders within the bucket

## Testing the Flow

1. **Submit Test Application**:
   - Go to `/apply-membership`
   - Fill form with valid email
   - Submit application

2. **Approve Application**:
   - Go to Dashboard → Applications
   - Find your test application
   - Click to view details
   - Click "Approve Application"
   - Confirm the action

3. **Check Results**:
   - Check Supabase Table Editor → members (should see new member)
   - Check that `supabase_user_id` is `null` (no auth account)
   - Go to `/active-members` (should see new member)
   - Member should appear in Active Members list

4. **Verify No Login**:
   - The member cannot log in (no authentication account created)
   - They are a regular member only
   - They appear on the website but cannot access member-only features

## Troubleshooting

**Q: Approval fails with "already exists" error?**
- A member with this email already exists in the members table
- Check if member already exists in Dashboard → Members
- Update existing member instead of creating new one

**Q: Member created but not showing on website?**
- Check if `is_active = true` in members table
- Click "Sync from Supabase" in Dashboard
- Refresh Active Members page

**Q: Member wants to log in?**
- Approved members are regular members (no login account)
- If they need login access, create an authentication account separately
- Or they can sign up through the Login/Signup modal

**Q: How to give approved member login access?**
- They can sign up through the Login/Signup modal with their email
- Or admin can manually create auth account in Supabase Dashboard
- Then link it to member by updating `supabase_user_id` in members table

## Security Considerations

1. **Password Storage**: Currently stored in localStorage (not encrypted)
   - Consider encrypting before storage
   - Or use Supabase Edge Functions for approval

2. **Email Validation**: Form validates format, but doesn't verify email exists
   - Consider adding email verification service
   - Or send test email during submission

3. **Admin Access**: Approval requires dashboard access
   - Ensure dashboard is protected
   - Only authorized admins should have access

