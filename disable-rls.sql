-- Disable RLS completely on incidents table for testing
-- Run this in Supabase SQL Editor

ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'incidents';
