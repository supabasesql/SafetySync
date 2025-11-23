-- =====================================================
-- SafetySync Role Management Migration (Adapted)
-- =====================================================
-- This script adapts to your existing profiles schema
-- Run this in Supabase SQL Editor

-- 1. Create role enum type (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Since role column already exists as TEXT, we'll keep it as TEXT
-- Update: Set default role for existing users who don't have a role yet
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL OR role = '';

-- 3. Validate that all roles are valid
-- (Optional: This will show you if there are any invalid roles)
-- SELECT DISTINCT role FROM profiles;

-- =====================================================
-- RLS Policies for Incidents Table
-- =====================================================

-- Drop ALL existing policies on incidents
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'incidents') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON incidents';
    END LOOP;
END $$;

-- Read policies
CREATE POLICY "Admin and Manager can view all incidents"
ON incidents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Viewer can view all incidents (read-only)"
ON incidents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'viewer'
  )
);

CREATE POLICY "User can view own incidents"
ON incidents FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager', 'viewer')
  )
);

-- Create policies
CREATE POLICY "Admin, Manager, and User can create incidents"
ON incidents FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager', 'user')
  )
);

-- Update policies
CREATE POLICY "Admin and Manager can update all incidents"
ON incidents FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "User can update own incidents"
ON incidents FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'user'
  )
);

-- Delete policies
CREATE POLICY "Admin and Manager can delete incidents"
ON incidents FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- =====================================================
-- RLS Policies for Profiles Table
-- =====================================================

-- Drop ALL existing policies on profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- Read policies
CREATE POLICY "All authenticated users can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Update policies
CREATE POLICY "Admin can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Users can update own profile (except role)"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND (
    -- Allow if not changing role, or if admin
    role = (SELECT role FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- =====================================================
-- Enable RLS on tables (if not already enabled)
-- =====================================================

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check role distribution
SELECT role, COUNT(*) as count FROM profiles GROUP BY role;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('incidents', 'profiles');

-- Show all policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('incidents', 'profiles')
ORDER BY tablename, policyname;
