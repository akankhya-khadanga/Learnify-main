-- Create Habits and Habit Completions Tables
-- Migration: 20250128_habit_tracker.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '✓',
  color TEXT DEFAULT '#8b5cf6',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- Days of week (1=Monday, 7=Sunday)
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
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habit_completions
CREATE POLICY "Users can view their own completions"
  ON habit_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON habit_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
  ON habit_completions FOR UPDATE
  USING (auth.uid() = user_id);

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
  -- Check backwards from today
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
