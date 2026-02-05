-- Learning-Safe Integrations - Database Schema Migration
-- Run this in your Supabase SQL Editor
-- This creates tables for Friends System and Study Together Mode

-- =====================================================
-- FRIENDS SYSTEM TABLES
-- =====================================================

-- Friends table: Stores friend relationships
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id) -- Prevent self-friending
);

-- Friend requests table: Manages pending/accepted/rejected friend requests
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Encouragements table: Stores encouragement reactions sent between friends
CREATE TABLE IF NOT EXISTS encouragements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'clap', 'star', 'thumbs_up')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STUDY TOGETHER MODE TABLES
-- =====================================================

-- Study sessions table: Stores shared study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_name TEXT NOT NULL,
  focus_duration INTEGER NOT NULL DEFAULT 25, -- minutes
  break_duration INTEGER NOT NULL DEFAULT 5,  -- minutes
  total_cycles INTEGER NOT NULL DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  is_break_time BOOLEAN DEFAULT false,
  time_remaining INTEGER, -- seconds
  current_cycle INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study session participants table: Tracks who's in each session
CREATE TABLE IF NOT EXISTS study_session_participants (
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id)
);

-- Session chat messages table: Stores break-time chat messages
CREATE TABLE IF NOT EXISTS session_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_break_time BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Friends indexes
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_encouragements_receiver ON encouragements(receiver_id);

-- Study sessions indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_active ON study_sessions(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON study_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_chat_session ON session_chat_messages(session_id, created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_chat_messages ENABLE ROW LEVEL SECURITY;

-- Friends policies
CREATE POLICY "Users can view their own friends"
  ON friends FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can add friends"
  ON friends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own friends"
  ON friends FOR DELETE
  USING (auth.uid() = user_id);

-- Friend requests policies
CREATE POLICY "Users can view their own friend requests"
  ON friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update requests they received"
  ON friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Encouragements policies
CREATE POLICY "Users can view encouragements they sent or received"
  ON encouragements FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send encouragements"
  ON encouragements FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Study sessions policies
CREATE POLICY "Anyone can view active sessions"
  ON study_sessions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update their sessions"
  ON study_sessions FOR UPDATE
  USING (auth.uid() = host_id);

-- Session participants policies
CREATE POLICY "Participants can view session members"
  ON study_session_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM study_session_participants
      WHERE session_id = study_session_participants.session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join sessions"
  ON study_session_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions"
  ON study_session_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Session chat policies
CREATE POLICY "Session participants can view chat"
  ON session_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM study_session_participants
      WHERE session_id = session_chat_messages.session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Session participants can send messages during breaks"
  ON session_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM study_session_participants
      WHERE session_id = session_chat_messages.session_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- REALTIME SUBSCRIPTIONS (Enable for frontend)
-- =====================================================
-- Run this in Supabase Dashboard > Database > Replication
-- Enable realtime for these tables:
-- - study_sessions
-- - study_session_participants
-- - session_chat_messages

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp for friend_requests
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create reciprocal friend relationship when request is accepted
CREATE OR REPLACE FUNCTION accept_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Create friend relationship for both users
    INSERT INTO friends (user_id, friend_id)
    VALUES (NEW.sender_id, NEW.receiver_id), (NEW.receiver_id, NEW.sender_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_friend_request_accepted
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION accept_friend_request();

-- =====================================================
-- NOTES FOR IMPLEMENTATION
-- =====================================================
-- 
-- To connect real APIs:
-- 
-- 1. Update src/services/friendsService.ts:
--    - Replace MOCK_FRIENDS with Supabase queries
--    - Use: supabase.from('friends').select('*').eq('user_id', userId)
--
-- 2. Update src/services/studyTogetherService.ts:
--    - Replace mock session with Supabase + Realtime
--    - Use: supabase.channel('study_session:123').on('postgres_changes', ...)
--
-- 3. Enable Realtime in Supabase Dashboard:
--    - Database > Replication > Enable for study_sessions, etc.
--
-- 4. Add presence tracking (optional):
--    - Use Supabase Presence API for online status
--    - supabase.channel('online').track({ user_id, online_at })
--
-- =====================================================
