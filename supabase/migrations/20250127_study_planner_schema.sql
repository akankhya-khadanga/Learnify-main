-- Study Planner Schema
-- Tables for managing study plans, tasks, exams, and AI-generated schedules

-- Study Plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Tasks table
CREATE TABLE IF NOT EXISTS study_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  estimated_hours DECIMAL(5,2),
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  notes TEXT,
  importance TEXT CHECK (importance IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  preparation_status TEXT CHECK (preparation_status IN ('not_started', 'in_progress', 'ready')) DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Schedules table (AI-generated)
CREATE TABLE IF NOT EXISTS daily_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_hours DECIMAL(5,2),
  tasks JSONB NOT NULL DEFAULT '[]', -- Array of {task_id, allocated_hours, time_slot}
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Workload tracking table
CREATE TABLE IF NOT EXISTS workload_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_hours DECIMAL(5,2) DEFAULT 0,
  intensity TEXT CHECK (intensity IN ('light', 'moderate', 'heavy', 'extreme')) DEFAULT 'moderate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_user_id ON study_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_plan_id ON study_tasks(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_deadline ON study_tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_daily_schedules_user_date ON daily_schedules(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workload_days_user_date ON workload_days(user_id, date);

-- Row Level Security (RLS) Policies
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workload_days ENABLE ROW LEVEL SECURITY;

-- Policies for study_plans
CREATE POLICY "Users can view their own study plans"
  ON study_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans"
  ON study_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans"
  ON study_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans"
  ON study_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for study_tasks
CREATE POLICY "Users can view their own tasks"
  ON study_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON study_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON study_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON study_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for exams
CREATE POLICY "Users can view their own exams"
  ON exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exams"
  ON exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams"
  ON exams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams"
  ON exams FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for daily_schedules
CREATE POLICY "Users can view their own schedules"
  ON daily_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
  ON daily_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON daily_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON daily_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for workload_days
CREATE POLICY "Users can view their own workload"
  ON workload_days FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workload"
  ON workload_days FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workload"
  ON workload_days FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workload"
  ON workload_days FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON study_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_tasks_updated_at
  BEFORE UPDATE ON study_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
