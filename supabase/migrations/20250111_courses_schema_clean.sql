-- ============================================
-- COURSES FUNCTIONALITY - CLEAN MIGRATION
-- ============================================
-- This is a clean migration that removes any existing
-- courses tables and recreates them from scratch.
-- Safe to run even if tables exist.
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: Drop existing tables (CASCADE removes all dependencies)
-- ============================================

-- Drop tables in reverse order of dependencies
-- CASCADE will automatically drop all associated policies, triggers, and constraints
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS user_course_progress CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_course_module_count() CASCADE;
DROP FUNCTION IF EXISTS update_courses_updated_at() CASCADE;

-- ============================================
-- STEP 2: Create Courses Table
-- ============================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  
  -- Basic Information
  title TEXT NOT NULL,
  description TEXT,
  
  -- Internationalization
  primary_language TEXT DEFAULT 'en',
  translated_languages JSONB DEFAULT '{}',
  
  -- Classification
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Course Structure
  total_modules INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 30,
  estimated_hours INTEGER DEFAULT 0,
  
  -- Media
  cover_image_url TEXT,
  
  -- Status & Metadata
  published BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  meta JSONB DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_courses_owner_id ON courses(owner_id);
CREATE INDEX idx_courses_published ON courses(published) WHERE published = true;
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_tags ON courses USING GIN(tags);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);

-- ============================================
-- STEP 3: Create Modules Table
-- ============================================

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  
  content JSONB DEFAULT '{}',
  time_required INTEGER DEFAULT 60,
  
  flashcards JSONB DEFAULT '[]',
  practice_tasks JSONB DEFAULT '[]',
  quiz JSONB DEFAULT '{"questions": []}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, module_number)
);

CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_modules_course_number ON modules(course_id, module_number);

-- ============================================
-- STEP 4: Create User Course Progress Table
-- ============================================

CREATE TABLE user_course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  
  completed_modules INTEGER DEFAULT 0,
  progress_percentage NUMERIC(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  quiz_scores JSONB DEFAULT '{}',
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX idx_user_course_progress_last_accessed ON user_course_progress(last_accessed DESC);

-- ============================================
-- STEP 5: Create Course Enrollments Table
-- ============================================

CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
  completed_at TIMESTAMPTZ,
  
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);

-- ============================================
-- STEP 6: Enable Row Level Security
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: RLS Policies for Courses
-- ============================================

CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT
  USING (published = true OR auth.uid() = owner_id);

CREATE POLICY "Users can create their own courses" ON courses
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own courses" ON courses
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own courses" ON courses
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- STEP 8: RLS Policies for Modules
-- ============================================

CREATE POLICY "Anyone can view modules of published courses" ON modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id 
      AND (courses.published = true OR courses.owner_id = auth.uid())
    )
  );

CREATE POLICY "Course owners can insert modules" ON modules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id 
      AND courses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Course owners can update modules" ON modules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id 
      AND courses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Course owners can delete modules" ON modules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id 
      AND courses.owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 9: RLS Policies for Progress
-- ============================================

CREATE POLICY "Users can view their own progress" ON user_course_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" ON user_course_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_course_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON user_course_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 10: RLS Policies for Enrollments
-- ============================================

CREATE POLICY "Users can view their own enrollments" ON course_enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses" ON course_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their enrollments" ON course_enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their enrollments" ON course_enrollments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 11: Triggers and Functions
-- ============================================

CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_timestamp BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

CREATE TRIGGER update_modules_timestamp BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

CREATE TRIGGER update_user_course_progress_timestamp BEFORE UPDATE ON user_course_progress
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

CREATE TRIGGER update_course_enrollments_timestamp BEFORE UPDATE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

CREATE OR REPLACE FUNCTION update_course_module_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses
  SET total_modules = (
    SELECT COUNT(*) FROM modules WHERE course_id = NEW.course_id
  )
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_modules_count AFTER INSERT ON modules
  FOR EACH ROW EXECUTE FUNCTION update_course_module_count();

-- ============================================
-- SUCCESS!
-- ============================================

SELECT 'Courses migration completed successfully!' as status;
