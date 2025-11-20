# Website Member Images - Supabase Storage Update

## Summary

The website now uses the **`dashboardmemberimages`** Supabase Storage bucket for all member profile images, instead of storing them in localStorage as base64 data.

## What Changed

### 1. **Apply Membership Page** (`ApplyMembershipPage.jsx`)
- Profile images from membership applications now upload to `dashboardmemberimages` bucket
- Other documents (ID cards, certificates, CVs) still use `MemberBucket`
- Automatically detects profile images and routes them to the correct bucket

### 2. **Dashboard Member Edit Form** (`MemberEditForm.jsx`)
- Already updated to use `dashboardmemberimages` bucket
- No changes needed

### 3. **Member Approval Service** (`memberApprovalService.js`)
- Uses profile images from applications (already in storage)
- No changes needed - it already uses storage URLs

### 4. **Auth Context** (`AuthContext.jsx`)
- Uses default placeholder image or metadata.image (URL string)
- If metadata.image is a File object in the future, it should be uploaded to `dashboardmemberimages`

## Bucket Usage

| Bucket | Used For | Location |
|--------|----------|----------|
| `dashboardmemberimages` | Member profile images | All member images across website |
| `MemberBucket` | Application documents (ID, certificates, CV) | Membership applications only |

## Benefits

✅ **No localStorage quota issues** - All member images stored in Supabase Storage  
✅ **Consistent storage** - All member images in one bucket  
✅ **Better performance** - Images load from CDN  
✅ **Scalable** - Can handle unlimited images  
✅ **Easy management** - All member images in one place  

## How It Works

1. **Dashboard**: When editing a member, images upload to `dashboardmemberimages`
2. **Membership Application**: Profile images upload to `dashboardmemberimages`
3. **Member Approval**: Uses image URL from application (already in storage)
4. **Display**: All member images load from Supabase Storage URLs

## Migration

Existing base64 images in localStorage will be automatically migrated when:
- A member's image is updated in the dashboard
- The image is replaced with a new upload

Old base64 images will be replaced with storage URLs on next update.

## Setup Required

Make sure the `dashboardmemberimages` bucket exists:
1. Go to Supabase Dashboard → Storage
2. Create bucket: `dashboardmemberimages`
3. Set it to **Public**
4. Done! ✅

See `DASHBOARD_MEMBER_IMAGES_SETUP.md` for detailed setup instructions.

