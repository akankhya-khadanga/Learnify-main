-- AI-Powered Roadmaps Migration
-- Creates tables for user-generated roadmaps with AI assistance

-- ============================================================================
-- USER ROADMAPS TABLE
-- Stores AI-generated and custom roadmaps for users
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core roadmap info
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  category TEXT DEFAULT 'Custom',
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  estimated_duration TEXT, -- e.g., "6 months", "12 weeks"
  source TEXT CHECK (source IN ('ai', 'template', 'custom')) DEFAULT 'ai',
  
  -- Progress tracking
  progress_percentage DECIMAL(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  total_milestones INTEGER DEFAULT 0,
  completed_milestones INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT valid_progress CHECK (completed_milestones <= total_milestones)
);

-- ============================================================================
-- ROADMAP MILESTONES TABLE
-- Individual milestones/stages within a roadmap
-- ============================================================================
CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES user_roadmaps(id) ON DELETE CASCADE,
  
  -- Milestone info
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  
  -- Learning content
  skills TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  exercises TEXT[] DEFAULT '{}',
  projects TEXT[] DEFAULT '{}',
  
  -- Resources (stored as JSONB for flexibility)
  resources JSONB DEFAULT '[]', -- Array of {type, title, url, description, is_free, completed}
  
  -- Difficulty & time
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  estimated_hours DECIMAL(5,1) DEFAULT 0,
  
  -- Progress
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  
  -- Notes
  user_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROADMAP PROGRESS TABLE
-- Detailed progress tracking per milestone
-- ============================================================================
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES user_roadmaps(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES roadmap_milestones(id) ON DELETE CASCADE,
  
  -- Progress details
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
  completion_percentage DECIMAL(5,2) DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Resources completed (array of resource IDs from milestone.resources)
  completed_resource_ids TEXT[] DEFAULT '{}',
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_studied_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, milestone_id)
);

-- ============================================================================
-- ROADMAP TIME TRACKING TABLE
-- Track study time for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS roadmap_time_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES user_roadmaps(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES roadmap_milestones(id) ON DELETE CASCADE,
  
  -- Time tracking
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Context
  activity_type TEXT DEFAULT 'study', -- 'study', 'practice', 'quiz', 'project'
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_roadmaps_user_id ON user_roadmaps(user_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_roadmaps_created_at ON user_roadmaps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roadmaps_category ON user_roadmaps(category);

CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_roadmap_id ON roadmap_milestones(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_order ON roadmap_milestones(roadmap_id, order_index);

CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_milestone ON roadmap_progress(user_id, milestone_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_roadmap ON roadmap_progress(roadmap_id);

CREATE INDEX IF NOT EXISTS idx_time_tracking_user_roadmap ON roadmap_time_tracking(user_id, roadmap_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_session_start ON roadmap_time_tracking(session_start DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_time_tracking ENABLE ROW LEVEL SECURITY;

-- USER_ROADMAPS policies
CREATE POLICY "Users can view their own roadmaps"
  ON user_roadmaps FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own roadmaps"
  ON user_roadmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON user_roadmaps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps"
  ON user_roadmaps FOR DELETE
  USING (auth.uid() = user_id);

-- ROADMAP_MILESTONES policies (via roadmap ownership)
CREATE POLICY "Users can view milestones of their roadmaps"
  ON roadmap_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roadmaps
      WHERE user_roadmaps.id = roadmap_milestones.roadmap_id
        AND user_roadmaps.user_id = auth.uid()
        AND user_roadmaps.is_deleted = FALSE
    )
  );

CREATE POLICY "Users can insert milestones to their roadmaps"
  ON roadmap_milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roadmaps
      WHERE user_roadmaps.id = roadmap_milestones.roadmap_id
        AND user_roadmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update milestones of their roadmaps"
  ON roadmap_milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roadmaps
      WHERE user_roadmaps.id = roadmap_milestones.roadmap_id
        AND user_roadmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete milestones of their roadmaps"
  ON roadmap_milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roadmaps
      WHERE user_roadmaps.id = roadmap_milestones.roadmap_id
        AND user_roadmaps.user_id = auth.uid()
    )
  );

-- ROADMAP_PROGRESS policies
CREATE POLICY "Users can view their own progress"
  ON roadmap_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON roadmap_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON roadmap_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ROADMAP_TIME_TRACKING policies
CREATE POLICY "Users can view their own time tracking"
  ON roadmap_time_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time tracking"
  ON roadmap_time_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_roadmaps_updated_at
  BEFORE UPDATE ON user_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_milestones_updated_at
  BEFORE UPDATE ON roadmap_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_progress_updated_at
  BEFORE UPDATE ON roadmap_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to sync roadmap progress stats
CREATE OR REPLACE FUNCTION sync_roadmap_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
BEGIN
  -- Count total and completed milestones
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = TRUE)
  INTO total_count, completed_count
  FROM roadmap_milestones
  WHERE roadmap_id = NEW.roadmap_id;
  
  -- Update roadmap stats
  UPDATE user_roadmaps
  SET 
    total_milestones = total_count,
    completed_milestones = completed_count,
    progress_percentage = CASE 
      WHEN total_count > 0 THEN (completed_count::DECIMAL / total_count * 100)
      ELSE 0
    END,
    completed_at = CASE
      WHEN completed_count = total_count AND total_count > 0 THEN NOW()
      ELSE NULL
    END
  WHERE id = NEW.roadmap_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-sync progress when milestone completed
CREATE TRIGGER sync_progress_on_milestone_update
  AFTER UPDATE OF is_completed ON roadmap_milestones
  FOR EACH ROW
  WHEN (OLD.is_completed IS DISTINCT FROM NEW.is_completed)
  EXECUTE FUNCTION sync_roadmap_progress();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get roadmap analytics
CREATE OR REPLACE FUNCTION get_roadmap_analytics(p_roadmap_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_milestones', COUNT(*),
    'completed_milestones', COUNT(*) FILTER (WHERE is_completed = TRUE),
    'in_progress_milestones', COUNT(*) FILTER (WHERE is_completed = FALSE AND time_spent_minutes > 0),
    'not_started_milestones', COUNT(*) FILTER (WHERE time_spent_minutes = 0),
    'total_time_minutes', COALESCE(SUM(time_spent_minutes), 0),
    'avg_time_per_milestone', COALESCE(AVG(time_spent_minutes) FILTER (WHERE is_completed = TRUE), 0),
    'estimated_remaining_hours', COALESCE(SUM(estimated_hours) FILTER (WHERE is_completed = FALSE), 0)
  )
  INTO result
  FROM roadmap_milestones
  WHERE roadmap_id = p_roadmap_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA VALIDATION
-- ============================================================================

-- Ensure all existing roadmaps tables are compatible
COMMENT ON TABLE user_roadmaps IS 'User-created roadmaps with AI assistance';
COMMENT ON TABLE roadmap_milestones IS 'Milestones within roadmaps';
COMMENT ON TABLE roadmap_progress IS 'User progress tracking per milestone';
COMMENT ON TABLE roadmap_time_tracking IS 'Study time analytics';
