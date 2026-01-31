-- Fix Missing Admins Table
-- Run this script in Supabase SQL Editor if you get the error:
-- "Could not find the table 'public.admins' in the schema cache"

-- Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for performance
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Enable all for admins" ON admins;

-- Create RLS policy to allow all operations
CREATE POLICY "Enable all for admins" ON admins FOR ALL USING (true);
