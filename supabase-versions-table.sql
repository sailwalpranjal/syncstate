-- Document Versions Table
-- This table stores version snapshots for time-travel and version history
-- Run this in your Supabase SQL editor to add version tracking

-- Document versions table
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

-- Row Level Security (RLS) Policies
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Allow users to view versions of documents they own or collaborate on
CREATE POLICY "Users can view versions of their documents"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
      AND (
        documents.owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR documents.is_public = true
        OR EXISTS (
          SELECT 1 FROM document_collaborators
          WHERE document_collaborators.document_id = documents.id
          AND document_collaborators.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
      )
    )
  );

-- Allow users to create versions for documents they own or have write access to
CREATE POLICY "Users can create versions for their documents"
  ON document_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
      AND (
        documents.owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR EXISTS (
          SELECT 1 FROM document_collaborators
          WHERE document_collaborators.document_id = documents.id
          AND document_collaborators.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
          AND document_collaborators.permission IN ('write', 'admin')
        )
      )
    )
  );

-- Allow users to delete versions of documents they own
CREATE POLICY "Users can delete versions of their documents"
  ON document_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
      AND documents.owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Verification query
-- SELECT
--   dv.id,
--   dv.document_id,
--   dv.timestamp,
--   dv.author,
--   dv.message,
--   dv.parent_id,
--   d.title as document_title
-- FROM document_versions dv
-- JOIN documents d ON d.id = dv.document_id
-- ORDER BY dv.timestamp DESC;
