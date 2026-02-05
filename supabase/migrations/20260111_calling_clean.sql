-- ============================================
-- AUDIO/VIDEO CALLING SYSTEM - CLEAN MIGRATION
-- ============================================
-- This migration safely drops existing objects and recreates them
-- ============================================

-- ============================================
-- CLEANUP: Drop existing tables and policies
-- ============================================

-- Drop tables (CASCADE will drop all policies automatically)
DROP TABLE IF EXISTS call_participants CASCADE;
DROP TABLE IF EXISTS call_sessions CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_calling_updated_at() CASCADE;
DROP FUNCTION IF EXISTS calculate_call_duration() CASCADE;

-- ============================================
-- STEP 1: Create Call Sessions Table
-- ============================================

CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Call Information
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video', 'group_audio', 'group_video')),
  room_id TEXT UNIQUE NOT NULL,
  
  -- Initiator
  initiator_id UUID NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'ringing' CHECK (status IN ('ringing', 'active', 'ended', 'missed', 'declined')),
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_call_sessions_initiator ON call_sessions(initiator_id);
CREATE INDEX idx_call_sessions_status ON call_sessions(status);
CREATE INDEX idx_call_sessions_created_at ON call_sessions(created_at DESC);
CREATE INDEX idx_call_sessions_room_id ON call_sessions(room_id);

-- ============================================
-- STEP 2: Create Call Participants Table
-- ============================================

CREATE TABLE call_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  call_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  
  -- Participant Status
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'rejected')),
  
  -- Media Settings
  is_video_enabled BOOLEAN DEFAULT false,
  is_audio_enabled BOOLEAN DEFAULT true,
  is_screen_sharing BOOLEAN DEFAULT false,
  
  -- Timing
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  
  -- Connection Quality
  connection_quality TEXT DEFAULT 'good' CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(call_id, user_id)
);

-- Indexes
CREATE INDEX idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX idx_call_participants_user_id ON call_participants(user_id);
CREATE INDEX idx_call_participants_status ON call_participants(status);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================

ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: RLS Policies for Call Sessions
-- ============================================

CREATE POLICY "Users can view calls they initiated" ON call_sessions
  FOR SELECT
  USING (auth.uid() = initiator_id);

CREATE POLICY "Users can view calls as participant" ON call_sessions
  FOR SELECT
  USING (
    id IN (
      SELECT call_id 
      FROM call_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create calls" ON call_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Users can update their initiated calls" ON call_sessions
  FOR UPDATE
  USING (auth.uid() = initiator_id);

CREATE POLICY "Users can delete their initiated calls" ON call_sessions
  FOR DELETE
  USING (auth.uid() = initiator_id);

-- ============================================
-- STEP 5: RLS Policies for Call Participants
-- ============================================

CREATE POLICY "Users can view their own participation" ON call_participants
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view call participants in their calls" ON call_participants
  FOR SELECT
  USING (
    call_id IN (
      SELECT call_id 
      FROM call_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Initiators can view all participants" ON call_participants
  FOR SELECT
  USING (
    call_id IN (
      SELECT id 
      FROM call_sessions 
      WHERE initiator_id = auth.uid()
    )
  );

CREATE POLICY "Users can join calls" ON call_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON call_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Initiators can update participants" ON call_participants
  FOR UPDATE
  USING (
    call_id IN (
      SELECT id 
      FROM call_sessions 
      WHERE initiator_id = auth.uid()
    )
  );

-- ============================================
-- STEP 6: Triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_calling_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_call_sessions_timestamp BEFORE UPDATE ON call_sessions
  FOR EACH ROW EXECUTE FUNCTION update_calling_updated_at();

CREATE TRIGGER update_call_participants_timestamp BEFORE UPDATE ON call_participants
  FOR EACH ROW EXECUTE FUNCTION update_calling_updated_at();

-- ============================================
-- STEP 7: Helper Functions
-- ============================================

CREATE OR REPLACE FUNCTION calculate_call_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ended' AND OLD.status != 'ended' AND NEW.started_at IS NOT NULL THEN
    NEW.ended_at = NOW();
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_duration_on_end BEFORE UPDATE ON call_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'ended')
  EXECUTE FUNCTION calculate_call_duration();

-- ============================================
-- SUCCESS
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Calling system migration completed successfully!';
  RAISE NOTICE 'Created tables: call_sessions, call_participants';
  RAISE NOTICE 'All RLS policies and triggers configured';
END $$;
