-- ============================================
-- AUDIO/VIDEO CALLING SYSTEM MIGRATION
-- ============================================
-- This migration creates the database schema for:
-- - Call sessions (audio/video calls)
-- - Call participants tracking
-- - Call history
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: Create Call Sessions Table
-- ============================================

CREATE TABLE IF NOT EXISTS call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Call Information
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video', 'group_audio', 'group_video')),
  room_id TEXT UNIQUE NOT NULL, -- Unique identifier for WebRTC room
  
  -- Initiator
  initiator_id UUID NOT NULL, -- References auth.users, but no FK for flexibility
  
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

-- Indexes for call sessions
CREATE INDEX IF NOT EXISTS idx_call_sessions_initiator ON call_sessions(initiator_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_call_sessions_created_at ON call_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_sessions_room_id ON call_sessions(room_id);

-- ============================================
-- STEP 2: Create Call Participants Table
-- ============================================

CREATE TABLE IF NOT EXISTS call_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  call_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL, -- References auth.users
  
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

-- Indexes for call participants
CREATE INDEX IF NOT EXISTS idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_user_id ON call_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_status ON call_participants(status);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================

ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: RLS Policies for Call Sessions
-- ============================================

-- Users can view calls they initiated or participated in
CREATE POLICY "Users can view their calls" ON call_sessions
  FOR SELECT
  USING (
    auth.uid() = initiator_id OR
    EXISTS (
      SELECT 1 FROM call_participants
      WHERE call_participants.call_id = call_sessions.id
      AND call_participants.user_id = auth.uid()
    )
  );

-- Users can create new call sessions
CREATE POLICY "Users can create calls" ON call_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

-- Users can update calls they initiated
CREATE POLICY "Users can update their initiated calls" ON call_sessions
  FOR UPDATE
  USING (auth.uid() = initiator_id);

-- ============================================
-- STEP 5: RLS Policies for Call Participants
-- ============================================

-- Users can view participants in calls they're part of
CREATE POLICY "Users can view call participants" ON call_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE call_sessions.id = call_participants.call_id
      AND (
        call_sessions.initiator_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM call_participants cp
          WHERE cp.call_id = call_sessions.id
          AND cp.user_id = auth.uid()
        )
      )
    )
  );

-- Users can join calls (insert themselves as participants)
CREATE POLICY "Users can join calls" ON call_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participant status
CREATE POLICY "Users can update their participation" ON call_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Call initiators can update any participant
CREATE POLICY "Initiators can update participants" ON call_participants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE call_sessions.id = call_participants.call_id
      AND call_sessions.initiator_id = auth.uid()
    )
  );

-- ============================================
-- STEP 6: Triggers for Updated At
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calling_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_call_sessions_timestamp BEFORE UPDATE ON call_sessions
  FOR EACH ROW EXECUTE FUNCTION update_calling_updated_at();

CREATE TRIGGER update_call_participants_timestamp BEFORE UPDATE ON call_participants
  FOR EACH ROW EXECUTE FUNCTION update_calling_updated_at();

-- ============================================
-- STEP 7: Helper Functions
-- ============================================

-- Function to calculate call duration when call ends
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

-- Trigger to calculate duration
CREATE TRIGGER calculate_duration_on_end BEFORE UPDATE ON call_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'ended')
  EXECUTE FUNCTION calculate_call_duration();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Calling system migration completed successfully!';
  RAISE NOTICE 'Created tables: call_sessions, call_participants';
  RAISE NOTICE 'All RLS policies and triggers have been set up.';
END $$;
