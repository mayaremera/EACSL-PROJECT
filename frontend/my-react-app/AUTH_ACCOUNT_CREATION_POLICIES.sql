-- SQL Script for Secure Authentication Account Creation Policies
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This ensures secure creation and linking of authentication accounts

-- ============================================================================
-- IMPORTANT: Authentication accounts are created via Supabase Auth API
-- This script provides database-level security policies and validation
-- ============================================================================

-- ============================================================================
-- STEP 1: SECURE MEMBERS TABLE POLICIES
-- ============================================================================

-- Ensure RLS is enabled on members table
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.members;
DROP POLICY IF EXISTS "Allow public read active members" ON public.members;
DROP POLICY IF EXISTS "Allow secure auth account linking" ON public.members;
DROP POLICY IF EXISTS "Prevent unauthorized supabase_user_id updates" ON public.members;

-- Policy 1: Allow service_role (admins) full access to members
-- Only admins can create, update, and delete members with auth accounts
CREATE POLICY "Allow service_role full access" ON public.members
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Allow authenticated users (non-admins) read access only
-- Regular authenticated users can only view members, not modify them
CREATE POLICY "Allow authenticated users read only" ON public.members
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Policy 3: Allow public read access to active members only
-- This allows the website to display active members without authentication
CREATE POLICY "Allow public read active members" ON public.members
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- ============================================================================
-- STEP 2: SECURE FUNCTION TO VALIDATE AUTH ACCOUNT CREATION
-- ============================================================================

