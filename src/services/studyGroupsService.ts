import { supabase } from '@/lib/supabase';

// =====================================================
// TYPES
// =====================================================

export interface UserProfile {
    id: string;
    username: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    status?: 'online' | 'offline' | 'away';
    last_seen?: string;
    streak?: number;
    level?: number;
}

export interface StudyGroup {
    id: string;
    name: string;
    description?: string;
    subject?: string;
    avatar_url?: string;
    created_by: string;
    group_type: 'private' | 'public';
    max_members: number;
    settings: {
        allow_media: boolean;
        allow_all_to_message: boolean;
    };
    created_at: string;
    updated_at: string;
}

export interface GroupMember {
    id: string;
    group_id: string;
    user_id: string;
    role: 'admin' | 'moderator' | 'member';
    joined_at: string;
    muted: boolean;
    last_read_at: string;
    user?: UserProfile;
}

export interface GroupMessage {
    id: string;
    group_id: string;
    sender_id: string;
    content?: string;
    message_type: 'text' | 'image' | 'file' | 'audio' | 'poll';
    media_url?: string;
    media_type?: string;
    file_name?: string;
    file_size?: number;
    reply_to?: string;
    edited: boolean;
    deleted: boolean;
    created_at: string;
    updated_at: string;
    sender?: UserProfile;
    reactions?: MessageReaction[];
    reply_message?: GroupMessage;
}

export interface MessageReaction {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
    user?: UserProfile;
}

export interface GroupInvite {
    id: string;
    group_id: string;
    invite_code: string;
    created_by: string;
    expires_at?: string;
    max_uses?: number;
    uses_count: number;
    created_at: string;
}

// =====================================================
// STUDY GROUPS SERVICE
// =====================================================

