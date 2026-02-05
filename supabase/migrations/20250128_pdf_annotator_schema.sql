-- Create PDF Documents and Annotations Tables
-- Migration: 20250128_pdf_annotator_schema.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pdf_documents table
CREATE TABLE IF NOT EXISTS pdf_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  page_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pdf_annotations table
CREATE TABLE IF NOT EXISTS pdf_annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES pdf_documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_number INTEGER NOT NULL,
  annotation_type TEXT NOT NULL CHECK (annotation_type IN ('highlight', 'drawing', 'text', 'note')),
  annotation_data JSONB NOT NULL,
  color TEXT DEFAULT '#FFFF00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pdf_documents_user_id ON pdf_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_annotations_document_id ON pdf_annotations(document_id);
CREATE INDEX IF NOT EXISTS idx_pdf_annotations_user_id ON pdf_annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_annotations_page ON pdf_annotations(document_id, page_number);

-- Enable Row Level Security
ALTER TABLE pdf_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_annotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pdf_documents
CREATE POLICY "Users can view their own PDF documents"
  ON pdf_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PDF documents"
  ON pdf_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PDF documents"
  ON pdf_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PDF documents"
  ON pdf_documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pdf_annotations
CREATE POLICY "Users can view their own annotations"
  ON pdf_annotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own annotations"
  ON pdf_annotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annotations"
  ON pdf_annotations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annotations"
  ON pdf_annotations FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pdf_documents_updated_at
  BEFORE UPDATE ON pdf_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdf_annotations_updated_at
  BEFORE UPDATE ON pdf_annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for PDFs (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for PDFs bucket
CREATE POLICY "Users can upload their own PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own PDFs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own PDFs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
