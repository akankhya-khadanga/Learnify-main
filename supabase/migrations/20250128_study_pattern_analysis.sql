-- Create Study Sessions Table for Analytics
-- Migration: 20250128_study_pattern_analysis.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  activity_type TEXT, -- 'notes', 'ai_tutor', 'vr', 'courses', 'workspace', etc.
  activity_id UUID, -- Reference to specific activity (note_id, course_id, etc.)
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
CREATE POLICY "Users can view their own study sessions"
  ON study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
  ON study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

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
CREATE TRIGGER calculate_study_session_duration
  BEFORE INSERT OR UPDATE ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_duration();

-- Create materialized view for study pattern analytics (for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS study_pattern_stats AS
SELECT 
  user_id,
  EXTRACT(DOW FROM started_at) as day_of_week, -- 0=Sunday, 6=Saturday
  EXTRACT(HOUR FROM started_at) as hour_of_day,
  activity_type,
  COUNT(*) as session_count,
  AVG(duration_minutes) as avg_duration,
  SUM(duration_minutes) as total_duration,
  AVG(productivity_score) as avg_productivity
FROM study_sessions
WHERE ended_at IS NOT NULL
GROUP BY user_id, day_of_week, hour_of_day, activity_type;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_study_pattern_stats_user ON study_pattern_stats(user_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_study_pattern_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY study_pattern_stats;
END;
$$ LANGUAGE plpgsql;

-- Note: You can set up a cron job to refresh this view periodically
-- For example, using pg_cron extension:
-- SELECT cron.schedule('refresh-study-stats', '0 * * * *', 'SELECT refresh_study_pattern_stats()');
