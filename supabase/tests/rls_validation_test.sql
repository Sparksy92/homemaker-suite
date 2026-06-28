-- WARNING:
-- Do not run this against production user data.
-- Use local Supabase, staging, or disposable test users only.
-- This script uses transaction rollback but still requires careful review before execution.

BEGIN;

-- 1. Create temporary test users in auth.users table if they don't exist
-- This allows foreign key validation to succeed in isolation.
INSERT INTO auth.users (id, email)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'usera@example.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'userb@example.com')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Test Case 1: User A Session Read/Write own data
-- -------------------------------------------------------------
-- Enforce authenticated role for RLS policy checks
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

-- User A inserts/updates their own profile
-- Using ON CONFLICT DO UPDATE to support handle_new_user() triggers
INSERT INTO public.profiles (id, display_name, sync_enabled)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'User A Display', true)
ON CONFLICT (id) DO UPDATE SET 
  display_name = EXCLUDED.display_name, 
  sync_enabled = EXCLUDED.sync_enabled;

-- User A inserts/updates their own plan
INSERT INTO public.homestead_plans (user_id, module_key, plan_data)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'homemaker_garden_plan', '{"beds": []}'::jsonb)
ON CONFLICT (user_id, module_key) DO UPDATE SET
  plan_data = EXCLUDED.plan_data;

-- Verify User A can SELECT their own profile and plan
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') THEN
    RAISE EXCEPTION 'RLS FAIL: User A cannot read their own profile';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.homestead_plans WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') THEN
    RAISE EXCEPTION 'RLS FAIL: User A cannot read their own plan';
  END IF;
END $$;

-- -------------------------------------------------------------
-- Test Case 2: User B Session attempting to access User A's data
-- -------------------------------------------------------------
-- Switch to User B Session (Enforcing authenticated role for RLS check)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

-- Verify User B CANNOT select User A's profile or plan
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') THEN
    RAISE EXCEPTION 'RLS FAIL: User B can read User A profile!';
  END IF;
  
  IF EXISTS (SELECT 1 FROM public.homestead_plans WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') THEN
    RAISE EXCEPTION 'RLS FAIL: User B can read User A plan!';
  END IF;
END $$;

-- Verify User B CANNOT UPDATE User A's plan
DO $$
BEGIN
  UPDATE public.homestead_plans 
  SET plan_data = '{"beds": ["malicious"]}'::jsonb 
  WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  
  IF FOUND THEN
    RAISE EXCEPTION 'RLS FAIL: User B was able to update User A plan!';
  END IF;
END $$;

-- Verify User B CANNOT DELETE User A's plan
DO $$
BEGIN
  DELETE FROM public.homestead_plans 
  WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  
  IF FOUND THEN
    RAISE EXCEPTION 'RLS FAIL: User B was able to delete User A plan!';
  END IF;
END $$;

-- -------------------------------------------------------------
-- Test Case 3: Verify Profile does not store credentials
-- -------------------------------------------------------------
-- Reset role to superuser temporarily to query schema tables
RESET ROLE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name IN ('password', 'password_hash', 'encrypted_password', 'secret', 'credential')
  ) THEN
    RAISE EXCEPTION 'SECURITY FAIL: Profile table contains credential storage columns!';
  END IF;
END $$;

-- Roll back transaction to leave database clean and pristine
ROLLBACK;

SELECT 'SUCCESS: All Row-Level Security checks passed!' AS result;
