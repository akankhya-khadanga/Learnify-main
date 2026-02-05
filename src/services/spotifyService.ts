/**
 * Spotify Integration Service (PLACEHOLDER)
 * 
 * TODO: Replace with real Spotify Web API integration
 * Required: VITE_SPOTIFY_CLIENT_ID, VITE_SPOTIFY_CLIENT_SECRET
 * 
 * Focus-safe restrictions:
 * - No browsing, search, or discovery features
 * - Preset playlists only
 * - No social features (followers, sharing)
 * - No lyrics display
 */

export interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration_ms: number;
    uri: string;
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    trackCount: number;
    uri: string;
}

export interface PlaybackState {
    isPlaying: boolean;
    currentTrack: SpotifyTrack | null;
    volume: number;
    position_ms: number;
}

// Mock focus playlists (curated for concentration)
const MOCK_FOCUS_PLAYLISTS: SpotifyPlaylist[] = [
    {
        id: 'playlist_1',
        name: 'Deep Focus',
        description: 'Ambient and post-rock music for deep concentration',
        trackCount: 120,
        uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ'
    },
    {
        id: 'playlist_2',
        name: 'Peaceful Piano',
        description: 'Peaceful piano to help you focus and relax',
        trackCount: 180,
        uri: 'spotify:playlist:37i9dQZF1DX4sWSpwq3LiO'
    },
    {
        id: 'playlist_3',
        name: 'Study Lofi',
        description: 'Chill lofi beats for studying',
        trackCount: 200,
        uri: 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn'
    },
    {
        id: 'playlist_4',
        name: 'Classical Focus',
        description: 'Classical music for focused work',
        trackCount: 150,
        uri: 'spotify:playlist:37i9dQZF1DWWEJlAGA9gs0'
    },
    {
        id: 'playlist_5',
        name: 'Ambient Soundscapes',
        description: 'Atmospheric ambient music for concentration',
        trackCount: 90,
        uri: 'spotify:playlist:37i9dQZF1DX8Uebhn9wzrS'
    }
];

// Mock current track
const MOCK_TRACK: SpotifyTrack = {
    id: 'track_1',
    name: 'Weightless',
    artist: 'Marconi Union',
    album: 'Ambient Transmissions Vol. 2',
    duration_ms: 480000, // 8 minutes
    uri: 'spotify:track:3jjujdWJ72nww5eGnfs2E7'
};

class SpotifyService {
    private isAuthenticated: boolean = false;
    private playbackState: PlaybackState = {
        isPlaying: false,
        currentTrack: null,
        volume: 70,
        position_ms: 0
    };

    /**
     * Authenticate with Spotify (PLACEHOLDER)
     * TODO: Implement OAuth flow with Spotify Web API
     */
    async authenticate(): Promise<boolean> {
        console.log('[SPOTIFY PLACEHOLDER] Authenticating with Spotify...');
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
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
     * Get curated focus playlists (PLACEHOLDER)
     * TODO: Replace with real Spotify API call to fetch playlists
     */
    async getFocusPlaylists(): Promise<SpotifyPlaylist[]> {
        console.log('[SPOTIFY PLACEHOLDER] Fetching focus playlists...');
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_FOCUS_PLAYLISTS;
    }

    /**
     * Play a track or playlist (PLACEHOLDER)
     * TODO: Implement Spotify Web Playback SDK
     */
    async play(uri?: string): Promise<void> {
        console.log(`[SPOTIFY PLACEHOLDER] Playing: ${uri || 'current track'}`);
        await new Promise(resolve => setTimeout(resolve, 200));

        this.playbackState.isPlaying = true;
        if (!this.playbackState.currentTrack) {
            this.playbackState.currentTrack = MOCK_TRACK;
        }
    }

    /**
     * Pause playback (PLACEHOLDER)
     * TODO: Implement Spotify Web Playback SDK pause
     */
    async pause(): Promise<void> {
        console.log('[SPOTIFY PLACEHOLDER] Pausing playback...');
        await new Promise(resolve => setTimeout(resolve, 200));
        this.playbackState.isPlaying = false;
    }

    /**
     * Set volume (PLACEHOLDER)
     * TODO: Implement Spotify Web Playback SDK volume control
     */
    async setVolume(volume: number): Promise<void> {
        console.log(`[SPOTIFY PLACEHOLDER] Setting volume to ${volume}%`);
        await new Promise(resolve => setTimeout(resolve, 100));
        this.playbackState.volume = Math.max(0, Math.min(100, volume));
    }

    /**
     * Get current playback state (PLACEHOLDER)
     */
    getPlaybackState(): PlaybackState {
        return { ...this.playbackState };
    }

    /**
     * Skip to next track (PLACEHOLDER)
     * TODO: Implement Spotify Web Playback SDK skip
     */
    async skipToNext(): Promise<void> {
        console.log('[SPOTIFY PLACEHOLDER] Skipping to next track...');
        await new Promise(resolve => setTimeout(resolve, 200));
        // In real implementation, would update currentTrack
    }

    /**
     * Skip to previous track (PLACEHOLDER)
     * TODO: Implement Spotify Web Playback SDK previous
     */
    async skipToPrevious(): Promise<void> {
        console.log('[SPOTIFY PLACEHOLDER] Skipping to previous track...');
        await new Promise(resolve => setTimeout(resolve, 200));
        // In real implementation, would update currentTrack
    }

    /**
     * Auto-start playback when Focus Room starts
     * This is called from Focus Room component
     */
    async autoStartForFocus(playlistUri?: string): Promise<void> {
        console.log('[SPOTIFY PLACEHOLDER] Auto-starting focus music...');
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        const uri = playlistUri || MOCK_FOCUS_PLAYLISTS[0].uri;
        await this.play(uri);
    }

    /**
     * Disconnect (PLACEHOLDER)
     */
    disconnect(): void {
        console.log('[SPOTIFY PLACEHOLDER] Disconnecting...');
        this.isAuthenticated = false;
        this.playbackState = {
            isPlaying: false,
            currentTrack: null,
            volume: 70,
            position_ms: 0
        };
    }
}

// Singleton instance
export const spotifyService = new SpotifyService();
