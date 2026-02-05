-- AI-Powered Roadmaps Migration (CLEAN VERSION)
-- Drops existing objects if they exist, then recreates everything

-- ============================================================================
-- DROP EXISTING POLICIES (if any)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own roadmaps" ON user_roadmaps;
DROP POLICY IF EXISTS "Users can insert their own roadmaps" ON user_roadmaps;
DROP POLICY IF EXISTS "Users can update their own roadmaps" ON user_roadmaps;
DROP POLICY IF EXISTS "Users can delete their own roadmaps" ON user_roadmaps;

DROP POLICY IF EXISTS "Users can view milestones of their roadmaps" ON roadmap_milestones;
DROP POLICY IF EXISTS "Users can insert milestones to their roadmaps" ON roadmap_milestones;
DROP POLICY IF EXISTS "Users can update milestones of their roadmaps" ON roadmap_milestones;
DROP POLICY IF EXISTS "Users can delete milestones of their roadmaps" ON roadmap_milestones;

DROP POLICY IF EXISTS "Users can view their own progress" ON roadmap_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON roadmap_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON roadmap_progress;

DROP POLICY IF EXISTS "Users can view their own time tracking" ON roadmap_time_tracking;
DROP POLICY IF EXISTS "Users can insert their own time tracking" ON roadmap_time_tracking;

-- ============================================================================
-- DROP EXISTING TRIGGERS (if any)
-- ============================================================================

DROP TRIGGER IF EXISTS update_user_roadmaps_updated_at ON user_roadmaps;
DROP TRIGGER IF EXISTS update_roadmap_milestones_updated_at ON roadmap_milestones;
DROP TRIGGER IF EXISTS update_roadmap_progress_updated_at ON roadmap_progress;
DROP TRIGGER IF EXISTS sync_progress_on_milestone_update ON roadmap_milestones;

-- ============================================================================
-- DROP EXISTING FUNCTIONS (if any)
-- ============================================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS sync_roadmap_progress() CASCADE;
DROP FUNCTION IF EXISTS get_roadmap_analytics(UUID);

-- ============================================================================
-- DROP EXISTING INDEXES (if any)
-- ============================================================================

DROP INDEX IF EXISTS idx_user_roadmaps_user_id;
DROP INDEX IF EXISTS idx_user_roadmaps_created_at;
DROP INDEX IF EXISTS idx_user_roadmaps_category;
DROP INDEX IF EXISTS idx_roadmap_milestones_roadmap_id;
DROP INDEX IF EXISTS idx_roadmap_milestones_order;
DROP INDEX IF EXISTS idx_roadmap_progress_user_milestone;
DROP INDEX IF EXISTS idx_roadmap_progress_roadmap;
DROP INDEX IF EXISTS idx_time_tracking_user_roadmap;
DROP INDEX IF EXISTS idx_time_tracking_session_start;

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  category TEXT DEFAULT 'Custom',
  tags TEXT[] DEFAULT '{}',
  
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  estimated_duration TEXT,
  source TEXT CHECK (source IN ('ai', 'template', 'custom')) DEFAULT 'ai',
  
  progress_percentage DECIMAL(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  total_milestones INTEGER DEFAULT 0,
  completed_milestones INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  is_deleted BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT valid_progress CHECK (completed_milestones <= total_milestones)
);

CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES user_roadmaps(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  
  skills TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  exercises TEXT[] DEFAULT '{}',
  projects TEXT[] DEFAULT '{}',
  
  resources JSONB DEFAULT '[]',
  
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  estimated_hours DECIMAL(5,1) DEFAULT 0,
  
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  
  user_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES user_roadmaps(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES roadmap_milestones(id) ON DELETE CASCADE,
  
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
  completion_percentage DECIMAL(5,2) DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  completed_resource_ids TEXT[] DEFAULT '{}',
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_studied_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, milestone_id)
);

CREATE TABLE IF NOT EXISTS roadmap_time_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES user_roadmaps(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES roadmap_milestones(id) ON DELETE CASCADE,
  
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  activity_type TEXT DEFAULT 'study',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_user_roadmaps_user_id ON user_roadmaps(user_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_user_roadmaps_created_at ON user_roadmaps(created_at DESC);
CREATE INDEX idx_user_roadmaps_category ON user_roadmaps(category);

CREATE INDEX idx_roadmap_milestones_roadmap_id ON roadmap_milestones(roadmap_id);
CREATE INDEX idx_roadmap_milestones_order ON roadmap_milestones(roadmap_id, order_index);

CREATE INDEX idx_roadmap_progress_user_milestone ON roadmap_progress(user_id, milestone_id);
CREATE INDEX idx_roadmap_progress_roadmap ON roadmap_progress(roadmap_id);

CREATE INDEX idx_time_tracking_user_roadmap ON roadmap_time_tracking(user_id, roadmap_id);
CREATE INDEX idx_time_tracking_session_start ON roadmap_time_tracking(session_start DESC);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_time_tracking ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE POLICIES
-- ============================================================================

-- USER_ROADMAPS
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

-- ROADMAP_MILESTONES
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

-- ROADMAP_PROGRESS
CREATE POLICY "Users can view their own progress"
  ON roadmap_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON roadmap_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON roadmap_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ROADMAP_TIME_TRACKING
CREATE POLICY "Users can view their own time tracking"
  ON roadmap_time_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time tracking"
  ON roadmap_time_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CREATE FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_roadmap_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = TRUE)
  INTO total_count, completed_count
  FROM roadmap_milestones
  WHERE roadmap_id = NEW.roadmap_id;
  
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
-- CREATE TRIGGERS
-- ============================================================================

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

CREATE TRIGGER sync_progress_on_milestone_update
  AFTER UPDATE OF is_completed ON roadmap_milestones
  FOR EACH ROW
  WHEN (OLD.is_completed IS DISTINCT FROM NEW.is_completed)
  EXECUTE FUNCTION sync_roadmap_progress();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ AI Roadmap tables created successfully!';
  RAISE NOTICE '📊 Tables: user_roadmaps, roadmap_milestones, roadmap_progress, roadmap_time_tracking';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '🚀 Ready to create AI-powered roadmaps!';
END $$;
