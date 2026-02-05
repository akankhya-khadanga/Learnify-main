import { supabase } from '@/lib/supabase';
import type { GroupMessage, MessageReaction, UserProfile } from './studyGroupsService';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =====================================================
// MESSAGING SERVICE
// =====================================================

class MessagingService {
    private activeChannels: Map<string, RealtimeChannel> = new Map();

    /**
     * Send a text message
     */
    async sendMessage(
        groupId: string,
        content: string,
        replyTo?: string
    ): Promise<GroupMessage> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('group_messages')
            .insert({
                group_id: groupId,
                sender_id: user.id,
                content,
                message_type: 'text',
                reply_to: replyTo,
            })
            .select(`
        *,
        sender:user_profiles(*),
        reply_message:group_messages!reply_to(*)
      `)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Send a media message
     */
    async sendMediaMessage(
        groupId: string,
        file: File,
        caption?: string
    ): Promise<GroupMessage> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `group-media/${groupId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('study-groups')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('study-groups')
            .getPublicUrl(filePath);

        // Determine message type
        let messageType: 'image' | 'file' | 'audio' = 'file';
        if (file.type.startsWith('image/')) messageType = 'image';
        else if (file.type.startsWith('audio/')) messageType = 'audio';

        // Create message
        const { data, error } = await supabase
            .from('group_messages')
            .insert({
                group_id: groupId,
                sender_id: user.id,
                content: caption,
                message_type: messageType,
                media_url: publicUrl,
                media_type: file.type,
                file_name: file.name,
                file_size: file.size,
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
     * Get messages for a group
     */
    async getMessages(
        groupId: string,
        options?: {
            limit?: number;
            before?: string; // Message ID for pagination
        }
    ): Promise<GroupMessage[]> {
        let query = supabase
            .from('group_messages')
            .select(`
        *,
        sender:user_profiles(*),
        reactions:message_reactions(
          *,
          user:user_profiles(*)
        ),
        reply_message:group_messages!reply_to(
          *,
          sender:user_profiles(*)
        )
      `)
            .eq('group_id', groupId)
            .eq('deleted', false)
            .order('created_at', { ascending: false })
            .limit(options?.limit || 50);

        if (options?.before) {
            // Get timestamp of the 'before' message
            const { data: beforeMsg } = await supabase
                .from('group_messages')
                .select('created_at')
                .eq('id', options.before)
                .single();

            if (beforeMsg) {
                query = query.lt('created_at', beforeMsg.created_at);
            }
        }

        const { data, error } = await query;

        if (error) throw error;
        return (data || []).reverse(); // Reverse to show oldest first
    }

    /**
     * Edit a message
     */
    async editMessage(messageId: string, newContent: string): Promise<void> {
        const { error } = await supabase
            .from('group_messages')
            .update({
                content: newContent,
                edited: true,
            })
            .eq('id', messageId);

        if (error) throw error;
    }

    /**
     * Delete a message
     */
    async deleteMessage(messageId: string): Promise<void> {
        const { error } = await supabase
            .from('group_messages')
            .update({ deleted: true })
            .eq('id', messageId);

        if (error) throw error;
    }

    /**
     * Add reaction to message
     */
    async addReaction(messageId: string, emoji: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('message_reactions')
            .insert({
                message_id: messageId,
                user_id: user.id,
                emoji,
            });

        if (error) {
            // If reaction already exists, ignore error
            if (error.code !== '23505') throw error;
        }
    }

    /**
     * Remove reaction from message
     */
    async removeReaction(messageId: string, emoji: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', user.id)
            .eq('emoji', emoji);

        if (error) throw error;
    }

    /**
     * Mark messages as read
     */
    async markAsRead(groupId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Update last_read_at for this user in this group
        const { error } = await supabase
            .from('group_members')
            .update({ last_read_at: new Date().toISOString() })
            .eq('group_id', groupId)
            .eq('user_id', user.id);

        if (error) throw error;
    }

    /**
     * Get unread message count for a group
     */
    async getUnreadCount(groupId: string): Promise<number> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get user's last_read_at
        const { data: member } = await supabase
            .from('group_members')
            .select('last_read_at')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .single();

        if (!member) return 0;

        // Count messages after last_read_at
        const { count, error } = await supabase
            .from('group_messages')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', groupId)
            .gt('created_at', member.last_read_at)
            .neq('sender_id', user.id);

        if (error) throw error;
        return count || 0;
    }

    /**
     * Subscribe to real-time messages for a group
     */
    subscribeToMessages(
        groupId: string,
        onMessage: (message: GroupMessage) => void,
        onReaction?: (reaction: MessageReaction) => void
    ): () => void {
        // Create channel for this group
        const channel = supabase.channel(`group:${groupId}`);

        // Subscribe to new messages
        channel.on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'group_messages',
                filter: `group_id=eq.${groupId}`,
            },
            async (payload) => {
                // Fetch full message with relations
                const { data } = await supabase
                    .from('group_messages')
                    .select(`
            *,
            sender:user_profiles(*),
            reply_message:group_messages!reply_to(*)
          `)
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    onMessage(data);
                }
            }
        );

        // Subscribe to message updates (edits, deletes)
        channel.on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'group_messages',
                filter: `group_id=eq.${groupId}`,
            },
            async (payload) => {
                const { data } = await supabase
                    .from('group_messages')
                    .select(`
            *,
            sender:user_profiles(*),
            reply_message:group_messages!reply_to(*)
          `)
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    onMessage(data);
                }
            }
        );

        // Subscribe to reactions if callback provided
        if (onReaction) {
            channel.on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'message_reactions',
                },
                async (payload) => {
                    // Check if reaction belongs to a message in this group
                    const newData = payload.new as any;
                    const oldData = payload.old as any;
                    const { data: message } = await supabase
                        .from('group_messages')
                        .select('group_id')
                        .eq('id', newData?.message_id || oldData?.message_id)
                        .single();

                    if (message?.group_id === groupId) {
                        const { data: reaction } = await supabase
                            .from('message_reactions')
                            .select(`
                *,
                user:user_profiles(*)
              `)
                            .eq('id', newData?.id)
                            .single();

                        if (reaction) {
                            onReaction(reaction);
                        }
                    }
                }
            );
        }

        // Subscribe to the channel
        channel.subscribe();

        // Store channel reference
        this.activeChannels.set(groupId, channel);

        // Return cleanup function
        return () => {
            channel.unsubscribe();
            this.activeChannels.delete(groupId);
        };
    }

    /**
     * Set typing indicator
     */
    async setTyping(groupId: string, isTyping: boolean): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        if (isTyping) {
            // Add typing indicator
            await supabase
                .from('typing_indicators')
                .upsert({
                    group_id: groupId,
                    user_id: user.id,
                });
        } else {
            // Remove typing indicator
            await supabase
                .from('typing_indicators')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', user.id);
        }
    }

    /**
     * Get typing users
     */
    async getTypingUsers(groupId: string): Promise<UserProfile[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('typing_indicators')
            .select(`
        user:user_profiles(*)
      `)
            .eq('group_id', groupId)
            .neq('user_id', user.id)
            .gt('created_at', new Date(Date.now() - 10000).toISOString()); // Last 10 seconds

        if (error) throw error;
        return (data?.map((d: any) => d.user).filter((u: any) => u !== null) as UserProfile[]) || [];
    }

    /**
     * Search messages in a group
     */
    async searchMessages(groupId: string, query: string): Promise<GroupMessage[]> {
        const { data, error } = await supabase
            .from('group_messages')
            .select(`
        *,
        sender:user_profiles(*)
      `)
            .eq('group_id', groupId)
            .eq('deleted', false)
            .ilike('content', `%${query}%`)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data || [];
    }

    /**
     * Get media messages (images, files) from a group
     */
    async getMediaMessages(groupId: string): Promise<GroupMessage[]> {
        const { data, error } = await supabase
            .from('group_messages')
            .select(`
        *,
        sender:user_profiles(*)
      `)
            .eq('group_id', groupId)
            .in('message_type', ['image', 'file'])
            .eq('deleted', false)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        return data || [];
    }

    /**
     * Cleanup - unsubscribe from all channels
     */
    cleanup(): void {
        this.activeChannels.forEach(channel => channel.unsubscribe());
        this.activeChannels.clear();
    }
}

// Export singleton instance
export const messagingService = new MessagingService();
