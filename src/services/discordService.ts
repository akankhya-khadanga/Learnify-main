/**
 * Discord Integration Service (PLACEHOLDER)
 * 
 * TODO: Replace with real Discord API integration
 * Required: VITE_DISCORD_CLIENT_ID, VITE_DISCORD_BOT_TOKEN
 * 
 * Learning-safe restrictions:
 * - Study group servers only (whitelist)
 * - DMs disabled by default
 * - No server browsing
 * - Auto-mute during Focus Mode
 * - Text channels for study groups only
 */

export interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
}

export interface DiscordChannel {
    id: string;
    name: string;
    type: 'text' | 'voice';
    serverId: string;
    serverName: string;
}

export interface DiscordMessage {
    id: string;
    channelId: string;
    author: DiscordUser;
    content: string;
    timestamp: Date;
}

// Mock study servers
const MOCK_STUDY_SERVERS = [
    {
        id: 'server_1',
        name: 'Study Group - Computer Science',
        channels: [
            { id: 'channel_1', name: 'general-study', type: 'text' as const, serverId: 'server_1', serverName: 'Study Group - Computer Science' },
            { id: 'channel_2', name: 'code-help', type: 'text' as const, serverId: 'server_1', serverName: 'Study Group - Computer Science' },
            { id: 'channel_3', name: 'voice-study-room', type: 'voice' as const, serverId: 'server_1', serverName: 'Study Group - Computer Science' }
        ]
    },
    {
        id: 'server_2',
        name: 'Study Group - Mathematics',
        channels: [
            { id: 'channel_4', name: 'math-discussions', type: 'text' as const, serverId: 'server_2', serverName: 'Study Group - Mathematics' },
            { id: 'channel_5', name: 'study-voice', type: 'voice' as const, serverId: 'server_2', serverName: 'Study Group - Mathematics' }
        ]
    }
];

// Mock users in study room
const MOCK_ONLINE_USERS: DiscordUser[] = [
    {
        id: 'user_1',
        username: 'StudyBuddy42',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StudyBuddy42',
        discriminator: '1234'
    },
    {
        id: 'user_2',
        username: 'CodeLearner',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CodeLearner',
        discriminator: '5678'
    },
    {
        id: 'user_3',
        username: 'MathWhiz',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MathWhiz',
        discriminator: '9012'
    }
];

// Mock messages
const MOCK_MESSAGES: DiscordMessage[] = [
    {
        id: 'msg_1',
        channelId: 'channel_1',
        author: MOCK_ONLINE_USERS[0],
        content: 'Hey everyone! Ready for today\'s study session?',
        timestamp: new Date(Date.now() - 300000) // 5 mins ago
    },
    {
        id: 'msg_2',
        channelId: 'channel_1',
        author: MOCK_ONLINE_USERS[1],
        content: 'Yes! I\'m working on data structures. Anyone want to discuss?',
        timestamp: new Date(Date.now() - 240000) // 4 mins ago
    },
    {
        id: 'msg_3',
        channelId: 'channel_1',
        author: MOCK_ONLINE_USERS[2],
        content: 'Count me in! Let\'s start in 5 minutes.',
        timestamp: new Date(Date.now() - 180000) // 3 mins ago
    }
];

class DiscordService {
    private isAuthenticated: boolean = false;
    private currentUser: DiscordUser | null = null;
    private isMuted: boolean = false;
    private connectedVoiceChannel: string | null = null;