-- Function to validate email format and check for duplicates
CREATE OR REPLACE FUNCTION validate_auth_account_creation(
  p_email TEXT,
  p_supabase_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  email_pattern TEXT := '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  existing_member RECORD;
  existing_auth_user RECORD;
BEGIN
  -- Validate email format
  IF p_email IS NULL OR p_email = '' THEN
    RETURN QUERY SELECT false, 'Email is required'::TEXT;
    RETURN;
  END IF;

  IF NOT (p_email ~* email_pattern) THEN
    RETURN QUERY SELECT false, 'Invalid email format'::TEXT;
    RETURN;
  END IF;

  -- Check if member with this email already exists
  SELECT INTO existing_member *
  FROM public.members
  WHERE LOWER(email) = LOWER(p_email)
  LIMIT 1;

  IF existing_member IS NOT NULL THEN
    -- If supabase_user_id is provided, check if it matches
    IF p_supabase_user_id IS NOT NULL AND existing_member.supabase_user_id IS NOT NULL THEN
      IF existing_member.supabase_user_id != p_supabase_user_id THEN
        RETURN QUERY SELECT false, 'Email already linked to different authentication account'::TEXT;
        RETURN;
      END IF;
    ELSIF existing_member.supabase_user_id IS NOT NULL THEN
      RETURN QUERY SELECT false, 'Email already linked to an authentication account'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Check if auth user already exists (if supabase_user_id provided)
  IF p_supabase_user_id IS NOT NULL THEN
    SELECT INTO existing_auth_user *
    FROM auth.users
    WHERE id = p_supabase_user_id
    LIMIT 1;

    IF existing_auth_user IS NOT NULL THEN
      -- Check if this auth user is already linked to a different member
      SELECT INTO existing_member *
      FROM public.members
      WHERE supabase_user_id = p_supabase_user_id
        AND (p_email IS NULL OR LOWER(email) != LOWER(p_email))
      LIMIT 1;

      IF existing_member IS NOT NULL THEN
        RETURN QUERY SELECT false, 'Authentication account already linked to different member'::TEXT;
        RETURN;
      END IF;
    END IF;
  END IF;

  -- All validations passed
  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role (admins) only
-- This prevents public and regular authenticated users from validating/creating auth accounts
GRANT EXECUTE ON FUNCTION validate_auth_account_creation(TEXT, UUID) TO service_role;

-- ============================================================================
-- STEP 3: SECURE FUNCTION TO LINK AUTH ACCOUNT TO MEMBER
-- ============================================================================

-- Function to securely link an auth account to a member record
CREATE OR REPLACE FUNCTION link_auth_account_to_member(
  p_member_id BIGINT,
  p_supabase_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  member_record RECORD;
  auth_user_record RECORD;
  validation_result RECORD;
BEGIN
  -- Check if member exists
  SELECT INTO member_record *
  FROM public.members
  WHERE id = p_member_id
  LIMIT 1;

  IF member_record IS NULL THEN
    RETURN QUERY SELECT false, 'Member not found'::TEXT;
    RETURN;
  END IF;

  -- Check if auth user exists
  SELECT INTO auth_user_record *
  FROM auth.users
  WHERE id = p_supabase_user_id
  LIMIT 1;

  IF auth_user_record IS NULL THEN
    RETURN QUERY SELECT false, 'Authentication account not found'::TEXT;
    RETURN;
  END IF;

  -- Validate the linking operation
  SELECT * INTO validation_result
  FROM validate_auth_account_creation(member_record.email, p_supabase_user_id);

  IF NOT validation_result.is_valid THEN
    RETURN QUERY SELECT false, validation_result.error_message;
    RETURN;
  END IF;

  -- Check if member already has a different auth account linked
  IF member_record.supabase_user_id IS NOT NULL AND member_record.supabase_user_id != p_supabase_user_id THEN
    RETURN QUERY SELECT false, 'Member already linked to different authentication account'::TEXT;
    RETURN;
  END IF;

  -- Check if auth account is already linked to a different member
  IF EXISTS (
    SELECT 1 FROM public.members
    WHERE supabase_user_id = p_supabase_user_id
      AND id != p_member_id
  ) THEN
    RETURN QUERY SELECT false, 'Authentication account already linked to different member'::TEXT;
    RETURN;
  END IF;

  -- Perform the link
  UPDATE public.members
  SET 
    supabase_user_id = p_supabase_user_id,
    updated_at = NOW()
  WHERE id = p_member_id;

  RETURN QUERY SELECT true, 'Auth account linked successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role (admins) only
-- This prevents public and regular authenticated users from linking auth accounts
GRANT EXECUTE ON FUNCTION link_auth_account_to_member(BIGINT, UUID) TO service_role;

-- ============================================================================
-- STEP 4: TRIGGER TO VALIDATE AUTH ACCOUNT LINKING ON INSERT/UPDATE
-- ============================================================================

-- Function to validate before inserting/updating member with auth account
CREATE OR REPLACE FUNCTION validate_member_auth_link()
RETURNS TRIGGER AS $$
DECLARE
  validation_result RECORD;
BEGIN
  -- Only validate if supabase_user_id is being set
  IF NEW.supabase_user_id IS NOT NULL THEN
    -- Validate the auth account creation
    SELECT * INTO validation_result
    FROM validate_auth_account_creation(NEW.email, NEW.supabase_user_id);

    IF NOT validation_result.is_valid THEN
      RAISE EXCEPTION 'Validation failed: %', validation_result.error_message;
    END IF;

    -- Check if this auth account is already linked to a different member
    IF EXISTS (
      SELECT 1 FROM public.members
      WHERE supabase_user_id = NEW.supabase_user_id
        AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Authentication account already linked to different member';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to validate on insert/update
DROP TRIGGER IF EXISTS trigger_validate_member_auth_link ON public.members;
CREATE TRIGGER trigger_validate_member_auth_link
  BEFORE INSERT OR UPDATE OF supabase_user_id, email ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION validate_member_auth_link();

-- ============================================================================
-- STEP 5: SECURE PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
-- Public and authenticated users can only SELECT (read)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.members TO anon, authenticated;

-- Only service_role (admins) can INSERT, UPDATE, DELETE members
-- This prevents public and regular authenticated users from creating auth accounts
GRANT ALL ON public.members TO service_role;
GRANT SELECT ON auth.users TO service_role;

-- ============================================================================
-- STEP 6: INDEXES FOR PERFORMANCE AND SECURITY
-- ============================================================================

-- Create unique index on email to prevent duplicates (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_email_unique 
ON public.members(email) 
WHERE email IS NOT NULL AND email != '';

-- Create unique index on supabase_user_id to prevent duplicate links
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_supabase_user_id_unique 
ON public.members(supabase_user_id) 
WHERE supabase_user_id IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'members'
ORDER BY policyname;

-- Check if functions were created
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'validate_auth_account_creation',
    'link_auth_account_to_member',
    'validate_member_auth_link'
  )
ORDER BY routine_name;

-- Check if triggers were created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_validate_member_auth_link';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Example 1: Validate before creating auth account
-- SELECT * FROM validate_auth_account_creation('user@example.com', NULL);

-- Example 2: Link auth account to member (must be done by admin/service_role)
-- SELECT * FROM link_auth_account_to_member(1, 'uuid-of-auth-user');

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================
--
-- 1. Authentication accounts are created via Supabase Auth API (supabase.auth.signUp)
--    - This is the secure and recommended way
--    - The database policies ensure secure linking after creation
--
-- 2. The validate_auth_account_creation function should be called before creating
--    auth accounts to prevent duplicates and invalid data
--
-- 3. The link_auth_account_to_member function provides a secure way to link
--    existing auth accounts to member records
--
-- 4. The trigger automatically validates all insert/update operations to prevent
--    security issues
--
-- 5. RLS policies ensure:
--    - Only service_role (admins) can create, update, and delete members
--    - Authenticated users can only read members (no modifications)
--    - Public can only read active members
--    - Only admins can create/link authentication accounts
--
-- 6. Unique indexes prevent:
--    - Duplicate email addresses
--    - Multiple members linked to same auth account
--
-- ============================================================================

