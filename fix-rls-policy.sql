-- Fix RLS policies to allow anonymous inserts for testing
-- Run this in Supabase SQL Editor

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can create incidents" ON incidents;

-- Create a new policy that allows inserts from the anon key
CREATE POLICY "Allow anonymous inserts for testing"
  ON incidents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Verify the policy
SELECT * FROM pg_policies WHERE tablename = 'incidents';
