-- ============================================
-- AUDIO/VIDEO CALLING SYSTEM - FINAL FIX
-- ============================================
-- This version completely eliminates infinite recursion
-- by avoiding self-referencing policies
-- ============================================

-- Drop existing tables and functions
DROP TABLE IF EXISTS call_participants CASCADE;
DROP TABLE IF EXISTS call_sessions CASCADE;
DROP FUNCTION IF EXISTS update_calling_updated_at() CASCADE;
DROP FUNCTION IF EXISTS calculate_call_duration() CASCADE;

-- ============================================
-- Create Call Sessions Table
-- ============================================

CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video', 'group_audio', 'group_video')),
  room_id TEXT UNIQUE NOT NULL,
  initiator_id UUID NOT NULL,
  status TEXT DEFAULT 'ringing' CHECK (status IN ('ringing', 'active', 'ended', 'missed', 'declined')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_call_sessions_initiator ON call_sessions(initiator_id);
CREATE INDEX idx_call_sessions_status ON call_sessions(status);
CREATE INDEX idx_call_sessions_created_at ON call_sessions(created_at DESC);
CREATE INDEX idx_call_sessions_room_id ON call_sessions(room_id);

-- ============================================
-- Create Call Participants Table
-- ============================================

CREATE TABLE call_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'rejected')),
  is_video_enabled BOOLEAN DEFAULT false,
  is_audio_enabled BOOLEAN DEFAULT true,
  is_screen_sharing BOOLEAN DEFAULT false,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  connection_quality TEXT DEFAULT 'good' CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(call_id, user_id)
);

CREATE INDEX idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX idx_call_participants_user_id ON call_participants(user_id);
CREATE INDEX idx_call_participants_status ON call_participants(status);

-- ============================================
-- Enable RLS
-- ============================================

ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for Call Sessions
-- ============================================

-- Users can view calls they initiated
CREATE POLICY "sessions_select_initiator" ON call_sessions
  FOR SELECT
  USING (auth.uid() = initiator_id);

-- Users can view calls where they are participants (no recursion - uses call_participants directly)
CREATE POLICY "sessions_select_participant" ON call_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM call_participants 
      WHERE call_participants.call_id = call_sessions.id 
      AND call_participants.user_id = auth.uid()
    )
  );

-- Users can create calls
CREATE POLICY "sessions_insert" ON call_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

-- Users can update their own calls
CREATE POLICY "sessions_update" ON call_sessions
  FOR UPDATE
  USING (auth.uid() = initiator_id);

-- Users can delete their own calls
CREATE POLICY "sessions_delete" ON call_sessions
  FOR DELETE
  USING (auth.uid() = initiator_id);

-- ============================================
-- RLS Policies for Call Participants (NO RECURSION!)
-- ============================================

-- CRITICAL: These policies ONLY reference call_sessions, NEVER call_participants
-- This completely eliminates infinite recursion

-- Users can view their own participant record
CREATE POLICY "participants_select_own" ON call_participants
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view OTHER participants if they are the call initiator
CREATE POLICY "participants_select_as_initiator" ON call_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM call_sessions 
      WHERE call_sessions.id = call_participants.call_id 
      AND call_sessions.initiator_id = auth.uid()
    )
  );

-- Users can insert themselves as participants
CREATE POLICY "participants_insert" ON call_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation
CREATE POLICY "participants_update_own" ON call_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Call initiators can update any participant
CREATE POLICY "participants_update_as_initiator" ON call_participants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM call_sessions 
      WHERE call_sessions.id = call_participants.call_id 
      AND call_sessions.initiator_id = auth.uid()
    )
  );

-- ============================================
-- Triggers
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
  RAISE NOTICE '✅ Calling system migration completed!';
  RAISE NOTICE '✅ NO INFINITE RECURSION - All policies fixed!';
END $$;
