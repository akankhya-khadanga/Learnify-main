-- ========================================
-- FIX RLS POLICIES FOR EXISTING USERS TABLE
-- Run this in Supabase SQL Editor
-- ========================================

-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.users;
DROP POLICY IF EXISTS "Allow users to read own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own data" ON public.users;

-- Create new policies that allow user registration

-- Policy 1: Allow authenticated users to INSERT their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to SELECT their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow all authenticated users to read other users (for leaderboards)
CREATE POLICY "Enable read access for authenticated users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Run these to verify the policies are set correctly:

-- Check if RLS is enabled (should return true)
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';

-- Check policies (should show 4 policies)
-- SELECT * FROM pg_policies WHERE tablename = 'users';