    /**
     * Authenticate with Discord (PLACEHOLDER)
     * TODO: Implement Discord OAuth flow
     */
    async authenticate(): Promise<boolean> {
        console.log('[DISCORD PLACEHOLDER] Authenticating with Discord...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock current user
        this.currentUser = {
            id: 'current_user',
            username: 'CurrentUser',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
            discriminator: '0001'
        };

        this.isAuthenticated = true;
        return true;
    }

    /**
     * Check if user is authenticated
     */
    isUserAuthenticated(): boolean {
        return this.isAuthenticated;
    }

    /**
     * Get current user
     */
    getCurrentUser(): DiscordUser | null {
        return this.currentUser;
    }

    /**
     * Get study group channels (PLACEHOLDER)
     * TODO: Fetch from Discord API with server whitelist filter
     */
    async getStudyChannels(): Promise<DiscordChannel[]> {
        console.log('[DISCORD PLACEHOLDER] Fetching study channels...');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Flatten all channels from study servers
        return MOCK_STUDY_SERVERS.flatMap(server => server.channels);
    }

    /**
     * Get messages from a channel (PLACEHOLDER)
     * TODO: Implement Discord API message fetching
     */
    async getChannelMessages(channelId: string, limit: number = 50): Promise<DiscordMessage[]> {
        console.log(`[DISCORD PLACEHOLDER] Fetching messages from channel ${channelId}...`);
        await new Promise(resolve => setTimeout(resolve, 200));

        return MOCK_MESSAGES.filter(msg => msg.channelId === channelId);
    }

    /**
     * Send a message to a channel (PLACEHOLDER)
     * TODO: Implement Discord API message sending
     */
    async sendMessage(channelId: string, content: string): Promise<DiscordMessage> {
        console.log(`[DISCORD PLACEHOLDER] Sending message to channel ${channelId}: ${content}`);
        await new Promise(resolve => setTimeout(resolve, 200));

        const newMessage: DiscordMessage = {
            id: `msg_${Date.now()}`,
            channelId,
            author: this.currentUser!,
            content,
            timestamp: new Date()
        };

        return newMessage;
    }

    /**
     * Get online users in a channel (PLACEHOLDER)
     * TODO: Implement Discord presence API
     */
    async getOnlineUsers(channelId: string): Promise<DiscordUser[]> {
        console.log(`[DISCORD PLACEHOLDER] Fetching online users for channel ${channelId}...`);
        await new Promise(resolve => setTimeout(resolve, 200));

        return MOCK_ONLINE_USERS;
    }

    /**
     * Join a voice channel (PLACEHOLDER)
     * TODO: Implement Discord voice connection with push-to-talk
     */
    async joinVoiceChannel(channelId: string): Promise<void> {
        console.log(`[DISCORD PLACEHOLDER] Joining voice channel ${channelId}...`);
        await new Promise(resolve => setTimeout(resolve, 300));

        this.connectedVoiceChannel = channelId;
    }

    /**
     * Leave current voice channel (PLACEHOLDER)
     */
    async leaveVoiceChannel(): Promise<void> {
        console.log('[DISCORD PLACEHOLDER] Leaving voice channel...');
        await new Promise(resolve => setTimeout(resolve, 200));

        this.connectedVoiceChannel = null;
    }

    /**
     * Get connected voice channel ID
     */
    getConnectedVoiceChannel(): string | null {
        return this.connectedVoiceChannel;
    }

    /**
     * Mute all Discord notifications (called during Focus Mode)
     */
    muteNotifications(): void {
        console.log('[DISCORD PLACEHOLDER] Muting all Discord notifications...');
        this.isMuted = true;
    }

    /**
     * Unmute Discord notifications
     */
    unmuteNotifications(): void {
        console.log('[DISCORD PLACEHOLDER] Unmuting Discord notifications...');
        this.isMuted = false;
    }

    /**
     * Check if notifications are muted
     */
    areNotificationsMuted(): boolean {
        return this.isMuted;
    }

    /**
     * Disconnect from Discord
     */
    disconnect(): void {
        console.log('[DISCORD PLACEHOLDER] Disconnecting from Discord...');
        this.isAuthenticated = false;
        this.currentUser = null;
        this.isMuted = false;
        this.connectedVoiceChannel = null;
    }
}

// Singleton instance
export const discordService = new DiscordService();
