import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Globe,
  Search,
  Home,
  Loader2,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Sparkles
} from 'lucide-react';
import SpotlightCard from '@/components/3D/SpotlightCard';
import { TranslatedText } from '@/components/TranslatedText';

interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export default function Browser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the search input on mount
    inputRef.current?.focus();
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setCurrentUrl(query);

    // Add to history
    const newHistory = [...searchHistory.slice(0, historyIndex + 1), query];
    setSearchHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    try {
      // Using DuckDuckGo Instant Answer API
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );

      const data = await response.json();

      // Parse results
      const results: SearchResult[] = [];

      // Add abstract result if available
      if (data.AbstractText && data.AbstractURL) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL,
          description: data.AbstractText,
        });
      }

      // Add related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.forEach((topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 100),
              url: topic.FirstURL,
              description: topic.Text,
            });
          }
        });
      }

      // If no results, suggest web search
      if (results.length === 0) {
        results.push({
          title: `Search "${query}" on DuckDuckGo`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          description: 'No instant answers found. Click to search on DuckDuckGo.',
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: 'Unable to perform search. Please check your internet connection.',
        variant: 'destructive',
      });

      // Fallback to DuckDuckGo direct search
      setSearchResults([
        {
          title: `Search "${query}" on DuckDuckGo`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          description: 'Click to search on DuckDuckGo',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    performSearch(searchQuery);
  };

  const handleUrlSubmit = (url: string) => {
    setSearchQuery(url);
    performSearch(url);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousQuery = searchHistory[newIndex];
      setSearchQuery(previousQuery);
      performSearch(previousQuery);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < searchHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextQuery = searchHistory[newIndex];
      setSearchQuery(nextQuery);
      performSearch(nextQuery);
    }
  };

  const handleRefresh = () => {
    if (currentUrl) {
      performSearch(currentUrl);
    }
  };

  const handleHome = () => {
    setSearchQuery('');
    setCurrentUrl('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const handleResultClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const quickSearches = [
    'JavaScript tutorials',
    'Python programming',
    'React hooks',
    'Machine learning basics',
    'Data structures',
    'Web development',
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-800">
      <div className="container mx-auto h-[calc(100vh-6rem)] px-4 py-6">
        <div className="grid h-full gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main Browser Area */}
          <Card className="flex flex-col border-4 border-black shadow-pink-brutal bg-white dark:bg-slate-800">
            {/* Browser Header */}
            <div className="border-b border-purple/30 p-4 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-black uppercase text-primary">
                  <TranslatedText text="Web Browser" />
                </h1>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2 mb-3">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleGoBack}
                  disabled={historyIndex <= 0}
                  className="border border-purple/30 bg-accent/10 text-accent hover:bg-accent hover:text-white disabled:opacity-30"
                  title="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleGoForward}
                  disabled={historyIndex >= searchHistory.length - 1}
                  className="border border-purple/30 bg-accent/10 text-accent hover:bg-accent hover:text-white disabled:opacity-30"
                  title="Go forward"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleRefresh}
                  disabled={!currentUrl || isLoading}
                  className="border border-purple/30 bg-accent/10 text-accent hover:bg-accent hover:text-white disabled:opacity-30"
                  title="Refresh"
                >
                  <RotateCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleHome}
                  className="border border-purple/30 bg-accent/10 text-accent hover:bg-accent hover:text-white"
                  title="Home"
                >
                  <Home className="h-5 w-5" />
                </Button>
              </div>

              {/* Search/URL Bar */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50" />
                  <Input
                    ref={inputRef}
                    placeholder="Search the web or enter URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 border-2 border-neon/30 font-bold text-white placeholder:text-white/50 bg-black/50 focus-visible:ring-neon focus-visible:ring-2"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="border-2 border-neon bg-primary text-black hover:bg-primary/80 shadow-primary font-black px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Browser Content Area */}
            <ScrollArea className="flex-1 p-6 bg-white dark:bg-slate-800">
              <AnimatePresence mode="wait">
                {searchResults.length === 0 && !isLoading ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex h-full items-center justify-center"
                  >
                    <div className="text-center max-w-2xl">
                      <Globe className="mx-auto mb-6 h-24 w-24 text-primary/50" />
                      <h2 className="text-3xl font-black uppercase text-primary mb-4">
                        <TranslatedText text="Navigate the Web" />
                      </h2>
                      <p className="text-lg font-bold text-white/70 mb-6">
                        <TranslatedText text="Search anything or enter a URL to get started" />
                      </p>

                      {/* Quick Search Suggestions */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickSearches.map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer border-2 border-purple bg-accent/10 text-accent hover:bg-accent hover:text-white font-bold px-4 py-2 transition-all"
                            onClick={() => handleUrlSubmit(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="p-6 border-2 border-purple/30 rounded-xl bg-black/30 animate-pulse"
                      >
                        <div className="h-6 bg-accent/20 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-accent/10 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-accent/10 rounded w-full"></div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="mb-6">
                      <p className="text-white/60 font-bold">
                        Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{currentUrl}"
                      </p>
                    </div>

                    {searchResults.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SpotlightCard spotlightColor="rgba(255, 20, 147, 0.2)">
                          <Card
                            className="p-6 border-2 border-purple/30 shadow-pink-brutal bg-white dark:bg-slate-800 hover:border-neon hover:shadow-primary transition-all cursor-pointer group"
                            onClick={() => handleResultClick(result.url)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-black text-primary group-hover:text-accent transition-colors mb-2 flex items-center gap-2">
                                  {result.title}
                                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>
                                <p className="text-sm font-bold text-white/70 mb-2 line-clamp-2">
                                  {result.description}
                                </p>
                                <p className="text-xs font-mono text-accent/60 truncate">
                                  {result.url}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </SpotlightCard>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </Card>

          {/* Sidebar - Search Tips */}
          <div className="hidden lg:block space-y-4">
            <SpotlightCard spotlightColor="rgba(191, 90, 242, 0.3)">
              <Card className="p-6 border-2 border-purple shadow-pink-brutal bg-white dark:bg-slate-800">
                <h3 className="mb-4 text-xl font-black uppercase text-accent flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <TranslatedText text="Search Tips" />
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 border border-purple/30 rounded bg-black/30">
                    <p className="font-bold text-white mb-1">🔍 Quick Search</p>
                    <p className="text-white/60 text-xs">
                      Type your query and press Enter to search
                    </p>
                  </div>
                  <div className="p-3 border border-purple/30 rounded bg-black/30">
                    <p className="font-bold text-white mb-1">🌐 Direct URLs</p>
                    <p className="text-white/60 text-xs">
                      Enter a website URL to search for it
                    </p>
                  </div>
                  <div className="p-3 border border-purple/30 rounded bg-black/30">
                    <p className="font-bold text-white mb-1">🔗 External Links</p>
                    <p className="text-white/60 text-xs">
                      Results open in new tabs for security
                    </p>
                  </div>
                  <div className="p-3 border border-purple/30 rounded bg-black/30">
                    <p className="font-bold text-white mb-1">🚀 Quick Access</p>
                    <p className="text-white/60 text-xs">
                      Click suggested topics to search instantly
                    </p>
                  </div>
                </div>
              </Card>
            </SpotlightCard>

            {/* Powered By */}
            <Card className="p-4 border border-purple/30 bg-white dark:bg-slate-800">
              <p className="text-xs text-white/40 text-center font-bold">
                Powered by DuckDuckGo
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
