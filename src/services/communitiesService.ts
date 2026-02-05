import { supabase } from '@/lib/supabase';
import type { UserProfile } from './studyGroupsService';

// =====================================================
// TYPES
// =====================================================

export interface Community {
    id: string;
    name: string;
    description?: string;
    subject?: string;
    avatar_url?: string;
    created_by: string;
    community_type: 'public' | 'private';
    created_at: string;
    updated_at: string;
}

export interface CommunityChannel {
    id: string;
    community_id: string;
    name: string;
    description?: string;
    channel_type: 'announcement' | 'discussion';
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface ChannelMember {
    id: string;
    channel_id: string;
    user_id: string;
    role: 'admin' | 'subscriber';
    joined_at: string;
    muted: boolean;
}

export interface ChannelMessage {
    id: string;
    channel_id: string;
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'file' | 'audio';
    media_url?: string;
    created_at: string;
    updated_at: string;
    sender?: UserProfile;
}

// =====================================================
// COMMUNITIES SERVICE
// =====================================================

class CommunitiesService {
    /**
     * Create a new community
     */
    async createCommunity(data: {
        name: string;
        description?: string;
        subject?: string;
        community_type?: 'public' | 'private';
    }): Promise<Community> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: community, error } = await supabase
            .from('communities')
            .insert({
                ...data,
                created_by: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return community;
    }

    /**
     * Get all public communities
     */
    async getPublicCommunities(): Promise<Community[]> {
        const { data, error } = await supabase
            .from('communities')
            .select('*')
            .eq('community_type', 'public')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get community by ID
     */
    async getCommunityById(communityId: string): Promise<Community | null> {
        const { data, error } = await supabase
            .from('communities')
            .select('*')
            .eq('id', communityId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    /**
     * Create a channel in a community
     */
    async createChannel(
        communityId: string,
        data: {
            name: string;
            description?: string;
            channel_type?: 'announcement' | 'discussion';
        }
    ): Promise<CommunityChannel> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: channel, error } = await supabase
            .from('community_channels')
            .insert({
                community_id: communityId,
                ...data,
                created_by: user.id,
            })
            .select()
            .single();

        if (error) throw error;

        // Auto-subscribe creator as admin
        await this.subscribeToChannel(channel.id, 'admin');

        return channel;
    }

    /**
     * Get channels for a community
     */
    async getCommunityChannels(communityId: string): Promise<CommunityChannel[]> {
        const { data, error } = await supabase
            .from('community_channels')
            .select('*')
            .eq('community_id', communityId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    /**
     * Subscribe to a channel
     */
    async subscribeToChannel(
        channelId: string,
        role: 'admin' | 'subscriber' = 'subscriber'
    ): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('channel_members')
            .insert({
                channel_id: channelId,
                user_id: user.id,
                role,
            });

        if (error) throw error;
    }

    /**
     * Unsubscribe from a channel
     */
    async unsubscribeFromChannel(channelId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('channel_members')
            .delete()
            .eq('channel_id', channelId)
            .eq('user_id', user.id);

        if (error) throw error;
    }

    /**
     * Get user's subscribed channels
     */
    async getMyChannels(): Promise<CommunityChannel[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('community_channels')
            .select(`
        *,
        channel_members!inner(user_id)
      `)
            .eq('channel_members.user_id', user.id);

        if (error) throw error;
        return data || [];
    }

    /**
     * Send a message to a channel (broadcast)
     */
    async sendChannelMessage(
        channelId: string,
        content: string
    ): Promise<ChannelMessage> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('channel_messages')
            .insert({
                channel_id: channelId,
                sender_id: user.id,
                content,
                message_type: 'text',
            })
            .select(`
        *,
        sender:user_profiles(*)
      `)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get messages from a channel
     */
    async getChannelMessages(
        channelId: string,
        limit: number = 50
    ): Promise<ChannelMessage[]> {
        const { data, error } = await supabase
            .from('channel_messages')
            .select(`
        *,
        sender:user_profiles(*)
      `)
            .eq('channel_id', channelId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []).reverse();
    }

    /**
     * Search communities
     */
    async searchCommunities(query: string): Promise<Community[]> {
        const { data, error } = await supabase
            .from('communities')
            .select('*')
            .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
            .eq('community_type', 'public')
            .limit(20);

        if (error) throw error;
        return data || [];
    }

    /**
     * Get channel member count
     */
    async getChannelMemberCount(channelId: string): Promise<number> {
        const { count, error } = await supabase
            .from('channel_members')
            .select('*', { count: 'exact', head: true })
            .eq('channel_id', channelId);

        if (error) throw error;
        return count || 0;
    }

    /**
     * Check if user is subscribed to a channel
     */
    async isSubscribed(channelId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('channel_members')
            .select('id')
            .eq('channel_id', channelId)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    }
}

// Export singleton instance
export const communitiesService = new CommunitiesService();
