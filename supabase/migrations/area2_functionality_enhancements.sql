-- Area 2: Functionality Enhancements Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WORKSPACES TABLES
-- ============================================

-- Main workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  tools JSONB DEFAULT '[]'::jsonb,
  layout_mode TEXT DEFAULT 'grid' CHECK (layout_mode IN ('grid', 'split', 'freeform')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace tools table (optional, for more structured tool storage)
CREATE TABLE IF NOT EXISTS workspace_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  title TEXT NOT NULL,
  position JSONB,
  is_maximized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace sharing table
CREATE TABLE IF NOT EXISTS workspace_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT CHECK (permission_level IN ('view', 'edit', 'admin')) DEFAULT 'view',
  share_link TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WELLNESS TABLES
-- ============================================

-- Wellness logs table
CREATE TABLE IF NOT EXISTS wellness_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN ('mood', 'meditation', 'breathing', 'exercise')) NOT NULL,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  duration_minutes INTEGER CHECK (duration_minutes >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TASKS TABLES
-- ============================================

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Workspaces indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_updated_at ON workspaces(updated_at DESC);

-- Workspace tools indexes
CREATE INDEX IF NOT EXISTS idx_workspace_tools_workspace_id ON workspace_tools(workspace_id);

-- Workspace shares indexes
CREATE INDEX IF NOT EXISTS idx_workspace_shares_workspace_id ON workspace_shares(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_shares_user_id ON workspace_shares(shared_with_user_id);

-- Wellness logs indexes
CREATE INDEX IF NOT EXISTS idx_wellness_logs_user_id ON wellness_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_logs_created_at ON wellness_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_logs_activity_type ON wellness_logs(activity_type);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_task_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view their own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- Workspace tools policies
CREATE POLICY "Users can manage tools in their workspaces"
  ON workspace_tools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_tools.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Workspace shares policies
CREATE POLICY "Users can view shares for their workspaces"
  ON workspace_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_shares.workspace_id
      AND workspaces.user_id = auth.uid()
    )
    OR shared_with_user_id = auth.uid()
  );

CREATE POLICY "Users can create shares for their workspaces"
  ON workspace_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_shares.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shares for their workspaces"
  ON workspace_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_shares.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Wellness logs policies
CREATE POLICY "Users can view their own wellness logs"
  ON wellness_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness logs"
  ON wellness_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness logs"
  ON wellness_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workspaces
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tasks
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data
/*
INSERT INTO workspaces (user_id, name, type, tools, layout_mode)
VALUES (
  auth.uid(),
  'My First Workspace',
  'development',
  '["code-editor", "ai-tutor", "notes"]'::jsonb,
  'grid'
);
*/
