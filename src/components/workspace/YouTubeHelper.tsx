/**
 * Production YouTube Helper with Embedded Player
 * 
 * FEATURES:
 * - Embedded YouTube player inside the website
 * - Picture-in-picture support
 * - Real YouTube Data API v3 integration
 * - Subject-based search with educational filters
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Youtube, Search, Play, Clock, Eye, AlertCircle, Loader2, ExternalLink, X } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { buildSearchQuery } from '@/services/contextService';
import type { Helper, Space } from '@/types/unifiedOS';

interface YouTubeHelperProps {
  helper: Helper;
  space: Space;
}

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  channelId: string;
  duration: string;
  views: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
}

export default function YouTubeHelper({ helper, space }: YouTubeHelperProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  // Auto-search on mount with space context
  useEffect(() => {
    const initialQuery = buildSearchQuery(space);
    searchVideos(initialQuery);
  }, [space.id]);

  /**
   * Search YouTube with educational filters
   */
  const searchVideos = async (query?: string) => {
    const searchTerm = query || searchQuery || buildSearchQuery(space);

    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchYouTubeAPI(searchTerm, {
        maxResults: 12,
        videoDuration: 'medium',
        order: 'relevance',
        safeSearch: 'strict',
        videoLicense: 'any',
      });

      setVideos(results);
    } catch (err) {
      console.error('[YouTube] Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search videos');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchVideos();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
  };

  const openInNewTab = (videoId: string) => {
    window.open(
      `https://www.youtube.com/watch?v=${videoId}&rel=0&autoplay=0`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <>
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-800/95">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
              <Youtube className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-black uppercase text-lg text-white">YouTube Learning</h3>
              <p className="text-sm text-white/60 font-medium">
                Educational videos for {space.subject}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Search ${space.subject} tutorials...`}
              className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-white h-12 text-base"
              disabled={isLoading}
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 h-12 px-6 font-bold"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Search Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
                <p className="text-white/60 font-medium text-base">Searching educational videos...</p>
              </div>
            </div>
          ) : videos.length === 0 && hasSearched ? (
            <div className="text-center py-16">
              <Youtube className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h4 className="text-xl font-black uppercase text-white mb-2">No videos found</h4>
              <p className="text-base text-white/60 font-medium">Try a different search term</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <Youtube className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h4 className="text-xl font-black uppercase text-white mb-3">
                Discover {space.subject} videos
              </h4>
              <p className="text-base text-white/60 font-medium">
                Curated educational content from top channels
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-red-500/50 transition-all group cursor-pointer"
                  onClick={() => openVideo(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-red-glow">
                        <Play className="h-7 w-7 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/90 px-2.5 py-1 rounded-lg text-sm text-white font-bold">
                      {video.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-bold text-white text-base line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-sm text-white/60 font-medium mb-3">{video.channel}</p>
                    <div className="flex items-center gap-4 text-sm text-white/50 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        <span>{video.views}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* External Link Button */}
                  <div className="px-4 pb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-sm text-white/50 hover:text-white hover:bg-white/5"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInNewTab(video.id);
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in YouTube
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Video Player Dialog - Full Screen Experience */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] bg-white dark:bg-slate-800/98 backdrop-blur-xl border-slate-200 dark:border-slate-700 p-0 flex flex-col">
          {selectedVideo && (
            <>
              <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-black uppercase text-white mb-2">
                      {selectedVideo.title}
                    </DialogTitle>
                    <p className="text-base text-white/60 font-medium">
                      {selectedVideo.channel}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedVideo(null)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </DialogHeader>

              {/* Embedded YouTube Player - Large View */}
              <div className="flex-1 min-h-0 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Video Info */}
              <div className="p-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-6 text-sm text-white/60 font-medium mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{selectedVideo.views} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{selectedVideo.duration}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => openInNewTab(selectedVideo.id)}
                  className="border-slate-200 dark:border-slate-700 text-white hover:bg-white/5"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in YouTube
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Search YouTube Data API v3
 */
async function searchYouTubeAPI(
  query: string,
  options: {
    maxResults?: number;
    videoDuration?: 'short' | 'medium' | 'long';
    order?: 'relevance' | 'date' | 'rating' | 'viewCount';
    safeSearch?: 'none' | 'moderate' | 'strict';
    videoLicense?: 'any' | 'creativeCommon';
  } = {}
): Promise<YouTubeVideo[]> {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!API_KEY) {
    throw new Error('YouTube API key not configured. Add VITE_YOUTUBE_API_KEY to .env');
  }

  const {
    maxResults = 12,
    videoDuration = 'medium',
    order = 'relevance',
    safeSearch = 'strict',
    videoLicense = 'any',
  } = options;

  // Search for videos
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('key', API_KEY);
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('maxResults', String(maxResults));
  searchUrl.searchParams.set('order', order);
  searchUrl.searchParams.set('safeSearch', safeSearch);
  searchUrl.searchParams.set('videoDuration', videoDuration);
  searchUrl.searchParams.set('videoLicense', videoLicense);
  searchUrl.searchParams.set('relevanceLanguage', 'en');

  const searchResponse = await apiService.request<any>(
    searchUrl.toString(),
    {},
    { cacheKey: `youtube-search-${query}-${maxResults}` }
  );

  if (!searchResponse.items || searchResponse.items.length === 0) {
    return [];
  }

  // Extract video IDs
  const videoIds = searchResponse.items.map((item: any) => item.id.videoId).join(',');

  // Get video details
  const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  detailsUrl.searchParams.set('key', API_KEY);
  detailsUrl.searchParams.set('id', videoIds);
  detailsUrl.searchParams.set('part', 'contentDetails,statistics,snippet');

  const detailsResponse = await apiService.request<any>(
    detailsUrl.toString(),
    {},
    { cacheKey: `youtube-details-${videoIds}` }
  );

  const videos: YouTubeVideo[] = detailsResponse.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    duration: formatDuration(item.contentDetails.duration),
    views: formatViews(parseInt(item.statistics.viewCount)),
    thumbnail: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
  }));

  return videos;
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}
