-- Area 7: Gamification Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROGRESS & XP TABLES
-- ============================================

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
  xp_this_week INTEGER DEFAULT 0 CHECK (xp_this_week >= 0),
  xp_this_month INTEGER DEFAULT 0 CHECK (xp_this_month >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP transaction history
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STREAK TABLES
-- ============================================

-- User streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  streak_freezes_available INTEGER DEFAULT 2 CHECK (streak_freezes_available >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streak activity history
CREATE TABLE IF NOT EXISTS streak_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_type TEXT DEFAULT 'login',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- ============================================
-- ACHIEVEMENT TABLES
-- ============================================

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT CHECK (category IN ('learning', 'consistency', 'social', 'productivity')),
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')) DEFAULT 'bronze',
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- DAILY CHALLENGES TABLES
-- ============================================

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  active_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_total_xp ON user_progress(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_level ON user_progress(current_level DESC);

-- XP transactions indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at DESC);

-- Streak indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_current_streak ON user_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_streak_history_user_date ON streak_history(user_id, activity_date DESC);

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked, unlocked_at DESC);

-- Challenge indexes
CREATE INDEX IF NOT EXISTS idx_daily_challenges_active_date ON daily_challenges(active_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- XP transactions policies
CREATE POLICY "Users can view their own transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON xp_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Streak policies
CREATE POLICY "Users can view their own streaks"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own streaks"
  ON user_streaks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own streak history"
  ON streak_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak history"
  ON streak_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Achievement policies
CREATE POLICY "Everyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own achievement progress"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own achievement progress"
  ON user_achievements FOR ALL
  USING (auth.uid() = user_id);

-- Challenge policies
CREATE POLICY "Everyone can view daily challenges"
  ON daily_challenges FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own challenge progress"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own challenge progress"
  ON user_challenges FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gamification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_updated_at();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_updated_at();

-- ============================================
-- SEED DATA - ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (name, description, category, tier, icon, xp_reward, requirement_type, requirement_value)
VALUES
  -- Learning Achievements
  ('First Steps', 'Complete your first task', 'learning', 'bronze', '🎯', 50, 'tasks_completed', 1),
  ('Knowledge Seeker', 'Complete 10 roadmap sessions', 'learning', 'silver', '📚', 100, 'roadmap_sessions', 10),
  ('Master Student', 'Reach level 10', 'learning', 'gold', '🎓', 250, 'level_reached', 10),
  ('Expert Learner', 'Complete 50 roadmap sessions', 'learning', 'platinum', '👨‍🎓', 500, 'roadmap_sessions', 50),
  
  -- Consistency Achievements
  ('Week Warrior', 'Maintain a 7-day streak', 'consistency', 'silver', '🔥', 100, 'streak_days', 7),
  ('Month Master', 'Maintain a 30-day streak', 'consistency', 'gold', '📅', 250, 'streak_days', 30),
  ('Year Legend', 'Maintain a 365-day streak', 'consistency', 'platinum', '👑', 500, 'streak_days', 365),
  
  -- Social Achievements
  ('Helper', 'Help 5 community members', 'social', 'bronze', '🤝', 50, 'community_helps', 5),
  ('Mentor', 'Help 50 community members', 'social', 'gold', '👨‍🏫', 250, 'community_helps', 50),
  ('Community Hero', 'Help 100 community members', 'social', 'platinum', '🦸', 500, 'community_helps', 100),
  
  -- Productivity Achievements
  ('Focused', 'Complete 1 focus session', 'productivity', 'bronze', '🎯', 50, 'focus_sessions', 1),
  ('Task Master', 'Complete 50 tasks', 'productivity', 'silver', '✅', 100, 'tasks_completed', 50),
  ('Task Crusher', 'Complete 100 tasks', 'productivity', 'gold', '💪', 250, 'tasks_completed', 100),
  ('Focus Master', 'Complete 10 hours in focus room', 'productivity', 'platinum', '🧘', 500, 'focus_hours', 10)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED DATA - DAILY CHALLENGES (Sample)
-- ============================================

INSERT INTO daily_challenges (challenge_type, title, description, requirement_value, xp_reward, difficulty, active_date)
VALUES
  ('tasks', 'Task Warrior', 'Complete 3 tasks today', 3, 50, 'easy', CURRENT_DATE),
  ('study', 'Study Session', 'Study for 2 hours', 120, 75, 'medium', CURRENT_DATE),
  ('social', 'Community Helper', 'Help 2 community members', 2, 60, 'medium', CURRENT_DATE)
ON CONFLICT DO NOTHING;
