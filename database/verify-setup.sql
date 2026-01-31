-- Verification Script for Supabase Database
-- Run this in Supabase SQL Editor to verify your database is set up correctly
-- This script only reads data, it doesn't modify anything

-- ============================================
-- CHECK 1: List all tables in public schema
-- ============================================
SELECT 'CHECK 1: Tables in database' as check_name;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected result: 5 tables
-- admins, choices, elections, tokens, votes

-- ============================================
-- CHECK 2: Verify admins table structure
-- ============================================
SELECT 'CHECK 2: Admins table structure' as check_name;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'admins'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid), username (text), password (text), created_at (timestamp with time zone)

-- ============================================
-- CHECK 3: Verify elections table structure
-- ============================================
SELECT 'CHECK 3: Elections table structure' as check_name;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'elections'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid), title (text), status (text), created_at (timestamp with time zone)

-- ============================================
-- CHECK 4: Verify Row Level Security is enabled
-- ============================================
SELECT 'CHECK 4: Row Level Security status' as check_name;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- rowsecurity should be 't' (true) for all tables

-- ============================================
-- CHECK 5: List RLS policies
-- ============================================
SELECT 'CHECK 5: RLS Policies' as check_name;
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: One policy per table (5 total)
-- "Enable all for admins", "Enable all for choices", etc.

-- ============================================
-- CHECK 6: Count existing data
-- ============================================
SELECT 'CHECK 6: Data counts' as check_name;
SELECT 
  'elections' as table_name, 
  COUNT(*) as row_count 
FROM elections
UNION ALL
SELECT 'choices', COUNT(*) FROM choices
UNION ALL
SELECT 'tokens', COUNT(*) FROM tokens
UNION ALL
SELECT 'votes', COUNT(*) FROM votes
UNION ALL
SELECT 'admins', COUNT(*) FROM admins;

-- ============================================
-- CHECK 7: Verify indexes exist
-- ============================================
SELECT 'CHECK 7: Indexes' as check_name;
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- SUMMARY
-- ============================================
SELECT 'SUMMARY: If all checks passed, your database is correctly configured!' as status;
