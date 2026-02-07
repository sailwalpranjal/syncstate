-- Disable RLS for document_versions table
-- This is required for Clerk authentication compatibility
-- Clerk uses a different JWT structure than Supabase Auth

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  author TEXT NOT NULL,
  author_id TEXT NOT NULL,
  message TEXT NOT NULL,
  parent_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
  snapshot_data TEXT NOT NULL -- Base64 encoded Yjs state snapshot
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_versions_timestamp ON document_versions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_versions_author ON document_versions(author_id);
CREATE INDEX IF NOT EXISTS idx_versions_parent ON document_versions(parent_id);

-- DISABLE Row Level Security for Clerk compatibility
ALTER TABLE document_versions DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view versions of their documents" ON document_versions;
DROP POLICY IF EXISTS "Users can create versions for their documents" ON document_versions;
DROP POLICY IF EXISTS "Users can delete versions of their documents" ON document_versions;

-- Verification query
-- Run this to verify the table exists and RLS is disabled
-- SELECT
--   tablename,
--   rowsecurity
-- FROM pg_tables
-- WHERE tablename = 'document_versions';
-- Result should show rowsecurity = false
