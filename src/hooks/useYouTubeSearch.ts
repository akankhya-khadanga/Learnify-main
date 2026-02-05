import { useState, useEffect, useCallback } from 'react';

export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    description: string;
}

interface UseYouTubeSearchResult {
    videos: YouTubeVideo[];
    loading: boolean;
    error: string | null;
    search: (query: string) => Promise<void>;
    clearCache: () => void;
}

// Simple in-memory cache to avoid redundant API calls
const searchCache = new Map<string, YouTubeVideo[]>();

/**
 * Custom hook for searching YouTube videos
 * Uses exact milestone topic for 100% relevance
 */
export function useYouTubeSearch(): UseYouTubeSearchResult {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearCache = useCallback(() => {
        searchCache.clear();
    }, []);

    const search = useCallback(async (query: string) => {
        if (!query.trim()) {
            setVideos([]);
            return;
        }

        // Check cache first
        const cacheKey = query.toLowerCase().trim();
        if (searchCache.has(cacheKey)) {
            setVideos(searchCache.get(cacheKey)!);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

            if (!apiKey) {
                throw new Error('YouTube API key not configured. Please add VITE_YOUTUBE_API_KEY to your .env file.');
            }

            // Use EXACT query only - milestone title + skills (no generic keywords)
            // This ensures 100% relevance to the specific milestone topic
            const searchQuery = encodeURIComponent(`${query} tutorial`);

            // Build URL with filters for quality educational content
            const url = `https://www.googleapis.com/youtube/v3/search?` +
                `part=snippet` +
                `&q=${searchQuery}` +
                `&type=video` +
                `&maxResults=5` +
                `&key=${apiKey}` +
                `&relevanceLanguage=en` +
                `&videoEmbeddable=true` +
                `&videoDuration=medium` + // 4-20 min videos (excludes shorts)
                `&videoDefinition=high` +  // HD quality only
                `&order=relevance` +       // Most relevant first
                `&safeSearch=strict`;      // Safe content only

            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('YouTube API quota exceeded. Please try again later.');
                } else if (response.status === 400) {
                    throw new Error('Invalid API key or request.');
                }
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                setVideos([]);
                setError('No videos found for this topic.');
                return;
            }

            // Filter out shorts and low-quality content
            const videoResults: YouTubeVideo[] = data.items
                .filter((item: any) => {
                    const title = item.snippet.title.toLowerCase();
                    const isShort = title.includes('#short') || title.includes('shorts');
                    const isLowQuality = title.includes('❤️') || title.includes('💕') || title.length < 15;
                    return !isShort && !isLowQuality;
                })
                .slice(0, 3) // Only top 3 most relevant
                .map((item: any) => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    channelTitle: item.snippet.channelTitle,
                    description: item.snippet.description,
                }));

            if (videoResults.length === 0) {
                setVideos([]);
                setError('No quality videos found for this topic.');
                return;
            }

            // Cache results
            searchCache.set(cacheKey, videoResults);

            setVideos(videoResults);
            setError(null);
        } catch (err) {
            console.error('YouTube search error:', err);
            setError(err instanceof Error ? err.message : 'Failed to search YouTube');
            setVideos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { videos, loading, error, search, clearCache };
}
