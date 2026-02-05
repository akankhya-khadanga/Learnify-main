import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useYouTubeSearch, type YouTubeVideo } from '@/hooks/useYouTubeSearch';
import { Play, X, Loader2, AlertCircle, Youtube } from 'lucide-react';

interface TopicVideoPlayerProps {
    searchQuery: string;
    skills?: string[];
}

export function TopicVideoPlayer({ searchQuery, skills = [] }: TopicVideoPlayerProps) {
    const { videos, loading, error, search } = useYouTubeSearch();
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (searchQuery && !hasSearched) {
            // Enhance search query with skills for better relevance
            const enhancedQuery = skills.length > 0
                ? `${searchQuery} ${skills.slice(0, 2).join(' ')}`
                : searchQuery;

            search(enhancedQuery);
            setHasSearched(true);
        }
    }, [searchQuery, skills, search, hasSearched]);

    const handleVideoSelect = (video: YouTubeVideo) => {
        setSelectedVideo(video);
    };

    const handleClosePlayer = () => {
        setSelectedVideo(null);
    };

    // Loading state
    if (loading) {
        return (
            <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Searching for relevant videos...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-red-500/5">
                <CardContent className="p-6">
                    <div className="flex items-start gap-3 text-red-600">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-1">Unable to load videos</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // No videos found
    if (videos.length === 0 && hasSearched) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-[#FF0000]" />
                <h3 className="text-lg font-bold">Video Tutorials</h3>
            </div>

            <AnimatePresence mode="wait">
                {selectedVideo ? (
                    // Expanded Video Player
                    <motion.div
                        key="player"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <CardContent className="p-4 space-y-4">
                                {/* Player Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold line-clamp-2 mb-1">{selectedVideo.title}</h4>
                                        <p className="text-sm text-muted-foreground">{selectedVideo.channelTitle}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClosePlayer}
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Embedded Player */}
                                <div className="aspect-video rounded-lg overflow-hidden border-4 border-black bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&rel=0`}
                                        title={selectedVideo.title}
                                        frameBorder="0"
                                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>

                                {/* Show other videos */}
                                {videos.length > 1 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Other videos</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {videos
                                                .filter((v) => v.id !== selectedVideo.id)
                                                .map((video) => (
                                                    <button
                                                        key={video.id}
                                                        onClick={() => handleVideoSelect(video)}
                                                        className="relative aspect-video rounded-lg overflow-hidden border-2 border-black hover:border-primary transition-colors group"
                                                    >
                                                        <img
                                                            src={video.thumbnail}
                                                            alt={video.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                                            <Play className="h-6 w-6 text-white" />
                                                        </div>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    // Video Thumbnails Grid
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                        {videos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group cursor-pointer">
                                    <button
                                        onClick={() => handleVideoSelect(video)}
                                        className="w-full text-left"
                                    >
                                        <CardContent className="p-3 space-y-2">
                                            {/* Thumbnail */}
                                            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-black bg-black">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                                    <div className="h-12 w-12 rounded-full bg-[#FF0000] border-2 border-white flex items-center justify-center shadow-lg">
                                                        <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-sm line-clamp-2 leading-tight text-foreground">
                                                    {video.title}
                                                </h4>
                                                <p className="text-xs text-foreground/80 line-clamp-1 font-medium">
                                                    {video.channelTitle}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </button>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
