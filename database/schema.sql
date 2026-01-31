-- Migration: Electronic Voting System
-- Description: Creates tables for elections, choices, tokens, votes, and admins

-- Table: elections
CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: choices (voting options for each election)
CREATE TABLE IF NOT EXISTS choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(election_id, order_index)
);

-- Table: tokens (pre-generated hashed tokens)
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: votes (anonymous votes - NO link to tokens or voters)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  choice_id UUID NOT NULL REFERENCES choices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: admins (admin users for authentication)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tokens_election ON tokens(election_id);
CREATE INDEX IF NOT EXISTS idx_tokens_hash ON tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_choice ON votes(choice_id);
CREATE INDEX IF NOT EXISTS idx_choices_election ON choices(election_id);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Enable Row Level Security (RLS)
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for now (authentication will be handled in app layer)
-- In production, you would want more restrictive policies

CREATE POLICY "Enable all for elections" ON elections FOR ALL USING (true);
CREATE POLICY "Enable all for choices" ON choices FOR ALL USING (true);
CREATE POLICY "Enable all for tokens" ON tokens FOR ALL USING (true);
CREATE POLICY "Enable all for votes" ON votes FOR ALL USING (true);
CREATE POLICY "Enable all for admins" ON admins FOR ALL USING (true);