class StudyGroupsService {
    /**
     * Create a new study group
     */
    async createGroup(data: {
        name: string;
        description?: string;
        subject?: string;
        avatar_url?: string;
        group_type?: 'private' | 'public';
    }): Promise<StudyGroup> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: group, error } = await supabase
            .from('study_groups')
            .insert({
                ...data,
                created_by: user.id,
            })
            .select()
            .single();

        if (error) throw error;

        // Add creator as admin
        await this.addMember(group.id, user.id, 'admin');

        return group;
    }

    /**
     * Get all groups for current user (including groups they joined)
     */
    async getMyGroups(): Promise<StudyGroup[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get all groups where user is a member
        const { data, error } = await supabase
            .from('group_members')
            .select(`
                group_id,
                study_groups (
                    id,
                    name,
                    description,
                    subject,
                    avatar_url,
                    created_by,
                    group_type,
                    max_members,
                    settings,
                    created_at,
                    updated_at
                )
            `)
            .eq('user_id', user.id)
            .order('study_groups(updated_at)', { ascending: false });

        if (error) throw error;

        // Extract groups from the join result
        const groups = (data || []).map((item: any) => item.study_groups).filter((g: any) => g !== null);
        return groups as StudyGroup[];
    }

    /**
     * Start a direct message with a friend
     * Creates a DM group if it doesn't exist, or returns existing one
     */
    async startDirectMessage(friendId: string): Promise<StudyGroup> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get friend's profile
        const { data: friendProfile } = await supabase
            .from('user_profiles')
            .select('id, username, display_name')
            .eq('id', friendId)
            .single();

        if (!friendProfile) throw new Error('Friend not found');

        // Check if DM group already exists between these two users
        // Better detection: Find groups where BOTH users are members AND max_members=2
        const { data: myGroups } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user.id);

        if (myGroups && myGroups.length > 0) {
            // Check each group to see if friend is also a member
            for (const { group_id } of myGroups) {
                // Get group details
                const { data: group } = await supabase
                    .from('study_groups')
                    .select('*')
                    .eq('id', group_id)
                    .eq('max_members', 2) // Only check DM groups (max 2 members)
                    .single();

                if (group) {
                    // Check if friend is member
                    const { data: friendMember } = await supabase
                        .from('group_members')
                        .select('id')
                        .eq('group_id', group_id)
                        .eq('user_id', friendId)
                        .maybeSingle();

                    if (friendMember) {
                        // Found existing DM with this friend
                        return group as StudyGroup;
                    }
                }
            }
        }

        // No existing DM found, create new one with friend's name
        const friendName = friendProfile.display_name || friendProfile.username;
        const { data: newGroup, error: createError } = await supabase
            .from('study_groups')
            .insert({
                name: friendName, // Use friend's name for the DM
                description: 'Direct message',
                group_type: 'private',
                created_by: user.id,
                max_members: 2,
                settings: {
                    allow_media: true,
                    allow_all_to_message: true
                }
            })
            .select()
            .single();

        if (createError) throw createError;

        // Add both users as members
        await this.addMember(newGroup.id, user.id, 'admin');
        await this.addMember(newGroup.id, friendId, 'member');

        return newGroup;
    }

    /**
     * Get group by ID
     */
    async getGroupById(groupId: string): Promise<StudyGroup | null> {
        const { data, error } = await supabase
            .from('study_groups')
            .select('*')
            .eq('id', groupId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    /**
     * Update group
     */
    async updateGroup(groupId: string, updates: Partial<StudyGroup>): Promise<StudyGroup> {
        const { data, error } = await supabase
            .from('study_groups')
            .update(updates)
            .eq('id', groupId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete group
     */
    async deleteGroup(groupId: string): Promise<void> {
        const { error } = await supabase
            .from('study_groups')
            .delete()
            .eq('id', groupId);

        if (error) throw error;
    }

    /**
     * Add member to group
     */
    async addMember(
        groupId: string,
        userId: string,
        role: 'admin' | 'moderator' | 'member' = 'member'
    ): Promise<GroupMember> {
        const { data, error } = await supabase
            .from('group_members')
            .insert({
                group_id: groupId,
                user_id: userId,
                role,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get group members
     */
    async getGroupMembers(groupId: string): Promise<GroupMember[]> {
        const { data, error } = await supabase
            .from('group_members')
            .select(`
        *,
        user:user_profiles(*)
      `)
            .eq('group_id', groupId)
            .order('joined_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    /**
     * Update member role
     */
    async updateMemberRole(
        groupId: string,
        userId: string,
        role: 'admin' | 'moderator' | 'member'
    ): Promise<void> {
        const { error } = await supabase
            .from('group_members')
            .update({ role })
            .eq('group_id', groupId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    /**
     * Remove member from group
     */
    async removeMember(groupId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    /**
     * Leave group
     */
    async leaveGroup(groupId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        await this.removeMember(groupId, user.id);
    }

    /**
     * Mute/unmute group
     */
    async toggleMute(groupId: string, muted: boolean): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('group_members')
            .update({ muted })
            .eq('group_id', groupId)
            .eq('user_id', user.id);

        if (error) throw error;
    }

    /**
     * Create invite link
     */
    async createInvite(
        groupId: string,
        options?: {
            expires_at?: string;
            max_uses?: number;
        }
    ): Promise<GroupInvite> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Generate random invite code
        const inviteCode = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        const { data, error } = await supabase
            .from('group_invites')
            .insert({
                group_id: groupId,
                invite_code: inviteCode,
                created_by: user.id,
                ...options,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Join group via invite code
     */
    async joinViaInvite(inviteCode: string): Promise<StudyGroup> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get invite
        const { data: invite, error: inviteError } = await supabase
            .from('group_invites')
            .select('*')
            .eq('invite_code', inviteCode)
            .single();

        if (inviteError) throw new Error('Invalid invite code');

        // Check if expired
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            throw new Error('Invite code has expired');
        }

        // Check max uses
        if (invite.max_uses && invite.uses_count >= invite.max_uses) {
            throw new Error('Invite code has reached maximum uses');
        }

        // Add user to group
        await this.addMember(invite.group_id, user.id);

        // Increment uses count
        await supabase
            .from('group_invites')
            .update({ uses_count: invite.uses_count + 1 })
            .eq('id', invite.id);

        // Get group
        const group = await this.getGroupById(invite.group_id);
        if (!group) throw new Error('Group not found');

        return group;
    }

    /**
     * Search groups by name or subject
     */
    async searchGroups(query: string): Promise<StudyGroup[]> {
        const { data, error } = await supabase
            .from('study_groups')
            .select('*')
            .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
            .eq('group_type', 'public')
            .limit(20);

        if (error) throw error;
        return data || [];
    }
}

// Export singleton instance
export const studyGroupsService = new StudyGroupsService();
