-- Study Groups & Community Database Schema
-- Migration: 20250127_study_groups_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES (Extended)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'offline', -- online, offline, away
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FRIENDSHIPS
-- =====================================================
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, blocked
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- =====================================================
-- STUDY GROUPS
-- =====================================================
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT, -- Math, Science, History, etc.
    avatar_url TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    group_type TEXT DEFAULT 'private', -- private, public
    max_members INTEGER DEFAULT 256,
    settings JSONB DEFAULT '{"allow_media": true, "allow_all_to_message": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX idx_study_groups_subject ON study_groups(subject);

-- =====================================================
-- GROUP MEMBERS
-- =====================================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- admin, moderator, member
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    muted BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(role);

-- =====================================================
-- GROUP MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS group_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    message_type TEXT DEFAULT 'text', -- text, image, file, audio, poll
    media_url TEXT,
    media_type TEXT, -- image/png, application/pdf, etc.
    file_name TEXT,
    file_size BIGINT,
    reply_to UUID REFERENCES group_messages(id) ON DELETE SET NULL,
    edited BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX idx_group_messages_sender_id ON group_messages(sender_id);
CREATE INDEX idx_group_messages_created_at ON group_messages(created_at DESC);
CREATE INDEX idx_group_messages_reply_to ON group_messages(reply_to);

-- =====================================================
-- MESSAGE REACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES group_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);

-- =====================================================
-- MESSAGE READ STATUS
-- =====================================================
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES group_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE INDEX idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX idx_message_read_status_user_id ON message_read_status(user_id);

-- =====================================================
-- GROUP INVITES
-- =====================================================
CREATE TABLE IF NOT EXISTS group_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_group_invites_group_id ON group_invites(group_id);
CREATE INDEX idx_group_invites_code ON group_invites(invite_code);

-- =====================================================
-- COMMUNITIES
-- =====================================================
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    avatar_url TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    community_type TEXT DEFAULT 'public', -- public, private
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_subject ON communities(subject);

-- =====================================================
-- COMMUNITY CHANNELS
-- =====================================================
CREATE TABLE IF NOT EXISTS community_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    channel_type TEXT DEFAULT 'discussion', -- announcement, discussion
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_channels_community_id ON community_channels(community_id);

-- =====================================================
-- CHANNEL MEMBERS
-- =====================================================
CREATE TABLE IF NOT EXISTS channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'subscriber', -- admin, subscriber
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    muted BOOLEAN DEFAULT FALSE,
    UNIQUE(channel_id, user_id)
);

CREATE INDEX idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON channel_members(user_id);

-- =====================================================
-- CHANNEL MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS channel_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_channel_messages_channel_id ON channel_messages(channel_id);
CREATE INDEX idx_channel_messages_created_at ON channel_messages(created_at DESC);

-- =====================================================
-- TYPING INDICATORS (Temporary table for real-time)
-- =====================================================
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_typing_indicators_group_id ON typing_indicators(group_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Friendships Policies
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friendship requests" ON friendships FOR INSERT 
    WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "Users can update own friendships" ON friendships FOR UPDATE 
    USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can delete own friendships" ON friendships FOR DELETE 
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Study Groups Policies
CREATE POLICY "Users can view groups they are members of" ON study_groups FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = study_groups.id 
            AND group_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create groups" ON study_groups FOR INSERT 
    WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update groups" ON study_groups FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = study_groups.id 
            AND group_members.user_id = auth.uid() 
            AND group_members.role = 'admin'
        )
    );
CREATE POLICY "Admins can delete groups" ON study_groups FOR DELETE 
    USING (auth.uid() = created_by);

-- Group Members Policies
CREATE POLICY "Users can view members of their groups" ON group_members FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM group_members gm 
            WHERE gm.group_id = group_members.group_id 
            AND gm.user_id = auth.uid()
        )
    );
CREATE POLICY "Admins can add members" ON group_members FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = group_members.group_id 
            AND group_members.user_id = auth.uid() 
            AND group_members.role IN ('admin', 'moderator')
        )
    );
CREATE POLICY "Users can update own membership" ON group_members FOR UPDATE 
    USING (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE 
    USING (auth.uid() = user_id);

-- Group Messages Policies
CREATE POLICY "Users can view messages in their groups" ON group_messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = group_messages.group_id 
            AND group_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Members can send messages" ON group_messages FOR INSERT 
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = group_messages.group_id 
            AND group_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own messages" ON group_messages FOR UPDATE 
    USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete own messages" ON group_messages FOR DELETE 
    USING (auth.uid() = sender_id);

-- Message Reactions Policies
CREATE POLICY "Users can view reactions in their groups" ON message_reactions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM group_messages gm
            JOIN group_members gm2 ON gm.group_id = gm2.group_id
            WHERE gm.id = message_reactions.message_id 
            AND gm2.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can add reactions" ON message_reactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON message_reactions FOR DELETE 
    USING (auth.uid() = user_id);

-- Message Read Status Policies
CREATE POLICY "Users can view read status" ON message_read_status FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM group_messages gm
            JOIN group_members gm2 ON gm.group_id = gm2.group_id
            WHERE gm.id = message_read_status.message_id 
            AND gm2.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can mark messages as read" ON message_read_status FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Group Invites Policies
CREATE POLICY "Users can view invites for their groups" ON group_invites FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = group_invites.group_id 
            AND group_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Admins can create invites" ON group_invites FOR INSERT 
    WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = group_invites.group_id 
            AND group_members.user_id = auth.uid() 
            AND group_members.role IN ('admin', 'moderator')
        )
    );

-- Communities Policies
CREATE POLICY "Users can view public communities" ON communities FOR SELECT USING (true);
CREATE POLICY "Users can create communities" ON communities FOR INSERT 
    WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update communities" ON communities FOR UPDATE 
    USING (auth.uid() = created_by);

-- Channel Members Policies
CREATE POLICY "Users can view channel members" ON channel_members FOR SELECT USING (true);
CREATE POLICY "Users can subscribe to channels" ON channel_members FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsubscribe" ON channel_members FOR DELETE 
    USING (auth.uid() = user_id);

-- Channel Messages Policies
CREATE POLICY "Subscribers can view channel messages" ON channel_messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM channel_members 
            WHERE channel_members.channel_id = channel_messages.channel_id 
            AND channel_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Admins can send channel messages" ON channel_messages FOR INSERT 
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM channel_members 
            WHERE channel_members.channel_id = channel_messages.channel_id 
            AND channel_members.user_id = auth.uid() 
            AND channel_members.role = 'admin'
        )
    );

-- Typing Indicators Policies
CREATE POLICY "Users can view typing in their groups" ON typing_indicators FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = typing_indicators.group_id 
            AND group_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can set own typing status" ON typing_indicators FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can clear own typing status" ON typing_indicators FOR DELETE 
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_messages_updated_at BEFORE UPDATE ON group_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_channels_updated_at BEFORE UPDATE ON community_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old typing indicators (older than 10 seconds)
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS void AS $$
BEGIN
    DELETE FROM typing_indicators 
    WHERE created_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql;
