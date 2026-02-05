-- ============================================
-- COURSES FUNCTIONALITY MIGRATION
-- ============================================
-- This migration creates the database schema for:
-- - Courses (AI-generated and user-created)
-- - Course Modules (lessons, content, quizzes)
-- - User Course Progress tracking
-- - Course Enrollment system
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: Create Courses Table
-- ============================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL, -- User who created the course
  
  -- Basic Information
  title TEXT NOT NULL,
  description TEXT,
  
  -- Internationalization
  primary_language TEXT DEFAULT 'en',
  translated_languages JSONB DEFAULT '{}',
  
  -- Classification
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT, -- tech, language, arts, upsc, medical, coding, school
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

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_courses_owner_id ON courses(owner_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- ============================================
-- STEP 2: Create Modules Table
-- ============================================

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  
  -- Module Structure
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  
  -- Content
  content JSONB DEFAULT '{}', -- Stores lesson content in structured format
  time_required INTEGER DEFAULT 60, -- Minutes
  
  -- Learning Materials
  flashcards JSONB DEFAULT '[]', -- Array of {question, answer} objects
  practice_tasks JSONB DEFAULT '[]', -- Array of {title, description, difficulty} objects
  
  -- Assessment
  quiz JSONB DEFAULT '{"questions": []}', -- Quiz structure with questions, options, answers
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(course_id, module_number)
);

-- Indexes for modules
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_number ON modules(course_id, module_number);

-- ============================================
-- STEP 3: Create User Course Progress Table
-- ============================================

CREATE TABLE IF NOT EXISTS user_course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL, -- User tracking progress
  
  -- Progress Tracking
  completed_modules INTEGER DEFAULT 0,
  progress_percentage NUMERIC(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Quiz Performance
  quiz_scores JSONB DEFAULT '{}', -- Stores module quiz scores: {module_1: 85, module_2: 90}
  
  -- Activity Tracking
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(course_id, user_id)
);

-- Indexes for progress tracking
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_last_accessed ON user_course_progress(last_accessed DESC);

-- ============================================
-- STEP 4: Create Course Enrollments Table
-- ============================================

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL, -- User enrolled in course
  
  -- Enrollment Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
  completed_at TIMESTAMPTZ,
  
  -- Timestamps
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(course_id, user_id)
);

-- Indexes for enrollments
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- ============================================
-- STEP 5: Enable Row Level Security
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Create RLS Policies for Courses
-- ============================================

-- Courses: Anyone can view published courses
CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT
  USING (published = true OR auth.uid() = owner_id);

-- Courses: Users can create their own courses
CREATE POLICY "Users can create their own courses" ON courses
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Courses: Users can update their own courses
CREATE POLICY "Users can update their own courses" ON courses
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Courses: Users can delete their own courses
CREATE POLICY "Users can delete their own courses" ON courses
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- STEP 7: Create RLS Policies for Modules
-- ============================================

-- Modules: Anyone can view modules of published courses
CREATE POLICY "Anyone can view modules of published courses" ON modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id 
      AND (courses.published = true OR courses.owner_id = auth.uid())
    )
  );

-- Modules: Course owners can manage modules
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
-- STEP 8: Create RLS Policies for Progress
-- ============================================

-- Progress: Users can view their own progress
CREATE POLICY "Users can view their own progress" ON user_course_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Progress: Users can create their own progress
CREATE POLICY "Users can create their own progress" ON user_course_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Progress: Users can update their own progress
CREATE POLICY "Users can update their own progress" ON user_course_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Progress: Users can delete their own progress
CREATE POLICY "Users can delete their own progress" ON user_course_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 9: Create RLS Policies for Enrollments
-- ============================================

-- Enrollments: Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Enrollments: Users can enroll in courses
CREATE POLICY "Users can enroll in courses" ON course_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enrollments: Users can update their enrollment status
CREATE POLICY "Users can update their enrollments" ON course_enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Enrollments: Users can delete their enrollments
CREATE POLICY "Users can delete their enrollments" ON course_enrollments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 10: Create Triggers for Updated At
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_courses_timestamp BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

CREATE TRIGGER update_modules_timestamp BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

CREATE TRIGGER update_user_course_progress_timestamp BEFORE UPDATE ON user_course_progress
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

CREATE TRIGGER update_course_enrollments_timestamp BEFORE UPDATE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

-- ============================================
-- STEP 11: Create Helper Functions
-- ============================================

-- Function to automatically update course module count
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

-- Trigger to update module count when modules are added
CREATE TRIGGER update_course_modules_count AFTER INSERT ON modules
  FOR EACH ROW EXECUTE FUNCTION update_course_module_count();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Courses migration completed successfully!';
  RAISE NOTICE 'Created tables: courses, modules, user_course_progress, course_enrollments';
  RAISE NOTICE 'All RLS policies and triggers have been set up.';
END $$;
