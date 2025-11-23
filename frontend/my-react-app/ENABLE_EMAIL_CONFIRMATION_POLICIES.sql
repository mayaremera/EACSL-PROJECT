-- SQL Script to Enable Email Confirmation for Authentication
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This ensures proper permissions and policies for sending confirmation emails

-- ============================================================================
-- IMPORTANT: Email confirmation is primarily configured in Supabase Dashboard
-- ============================================================================
-- Go to: Authentication → Settings → Email Auth
-- Enable: "Enable email confirmations"
-- Set: "Confirm email" to ON
-- ============================================================================

-- Step 1: Ensure auth schema has proper permissions
-- This allows the auth system to send emails
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;

-- Step 2: Create a function to check if email confirmation is enabled
-- This helps verify the configuration
CREATE OR REPLACE FUNCTION check_email_confirmation_setting()
RETURNS TABLE (
  setting_name TEXT,
  setting_value TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Email Confirmation'::TEXT as setting_name,
    'Check Dashboard'::TEXT as setting_value,
    'Go to Authentication → Settings → Email Auth → Enable email confirmations'::TEXT as description;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure auth.users table has proper permissions for email operations
-- This allows the auth system to update email_confirmed_at
GRANT SELECT, UPDATE ON auth.users TO postgres, service_role;

-- Step 4: Create a trigger function to log email confirmation events
-- This helps track when emails are confirmed
CREATE OR REPLACE FUNCTION log_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when email_confirmed_at changes from NULL to a timestamp
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    RAISE NOTICE 'Email confirmed for user: % (ID: %)', NEW.email, NEW.id;
    
    -- Optional: Update related member record if exists
    UPDATE public.members
    SET is_active = true,
        updated_at = NOW()
    WHERE supabase_user_id = NEW.id
      AND is_active = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger on auth.users to handle email confirmation
-- This automatically activates members when their email is confirmed
DROP TRIGGER IF EXISTS trigger_email_confirmation ON auth.users;
CREATE TRIGGER trigger_email_confirmation
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION log_email_confirmation();

-- Step 6: Grant necessary permissions for the trigger function
GRANT EXECUTE ON FUNCTION log_email_confirmation() TO postgres, service_role;

-- Step 7: Ensure public.members table allows updates from auth triggers
-- This is needed for the trigger to update member status
GRANT UPDATE ON public.members TO postgres, service_role;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if trigger was created successfully
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_email_confirmation';

-- Check function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'log_email_confirmation';

-- ============================================================================
-- MANUAL CONFIGURATION REQUIRED IN SUPABASE DASHBOARD
-- ============================================================================
-- 
-- 1. Go to: Supabase Dashboard → Authentication → Settings
-- 2. Scroll to "Email Auth" section
-- 3. Enable "Enable email confirmations" toggle
-- 4. Set "Confirm email" to ON
-- 5. Configure email templates (optional):
--    - Go to: Authentication → Email Templates
--    - Customize "Confirm signup" template
-- 6. Configure SMTP settings (if using custom SMTP):
--    - Go to: Settings → Auth → SMTP Settings
--    - Enter your SMTP server details
--
-- ============================================================================
-- NOTES
-- ============================================================================
--
-- - Email confirmation is handled by Supabase Auth service, not database policies
-- - The trigger above helps sync member status when email is confirmed
-- - RLS policies don't affect email sending (that's handled by Supabase Auth)
-- - If emails aren't sending, check:
--   1. SMTP settings in Dashboard
--   2. Email confirmation is enabled in Auth settings
--   3. Email templates are configured
--   4. Check Supabase logs for email delivery errors
--
-- ============================================================================

