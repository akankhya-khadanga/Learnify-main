-- Combined Phase 1 Database Migrations
-- Run this SQL in your Supabase SQL Editor
-- Date: 2025-01-28

-- ============================================
-- MIGRATION 1: PDF Annotator Schema
-- ============================================

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
DROP POLICY IF EXISTS "Users can view their own PDF documents" ON pdf_documents;
CREATE POLICY "Users can view their own PDF documents"
  ON pdf_documents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own PDF documents" ON pdf_documents;
CREATE POLICY "Users can insert their own PDF documents"
  ON pdf_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own PDF documents" ON pdf_documents;
CREATE POLICY "Users can update their own PDF documents"
  ON pdf_documents FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own PDF documents" ON pdf_documents;
CREATE POLICY "Users can delete their own PDF documents"
  ON pdf_documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pdf_annotations
DROP POLICY IF EXISTS "Users can view their own annotations" ON pdf_annotations;
CREATE POLICY "Users can view their own annotations"
  ON pdf_annotations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own annotations" ON pdf_annotations;
CREATE POLICY "Users can insert their own annotations"
  ON pdf_annotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own annotations" ON pdf_annotations;
CREATE POLICY "Users can update their own annotations"
  ON pdf_annotations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own annotations" ON pdf_annotations;
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
DROP TRIGGER IF EXISTS update_pdf_documents_updated_at ON pdf_documents;
CREATE TRIGGER update_pdf_documents_updated_at
  BEFORE UPDATE ON pdf_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pdf_annotations_updated_at ON pdf_annotations;
CREATE TRIGGER update_pdf_annotations_updated_at
  BEFORE UPDATE ON pdf_annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for PDFs (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for PDFs bucket
DROP POLICY IF EXISTS "Users can upload their own PDFs" ON storage.objects;
CREATE POLICY "Users can upload their own PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view their own PDFs" ON storage.objects;
CREATE POLICY "Users can view their own PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own PDFs" ON storage.objects;
CREATE POLICY "Users can update their own PDFs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own PDFs" ON storage.objects;
CREATE POLICY "Users can delete their own PDFs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- MIGRATION 2: Study Pattern Analysis
-- ============================================

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  activity_type TEXT,
  activity_id UUID,
  productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_time ON study_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_activity ON study_sessions(user_id, activity_type);

-- Enable Row Level Security
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_sessions
DROP POLICY IF EXISTS "Users can view their own study sessions" ON study_sessions;
CREATE POLICY "Users can view their own study sessions"
  ON study_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own study sessions" ON study_sessions;
CREATE POLICY "Users can insert their own study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own study sessions" ON study_sessions;
CREATE POLICY "Users can update their own study sessions"
  ON study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own study sessions" ON study_sessions;
CREATE POLICY "Users can delete their own study sessions"
  ON study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to calculate duration when session ends
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for duration calculation
DROP TRIGGER IF EXISTS calculate_study_session_duration ON study_sessions;
CREATE TRIGGER calculate_study_session_duration
  BEFORE INSERT OR UPDATE ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_duration();

-- Create materialized view for study pattern analytics
-- Drop existing view first to avoid schema conflicts
DROP MATERIALIZED VIEW IF EXISTS study_pattern_stats CASCADE;
CREATE MATERIALIZED VIEW study_pattern_stats AS
SELECT 
  user_id,
  EXTRACT(DOW FROM started_at)::INTEGER as day_of_week,
  EXTRACT(HOUR FROM started_at)::INTEGER as hour_of_day,
  activity_type,
  COUNT(*)::BIGINT as session_count,
  AVG(duration_minutes)::NUMERIC as avg_duration,
  SUM(duration_minutes)::NUMERIC as total_duration,
  AVG(productivity_score)::NUMERIC as avg_productivity
FROM study_sessions
WHERE ended_at IS NOT NULL
GROUP BY user_id, day_of_week, hour_of_day, activity_type;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_study_pattern_stats_user ON study_pattern_stats(user_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_study_pattern_stats()
RETURNS void AS $$
BEGIN
  -- Check if view exists before refreshing
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE matviewname = 'study_pattern_stats'
  ) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY study_pattern_stats;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION 3: Habit Tracker
-- ============================================

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '✓',
  color TEXT DEFAULT '#8b5cf6',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_at)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON habit_completions(user_id, completed_at);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits
DROP POLICY IF EXISTS "Users can view their own habits" ON habits;
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own habits" ON habits;
CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own habits" ON habits;
CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habit_completions
DROP POLICY IF EXISTS "Users can view their own completions" ON habit_completions;
CREATE POLICY "Users can view their own completions"
  ON habit_completions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own completions" ON habit_completions;
CREATE POLICY "Users can insert their own completions"
  ON habit_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own completions" ON habit_completions;
CREATE POLICY "Users can update their own completions"
  ON habit_completions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own completions" ON habit_completions;
CREATE POLICY "Users can delete their own completions"
  ON habit_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_habit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_updated_at();

-- Create function to calculate current streak
CREATE OR REPLACE FUNCTION calculate_habit_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_has_completion BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM habit_completions
      WHERE habit_id = p_habit_id
      AND completed_at = v_current_date
    ) INTO v_has_completion;
    
    IF NOT v_has_completion THEN
      EXIT;
    END IF;
    
    v_streak := v_streak + 1;
    v_current_date := v_current_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- Create view for habit statistics
CREATE OR REPLACE VIEW habit_stats AS
SELECT 
  h.id as habit_id,
  h.user_id,
  h.title,
  h.icon,
  h.color,
  COUNT(hc.id) as total_completions,
  MAX(hc.completed_at) as last_completed,
  calculate_habit_streak(h.id) as current_streak,
  (
    SELECT COUNT(DISTINCT completed_at)
    FROM habit_completions
    WHERE habit_id = h.id
    AND completed_at >= CURRENT_DATE - INTERVAL '7 days'
  ) as completions_this_week,
  (
    SELECT COUNT(DISTINCT completed_at)
    FROM habit_completions
    WHERE habit_id = h.id
    AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
  ) as completions_this_month
FROM habits h
LEFT JOIN habit_completions hc ON h.id = hc.habit_id
WHERE h.is_active = true
GROUP BY h.id, h.user_id, h.title, h.icon, h.color;

-- ============================================
-- MIGRATION 4: User Profile Updates
-- ============================================

-- Add email preference columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS weekly_reports_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS monthly_reports_enabled BOOLEAN DEFAULT false;

-- ============================================
-- DONE! All Phase 1 migrations complete
-- ============================================
