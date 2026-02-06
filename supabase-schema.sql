-- SyncState Database Schema
-- This file contains the complete database schema for SyncState
-- Run this in your Supabase SQL editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table (stores metadata only, not content)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE
);

-- Document collaborators table
CREATE TABLE IF NOT EXISTS document_collaborators (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  permission TEXT CHECK (permission IN ('read', 'write', 'admin')) NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (document_id, user_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON document_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_document ON document_collaborators(document_id);

-- Row Level Security (RLS) Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;

-- Documents policies
-- Allow users to see their own documents and public documents
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub' OR is_public = true);

-- Allow users to view documents they collaborate on
CREATE POLICY "Users can view documents they collaborate on"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_collaborators.document_id = documents.id
      AND document_collaborators.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Allow users to insert their own documents
CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  WITH CHECK (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Document collaborators policies
-- Allow users to view collaborators of documents they own or collaborate on
CREATE POLICY "Users can view collaborators of their documents"
  ON document_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_collaborators.document_id
      AND (
        documents.owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR EXISTS (
          SELECT 1 FROM document_collaborators dc
          WHERE dc.document_id = documents.id
          AND dc.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
      )
    )
  );

-- Allow document owners to add collaborators
CREATE POLICY "Document owners can add collaborators"
  ON document_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_collaborators.document_id
      AND documents.owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Allow document owners to remove collaborators
CREATE POLICY "Document owners can remove collaborators"
  ON document_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_collaborators.document_id
      AND documents.owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on document changes
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional - comment out for production)
-- INSERT INTO documents (title, owner_id, is_public) VALUES
--   ('Welcome to SyncState', 'user_123', true),
--   ('Team Meeting Notes', 'user_123', false);

-- Verification queries (run these to verify setup)
-- SELECT * FROM documents;
-- SELECT * FROM document_collaborators;
