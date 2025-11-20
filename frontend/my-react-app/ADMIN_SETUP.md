# Admin Account Setup Guide

## How to Make an Account Admin

To grant admin access to the dashboard, you need to set the account's role to `Admin` in the members table.

### Method 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor** → **members** table
3. Find the member you want to make admin (search by email or name)
4. Click on the row to edit it
5. Find the `role` column
6. Change the value from `Member` to `Admin`
7. Save the changes

### Method 2: Via SQL Editor

**First, check if the member exists:**

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this query to find the member (replace `user@example.com` with the actual email):

```sql
SELECT id, name, email, role, supabase_user_id
FROM members
WHERE email = 'user@example.com';
```

**If the member exists, update the role:**

```sql
UPDATE members
SET role = 'Admin'
WHERE email = 'user@example.com';
```

**If the member doesn't exist, you have two options:**

**Option A: Create a member record first (if you have an auth account)**

1. First, find your auth user ID:
```sql
SELECT id, email
FROM auth.users
WHERE email = 'user@example.com';
```

2. Then create a member record with Admin role:
```sql
INSERT INTO members (supabase_user_id, name, email, role, is_active)
VALUES (
  'YOUR_AUTH_USER_ID_HERE',  -- Replace with the ID from step 1
  'Admin User',              -- Replace with the name
  'user@example.com',        -- Replace with the email
  'Admin',
  true
);
```

**Option B: Use the Dashboard to create the member first**

1. Log in to the website
2. Go to Dashboard → Members tab
3. Add a new member manually
4. Set the role to `Admin` when creating/editing

### Method 3: Via Dashboard (if you're already an admin)

1. Log in as an admin account
2. Go to Dashboard → Members tab
3. Find the member you want to make admin
4. Click Edit
5. Change the Role field to `Admin`
6. Save

## Admin Features

Once an account has the `Admin` role:

- ✅ Can access `/dashboard` route
- ✅ Can access `/dashboard-course-editor` route
- ✅ Can manage all content (members, courses, applications, etc.)
- ✅ Can approve/reject member applications
- ✅ Can edit member information

## Security Notes

- Only accounts with `role = 'Admin'` in the members table can access admin routes
- Regular members (`role = 'Member'`) will see an "Access Denied" message if they try to access the dashboard
- The admin check is done both in the member record and in the authentication user metadata (as a fallback)

## Troubleshooting

**Q: SQL says "row doesn't exist"**

A: This means the member record doesn't exist in the `members` table. You need to:
1. Check if you have an auth account (in Authentication tab)
2. If you have an auth account but no member record, create one using Option A above
3. Or approve your membership application through the Dashboard (if you submitted one)
4. Or manually create a member record in the Dashboard

**Q: I set the role to Admin but still can't access the dashboard**

A: Make sure:
1. You're logged in with the correct account
2. The member record is linked to your auth account (check `supabase_user_id` field matches your auth user ID)
3. The `role` field is exactly `Admin` (case-sensitive, no spaces)
4. Try logging out and logging back in
5. Clear your browser cache

**Q: How do I check if an account is admin?**

A: In Supabase Dashboard → Table Editor → members table, check the `role` column. It should say `Admin` (case-sensitive).

**Q: How do I find my auth user ID to link a member record?**

A: Run this SQL query:
```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

The `id` column is your `supabase_user_id` that should be in the `members.supabase_user_id` field.

