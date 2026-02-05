-- ============================================
-- AUDIO/VIDEO CALLING - ULTRA SIMPLE (NO RECURSION)
-- ============================================
-- This version uses the SIMPLEST possible policies
-- NO cross-table queries = NO recursion
-- ============================================

DROP TABLE IF EXISTS call_participants CASCADE;
DROP TABLE IF EXISTS call_sessions CASCADE;
DROP FUNCTION IF EXISTS update_calling_updated_at() CASCADE;
DROP FUNCTION IF EXISTS calculate_call_duration() CASCADE;

-- ============================================
-- Tables
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
  connection_quality TEXT DEFAULT 'good',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(call_id, user_id)
);

-- Indexes
CREATE INDEX idx_call_sessions_initiator ON call_sessions(initiator_id);
CREATE INDEX idx_call_sessions_status ON call_sessions(status);
CREATE INDEX idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX idx_call_participants_user_id ON call_participants(user_id);

-- ============================================
-- RLS - ULTRA SIMPLE (No Cross-Table Queries!)
-- ============================================

ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Call Sessions Policies (ONLY check same table!)
-- ============================================

-- Anyone can view any call session (simplest - no recursion)
-- In production, refine this based on your needs
CREATE POLICY "sessions_select_all" ON call_sessions
  FOR SELECT
  USING (true);

-- Only initiators can create
CREATE POLICY "sessions_insert" ON call_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

-- Only initiators can update
CREATE POLICY "sessions_update" ON call_sessions
  FOR UPDATE
  USING (auth.uid() = initiator_id);

-- Only initiators can delete
CREATE POLICY "sessions_delete" ON call_sessions
  FOR DELETE
  USING (auth.uid() = initiator_id);

-- ============================================
-- Call Participants Policies (ONLY check same table!)
-- ============================================

-- Users can only see their own participant records
CREATE POLICY "participants_select" ON call_participants
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert themselves
CREATE POLICY "participants_insert" ON call_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own records
CREATE POLICY "participants_update" ON call_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own records
CREATE POLICY "participants_delete" ON call_participants
  FOR DELETE
  USING (auth.uid() = user_id);

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
  RAISE NOTICE '✅ Ultra-simple calling system created!';
  RAISE NOTICE '✅ ZERO cross-table queries = ZERO recursion!';
  RAISE NOTICE 'Note: call_sessions uses permissive SELECT policy for simplicity';
END $$;
