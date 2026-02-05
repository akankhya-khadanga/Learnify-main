import { supabase } from '@/lib/supabase';
import type { UserProfile } from './studyGroupsService';

// =====================================================
// TYPES
// =====================================================

export interface Friendship {
    id: string;
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted' | 'blocked';
    requested_by: string;
    created_at: string;
    updated_at: string;
    friend?: UserProfile;
    user?: UserProfile;
}

// Re-export UserProfile for convenience
export type { UserProfile } from './studyGroupsService';

// =====================================================
// FRIENDS SERVICE
// =====================================================

class FriendsService {
    /**
     * Send friend request
     */
    async sendFriendRequest(friendId: string): Promise<Friendship> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        if (user.id === friendId) {
            throw new Error('Cannot send friend request to yourself');
        }

        // Check if friendship already exists
        const { data: existing } = await supabase
            .from('friendships')
            .select('*')
            .eq('user_id', user.id)
            .eq('friend_id', friendId)
            .maybeSingle();

        if (existing) {
            if (existing.status === 'accepted') {
                throw new Error('You are already friends with this user');
            } else if (existing.status === 'pending') {
                throw new Error('Friend request already sent');
            } else if (existing.status === 'blocked') {
                throw new Error('Cannot send friend request to blocked user');
            }
        }

        // Create bidirectional friendship records
        const { data, error } = await supabase
            .from('friendships')
            .insert([
                {
                    user_id: user.id,
                    friend_id: friendId,
                    status: 'pending',
                    requested_by: user.id,
                },
                {
                    user_id: friendId,
                    friend_id: user.id,
                    status: 'pending',
                    requested_by: user.id,
                },
            ])
            .select();

        if (error) throw error;
        return data[0]; // Return first record instead of using .single()
    }

    /**
     * Accept friend request
     */
    async acceptFriendRequest(friendshipId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Update both friendship records to accepted
        const { data: friendship } = await supabase
            .from('friendships')
            .select('user_id, friend_id')
            .eq('id', friendshipId)
            .single();

        if (!friendship) throw new Error('Friendship not found');

        // Update both directions
        const { error } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .or(`and(user_id.eq.${friendship.user_id},friend_id.eq.${friendship.friend_id}),and(user_id.eq.${friendship.friend_id},friend_id.eq.${friendship.user_id})`);

        if (error) throw error;
    }

    /**
     * Reject friend request
     */
    async rejectFriendRequest(friendshipId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get friendship details
        const { data: friendship } = await supabase
            .from('friendships')
            .select('user_id, friend_id')
            .eq('id', friendshipId)
            .single();

        if (!friendship) throw new Error('Friendship not found');

        // Delete both directions
        const { error } = await supabase
            .from('friendships')
            .delete()
            .or(`and(user_id.eq.${friendship.user_id},friend_id.eq.${friendship.friend_id}),and(user_id.eq.${friendship.friend_id},friend_id.eq.${friendship.user_id})`);

        if (error) throw error;
    }

    /**
     * Remove friend
     */
    async removeFriend(friendId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Delete both directions
        const { error } = await supabase
            .from('friendships')
            .delete()
            .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

        if (error) throw error;
    }

    /**
     * Block user
     */
    async blockUser(userId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Update or create friendship with blocked status
        const { error } = await supabase
            .from('friendships')
            .upsert({
                user_id: user.id,
                friend_id: userId,
                status: 'blocked',
                requested_by: user.id,
            });

        if (error) throw error;
    }

    /**
     * Unblock user
     */
    async unblockUser(userId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('user_id', user.id)
            .eq('friend_id', userId)
            .eq('status', 'blocked');

        if (error) throw error;
    }

    /**
     * Get all friends
     */
    async getFriends(): Promise<UserProfile[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('friendships')
            .select(`
                friend:user_profiles!friendships_friend_id_fkey (
                    id,
                    username,
                    display_name,
                    avatar_url,
                    status,
                    last_seen,
                    level,
                    streak
                )
            `)
            .eq('user_id', user.id)
            .eq('status', 'accepted')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Map and return list of friends
        return data.map((item: any) => ({
            ...item.friend,
            isOnline: item.friend?.status === 'online'
        }));
    }

    /**
     * Get online friends
     */
    async getOnlineFriends(): Promise<UserProfile[]> {
        const friends = await this.getFriends();
        return friends.filter(friend => friend.status === 'online');
    }

    /**
     * Get pending friend requests (received)
     */
    async getPendingRequests(): Promise<Friendship[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('friendships')
            .select('*, friend:user_profiles!friendships_friend_id_fkey(id, username, display_name, avatar_url, status)')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .neq('requested_by', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading pending requests:', error);
            throw error;
        }
        return data || [];
    }

    /**
     * Get sent friend requests
     */
    async getSentRequests(): Promise<Friendship[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('friendships')
            .select(`
        *,
        friend:user_profiles!friend_id(*)
      `)
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .eq('requested_by', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get blocked users
     */
    async getBlockedUsers(): Promise<UserProfile[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('friendships')
            .select(`
        friend:user_profiles!friend_id(*)
      `)
            .eq('user_id', user.id)
            .eq('status', 'blocked');

        if (error) throw error;
        return (data?.map((d: any) => d.friend).filter((f: any) => f !== null) as UserProfile[]) || [];
    }

    /**
     * Search users by username or email
     */
    async searchUsers(query: string): Promise<UserProfile[]> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
            .limit(20);

        if (error) throw error;
        return data || [];
    }

    /**
     * Get user profile by ID
     */
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    /**
     * Update own profile
     */
    async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update online status
     */
    async updateStatus(status: 'online' | 'offline' | 'away'): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('user_profiles')
            .update({
                status,
                last_seen: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) throw error;
    }

    /**
     * Check if users are friends
     */
    async areFriends(userId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('friendships')
            .select('id')
            .eq('user_id', user.id)
            .eq('friend_id', userId)
            .eq('status', 'accepted')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    }

    /**
     * Get friendship status with a user
     */
    async getFriendshipStatus(userId: string): Promise<'none' | 'pending' | 'accepted' | 'blocked'> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('friendships')
            .select('status')
            .eq('user_id', user.id)
            .eq('friend_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data?.status || 'none';
    }
}

// Export singleton instance
export const friendsService = new FriendsService();
