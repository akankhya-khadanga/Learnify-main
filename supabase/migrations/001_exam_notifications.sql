-- =====================================================
-- EXAM NOTIFICATIONS SYSTEM
-- Production-ready schema for global countdown notifications
-- =====================================================

-- Create exam_schedules table
CREATE TABLE IF NOT EXISTS exam_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Exam Details
  exam_name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  exam_time TIME,
  subject TEXT,
  location TEXT,
  duration_minutes INTEGER DEFAULT 180,
  topics TEXT[], -- Array of topics to study
  
  -- Metadata
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high')),
  color TEXT DEFAULT '#C9B458',
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT future_exam_date CHECK (exam_date >= CURRENT_DATE)
);

-- Create index for faster queries
CREATE INDEX idx_exam_schedules_user_id ON exam_schedules(user_id);
CREATE INDEX idx_exam_schedules_exam_date ON exam_schedules(exam_date);
CREATE INDEX idx_exam_schedules_user_date ON exam_schedules(user_id, exam_date);

-- Enable Row Level Security (RLS)
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own exams
CREATE POLICY "Users can view own exam schedules"
  ON exam_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam schedules"
  ON exam_schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exam schedules"
  ON exam_schedules
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exam schedules"
  ON exam_schedules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exam_schedule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER exam_schedule_updated_at
  BEFORE UPDATE ON exam_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_exam_schedule_timestamp();

-- Function to clean up past exams (optional cleanup job)
CREATE OR REPLACE FUNCTION delete_past_exams(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM exam_schedules
  WHERE exam_date < CURRENT_DATE - days_old
  RETURNING id INTO deleted_count;
  
  RETURN COALESCE(deleted_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON exam_schedules TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE exam_schedules IS 'Stores user exam schedules for countdown notifications';
COMMENT ON COLUMN exam_schedules.exam_name IS 'Name of the exam (e.g., "JEE Main 2025", "Math Final")';
COMMENT ON COLUMN exam_schedules.exam_date IS 'Date of the exam (used for countdown calculation)';
COMMENT ON COLUMN exam_schedules.importance IS 'Priority level: high, medium, or low';
COMMENT ON COLUMN exam_schedules.topics IS 'Array of topics to cover for this exam';
