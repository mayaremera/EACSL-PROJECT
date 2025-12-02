# Admin Role Display Mapping

## Overview

The "Admin" role is used internally in Supabase for authentication and authorization, but it is **never displayed publicly** on the website. Instead, admin accounts can have a custom "Display Role" that is editable in the Dashboard, which shows on all public-facing pages.

## Key Features

✅ **Admin role is NOT selectable** in the Dashboard dropdown (prevents accidental assignment)  
✅ **Display Role field** is editable in Dashboard for all members  
✅ **Admin role** is set directly in Supabase for authentication  
✅ **Display Role** controls what shows on the public website

## How It Works

### 1. **Supabase Database**
- Admin accounts have `role = 'Admin'` in the `members` table (set directly in Supabase)
- A new `display_role` column stores the public-facing role (editable in Dashboard)
- Admin role is used for:
  - Dashboard access control
  - Authentication checks
  - Authorization in ProtectedRoute component

### 2. **Dashboard Form**
- **Role dropdown**: Contains only public roles (Member, Affiliated Member, Board Member, Honorary President, Founder)
- **Admin role is NOT in the dropdown** - it must be set directly in Supabase
- **Display Role dropdown**: Separate field to set what shows on the website
  - Can be left empty (auto-uses Role field)
  - Can be set to any public role to override what displays

### 3. **Public Website Display**
- All public pages use `getDisplayRole()` utility function
- Priority order:
  1. If `display_role` is set → use it
  2. If role is "Admin" → map to default (Founder)
  3. Otherwise → use role as-is
- Public pages affected:
  - Member Overview Page (`/members-overview`)
  - Member Profile Page (`/member-profile/:id`)
  - Continuing Education Page (`/continuing-education`)
  - About Page (board members section)
  - Homepage (featured members)

### 4. **Dashboard Display**
- Dashboard shows the **actual role** (including "Admin")
- This allows admins to see and manage admin accounts correctly
- Only accessible to authenticated admin users

## Implementation

### Utility Function
**File**: `src/utils/roleDisplay.js`

```javascript
export const getDisplayRole = (role, displayRole = null, defaultAdminDisplay = 'Founder') => {
  // If displayRole is explicitly set, use it
  if (displayRole && displayRole.trim() !== '') {
    return displayRole.trim();
  }
  
  if (!role) return 'Member';
  
  // Map Admin role to a public-facing role
  if (role === 'Admin' || role === 'admin') {
    return defaultAdminDisplay; // Default: 'Founder'
  }
  
  // Return the role as-is for all other roles
  return role;
};
```

### Where It's Used

1. **MemberCard Component** (`src/components/cards/MemberCard.jsx`)
   - Public pages: Shows display role
   - Dashboard: Shows actual role (including Admin)

2. **MemberProfile Page** (`src/pages/MemberProfile.jsx`)
   - Always shows display role (public page)

3. **ContinuingEducationMember Page** (`src/pages/ContinuingEducationMember.jsx`)
   - Always shows display role (public page)

4. **AboutPage** (`src/pages/AboutPage.jsx`)
   - Always shows display role (public page)

## Setting Display Role

### In Dashboard (Recommended)
1. Go to Dashboard → Members tab
2. Click "Edit" on a member
3. Set the **Display Role** dropdown to the desired role
4. Leave empty to auto-use the Role field
5. Save the member

### For Admin Accounts
1. Set `role = 'Admin'` directly in Supabase (not in Dashboard)
2. In Dashboard, set the **Display Role** to the desired public role (e.g., "Founder", "Board Member")
3. The website will show the Display Role, not "Admin"

### Changing Default Admin Display
Edit `src/utils/roleDisplay.js`:
```javascript
export const getDisplayRole = (role, displayRole = null, defaultAdminDisplay = 'Founder') => {
  // Change 'Founder' to your preferred default
  // This only applies if display_role is not set in the database
}
```

## Available Roles

The system supports these roles:
- **Member** - Regular member
- **Affiliated Member** - Affiliated member
- **Board Member** - Board member (default display for Admin)
- **Honorary President** - Honorary president
- **Founder** - Founder
- **Admin** - Internal only (displays as "Board Member" publicly)

## Security Notes

✅ **What's Protected:**
- Admin role is never exposed in public API responses
- Admin role is never shown on public pages
- Dashboard access still requires `role = 'Admin'` in Supabase

✅ **What Admins Can See:**
- In Dashboard → Members tab, admins see actual roles (including "Admin")
- This is correct - admins need to manage admin accounts

⚠️ **Important:**
- The actual role in Supabase remains "Admin" for authentication
- Only the display is changed on public pages
- Dashboard always shows the real role for management purposes

## Testing

1. **Create an Admin Account:**
   - In Supabase Dashboard → Table Editor → members
   - Set `role = 'Admin'` for a member

2. **Verify Public Display:**
   - Visit `/members-overview` - should show "Board Member" (or custom role)
   - Visit `/member-profile/:id` - should show "Board Member" (or custom role)

3. **Verify Dashboard Display:**
   - Login as admin
   - Go to Dashboard → Members tab
   - Should see "Admin" role for admin accounts

## Summary

- ✅ Admin role exists in Supabase for authentication
- ✅ Admin role is **never** shown on public pages
- ✅ Admin accounts display as "Board Member" (or custom) on website
- ✅ Dashboard shows actual roles (including Admin) for management
- ✅ All public-facing components use `getDisplayRole()` utility

