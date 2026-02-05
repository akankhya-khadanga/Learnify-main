import { useState, useEffect } from 'react';
import { spotifyService, SpotifyPlaylist, PlaybackState } from '@/services/spotifyService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, SkipForward, SkipBack } from 'lucide-react';

interface SpotifyMiniPlayerProps {
    compact?: boolean;
    autoStart?: boolean;
    className?: string;
}

export function SpotifyMiniPlayer({ compact = false, autoStart = false, className = '' }: SpotifyMiniPlayerProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');
    const [playbackState, setPlaybackState] = useState<PlaybackState>({
        isPlaying: false,
        currentTrack: null,
        volume: 70,
        position_ms: 0
    });

    useEffect(() => {
        // Auto-authenticate on mount
        const init = async () => {
            const authenticated = await spotifyService.authenticate();
            setIsAuthenticated(authenticated);

            if (authenticated) {
                const fetchedPlaylists = await spotifyService.getFocusPlaylists();
                setPlaylists(fetchedPlaylists);

                if (fetchedPlaylists.length > 0) {
                    setSelectedPlaylist(fetchedPlaylists[0].id);
                }

                // Auto-start if requested (for Focus Room)
                if (autoStart && fetchedPlaylists.length > 0) {
                    await spotifyService.autoStartForFocus(fetchedPlaylists[0].uri);
                }
            }

            // Update playback state
            setPlaybackState(spotifyService.getPlaybackState());
        };

        init();

        // Poll playback state every second
        const interval = setInterval(() => {
            setPlaybackState(spotifyService.getPlaybackState());
        }, 1000);

        return () => clearInterval(interval);
    }, [autoStart]);

    const handlePlayPause = async () => {
        if (playbackState.isPlaying) {
            await spotifyService.pause();
        } else {
            await spotifyService.play();
        }
        setPlaybackState(spotifyService.getPlaybackState());
    };

    const handleVolumeChange = async (value: number[]) => {
        await spotifyService.setVolume(value[0]);
        setPlaybackState(spotifyService.getPlaybackState());
    };

    const handlePlaylistChange = async (playlistId: string) => {
        setSelectedPlaylist(playlistId);
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist) {
            await spotifyService.play(playlist.uri);
            setPlaybackState(spotifyService.getPlaybackState());
        }
    };

    const handleSkipNext = async () => {
        await spotifyService.skipToNext();
        setPlaybackState(spotifyService.getPlaybackState());
    };

    const handleSkipPrevious = async () => {
        await spotifyService.skipToPrevious();
        setPlaybackState(spotifyService.getPlaybackState());
    };

    if (!isAuthenticated) {
        return (
            <Card className={`p-4 bg-obsidian border-2 border-gold/20 ${className}`}>
                <div className="text-center text-text/60">
                    <p className="text-sm">Spotify not connected</p>
                    <p className="text-xs mt-1">(Placeholder - Add API keys to connect)</p>
                </div>
            </Card>
        );
    }

    if (compact) {
        // Compact version for dashboard
        return (
            <Card className={`p-3 bg-obsidian border-2 border-gold/20 ${className}`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handlePlayPause}
                            className="h-8 w-8 p-0 hover:bg-gold/20"
                        >
                            {playbackState.isPlaying ? (
                                <Pause className="h-4 w-4 text-gold" />
                            ) : (
                                <Play className="h-4 w-4 text-gold" />
                            )}
                        </Button>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-text truncate">
                                {playbackState.currentTrack?.name || 'No track playing'}
                            </p>
                            <p className="text-[10px] text-text/60 truncate">
                                {playbackState.currentTrack?.artist || 'Focus Music'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Volume2 className="h-3 w-3 text-text/60" />
                        <span className="text-xs text-text/60 min-w-[2ch]">{playbackState.volume}</span>
                    </div>
                </div>
            </Card>
        );
    }

    // Full version for Focus Room
    return (
        <Card className={`p-4 bg-obsidian border-2 border-gold/20 ${className}`}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase text-gold">Focus Music</h3>
                    <div className="text-xs text-text/60 bg-gold/10 px-2 py-1 rounded">
                        Spotify
                    </div>
                </div>

                {/* Playlist Selector */}
                <div>
                    <label className="text-xs text-text/60 block mb-1">Playlist</label>
                    <Select value={selectedPlaylist} onValueChange={handlePlaylistChange}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-gold/20">
                            <SelectValue placeholder="Select playlist" />
                        </SelectTrigger>
                        <SelectContent>
                            {playlists.map((playlist) => (
                                <SelectItem key={playlist.id} value={playlist.id}>
                                    {playlist.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Now Playing */}
                {playbackState.currentTrack && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                        <p className="text-xs text-text/60 mb-1">Now Playing</p>
                        <p className="text-sm font-bold text-text">
                            {playbackState.currentTrack.name}
                        </p>
                        <p className="text-xs text-text/60">
                            {playbackState.currentTrack.artist}
                        </p>
                    </div>
                )}

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSkipPrevious}
                        className="h-8 w-8 p-0 hover:bg-gold/20"
                    >
                        <SkipBack className="h-4 w-4 text-text" />
                    </Button>
                    <Button
                        size="lg"
                        onClick={handlePlayPause}
                        className="h-12 w-12 rounded-full bg-gold hover:bg-gold/80 text-black"
                    >
                        {playbackState.isPlaying ? (
                            <Pause className="h-6 w-6" />
                        ) : (
                            <Play className="h-6 w-6 ml-0.5" />
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSkipNext}
                        className="h-8 w-8 p-0 hover:bg-gold/20"
                    >
                        <SkipForward className="h-4 w-4 text-text" />
                    </Button>
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-text/60 flex items-center gap-1">
                            <Volume2 className="h-3 w-3" />
                            Volume
                        </label>
                        <span className="text-xs text-text">{playbackState.volume}%</span>
                    </div>
                    <Slider
                        value={[playbackState.volume]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-full"
                    />
                </div>

                {/* Restriction Notice */}
                <p className="text-[10px] text-text/40 text-center border-t border-text/10 pt-2">
                    Focus-safe mode: Only preset playlists available
                </p>
            </div>
        </Card>
    );
}
