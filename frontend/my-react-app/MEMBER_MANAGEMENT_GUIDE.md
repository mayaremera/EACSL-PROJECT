# Member Management Guide

## Understanding the Two Systems

### 1. **Supabase Authentication Tab** (`auth.users`)
- **Purpose**: Stores user login credentials (email, password)
- **Used for**: Login/Signup functionality
- **Location**: Supabase Dashboard → Authentication → Users
- **Contains**: Email, password hash, user metadata

### 2. **Members Table** (`public.members`)
- **Purpose**: Stores member profile information (shown on website)
- **Used for**: Displaying members on Active Members page
- **Location**: Supabase Dashboard → Table Editor → members
- **Contains**: Name, role, nationality, description, certificates, etc.

## How They Work Together

```
┌─────────────────────┐         ┌──────────────────┐
│  auth.users         │         │  members table   │
│  (Authentication)   │────────▶│  (Profiles)      │
│                     │         │                  │
│  - Email            │         │  - Name          │
│  - Password         │         │  - Role           │
│  - User ID          │         │  - Description    │
│                     │         │  - supabase_user_id│
└─────────────────────┘         └──────────────────┘
```

- When a user signs up → Creates entry in `auth.users` AND `members` table
- The `supabase_user_id` field in `members` links to `auth.users(id)`
- A member can exist WITHOUT authentication (display-only members)
- An authenticated user can exist WITHOUT a member profile (rare, but possible)

## Where to Add Members

### ✅ **RECOMMENDED: Use the Website Dashboard**

**Best for**: Adding new members going forward

1. Go to `/dashboard` in your website
2. Click "Members" tab
3. Click "Add Member" button
4. Fill in the form
5. Click "Save"

**What happens:**
- Member is saved to `members` table in Supabase
- Member appears on Active Members page immediately
- If you provide an email that matches an `auth.users` account, it links automatically

### ✅ **For Past/Existing Members: Bulk Import**

**Best for**: Adding many existing members at once

#### Option A: Use Dashboard (One by One)
- Add each member through Dashboard
- Works but slow for many members

#### Option B: SQL Bulk Insert (Fastest)
Run this in Supabase SQL Editor to add multiple members at once:

```sql
-- Insert multiple past members
INSERT INTO members (
  name, email, role, nationality, flag_code,
  description, full_description, membership_date,
  is_active, active_till, certificates, phone,
  location, website, linkedin, image
) VALUES
  (
    'Dr. Ahmed Hassan',
    'ahmed.hassan@eacsl.net',
    'Board Member',
    'Egyptian',
    'eg',
    'Experienced surgeon specializing in advanced cardiac procedures.',
    'Dr. Ahmed Hassan is an experienced cardiothoracic surgeon with over 15 years of expertise...',
    'January 2020',
    true,
    '2025',
    '["Board Certified Cardiothoracic Surgeon", "Advanced Cardiac Life Support (ACLS)"]'::jsonb,
    '+20 123 456 7890',
    'Cairo, Egypt',
    'www.drahmedhassan.com',
    'linkedin.com/in/ahmedhassan',
    'https://images.unsplash.com/photo-1637059824899-a441006a6875?w=600'
  ),
  (
    'Dr. Sarah Mitchell',
    'sarah.mitchell@eacsl.net',
    'Vice President',
    'American',
    'us',
    'Leading expert in pediatric cardiology with focus on congenital heart defects.',
    'Dr. Sarah Mitchell is a renowned pediatric cardiologist with 18 years of experience...',
    'March 2018',
    true,
    '2025',
    '["Board Certified Pediatric Cardiologist", "Pediatric Advanced Life Support (PALS)"]'::jsonb,
    '+1 555 123 4567',
    'Boston, USA',
    'www.drsarahmitchell.com',
    'linkedin.com/in/sarahmitchell',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600'
  );
-- Add more members as needed...
```

After running SQL:
1. Go to Dashboard → Members tab
2. Click "Sync from Supabase"
3. Members will appear on the website

#### Option C: CSV Import (If you have many members)
1. Export your member data to CSV
2. Use Supabase's import feature OR
3. Convert CSV to SQL INSERT statements

## Linking Authentication with Members

### Scenario 1: Member Already Has Account
If a member already exists in `auth.users`:
1. Add member to `members` table (via Dashboard or SQL)
2. Set `supabase_user_id` to match their `auth.users(id)`
3. Or just use the same email - the system will try to link automatically

### Scenario 2: Member Needs Account
1. User signs up through Login/Signup modal
2. System automatically creates entry in both `auth.users` AND `members`
3. They're automatically linked

### Scenario 3: Display-Only Member (No Login)
1. Add member through Dashboard
2. Leave `supabase_user_id` empty/null
3. Member appears on website but can't login
4. They can sign up later and the system will link them

## Best Practices

### ✅ DO:
- Use Dashboard for adding new members (easiest and safest)
- Use SQL bulk insert for past members (fastest)
- Keep email addresses unique
- Set `is_active = true` for active members

### ❌ DON'T:
- Don't manually add to `auth.users` unless you know what you're doing
- Don't duplicate email addresses in `members` table
- Don't forget to set `is_active = false` for inactive members

## Quick Reference

| Action | Where to Do It | Result |
|--------|---------------|--------|
| Add new member | Website Dashboard | Appears on site immediately |
| Add past members (bulk) | Use `IMPORT_EXISTING_MEMBERS.sql` file | Then sync from Dashboard |
| Create user account | Login/Signup modal | Auto-creates member profile |
| View all members | `/active-members` page | Shows all active members |
| Manage members | `/dashboard` → Members tab | Full CRUD operations |

## Importing Your Existing Members

You have 8 existing members in your code. To import them all at once:

1. **Open Supabase SQL Editor**
2. **Copy the entire content from `IMPORT_EXISTING_MEMBERS.sql` file**
3. **Paste and run it**
4. **Go to Dashboard → Members tab**
5. **Click "Sync from Supabase"**
6. **All 8 members will appear on your website!**

## Troubleshooting

**Q: Member added but not showing on website?**
- Check if `is_active = true`
- Click "Sync from Supabase" in Dashboard
- Refresh the Active Members page

**Q: User can login but no member profile?**
- System should auto-create profile on first login
- If not, add member manually through Dashboard

**Q: Member exists but can't login?**
- They need to sign up through Login/Signup modal
- Or create account in Authentication tab, then link via `supabase_user_id`

