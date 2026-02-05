import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Star, Bookmark } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useState } from 'react';

interface CourseCardProps {
    id: string;
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
    tags?: string[];
    estimatedHours?: number;
    totalModules?: number;
    rating?: number;
    progress?: number;
    colorStart: string;
    colorEnd: string;
    isBookmarked?: boolean;
    onBookmarkToggle?: (id: string) => void;
}

const levelColors = {
    beginner: { badge: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400' },
    intermediate: { badge: 'bg-accent-500/20 text-accent-400 border-purple-500/30', dot: 'bg-accent-400' },
    advanced: { badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30', dot: 'bg-pink-400' },
};

export function EnhancedCourseCard({
    id,
    title,
    description,
    level,
    category,
    tags = [],
    estimatedHours = 0,
    totalModules = 0,
    rating = 0,
    progress = 0,
    colorStart,
    colorEnd,
    isBookmarked = false,
    onBookmarkToggle,
}: CourseCardProps) {
    const [bookmarked, setBookmarked] = useState(isBookmarked);

    const handleBookmark = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setBookmarked(!bookmarked);
        onBookmarkToggle?.(id);
    };

    return (
        <motion.div
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Card
                className="group relative h-full overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20"
                style={{
                    background: `linear-gradient(135deg, ${colorStart}15, ${colorEnd}15)`,
                }}
            >
                {/* Gradient Glow Effect */}
                <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: `linear-gradient(135deg, ${colorStart}30, ${colorEnd}30)`,
                        filter: 'blur(20px)',
                    }}
                />

                {/* Content */}
                <div className="relative z-10">
                    <CardHeader>
                        {/* Top Row: Level Badge + Bookmark */}
                        <div className="mb-3 flex items-center justify-between">
                            <Badge
                                variant="outline"
                                className={`${levelColors[level].badge} border px-3 py-1 text-xs font-bold uppercase tracking-wider`}
                            >
                                <div className={`mr-1.5 h-1.5 w-1.5 rounded-full ${levelColors[level].dot}`} />
                                <TranslatedText text={level} />
                            </Badge>

                            {/* Bookmark Button */}
                            <button
                                onClick={handleBookmark}
                                className="group/btn rounded-full p-2 transition-all hover:bg-white/10"
                                aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                            >
                                <Bookmark
                                    className={`h-4 w-4 transition-all ${bookmarked
                                        ? 'fill-neon text-primary'
                                        : 'text-white/60 group-hover/btn:text-primary'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Course Title */}
                        <CardTitle
                            className="mb-2 line-clamp-2 text-xl font-bold text-white transition-colors group-hover:text-primary"
                            style={{
                                textShadow: '0 0 20px rgba(190, 255, 0, 0.3)',
                            }}
                        >
                            {title}
                        </CardTitle>

                        {/* Description */}
                        <CardDescription className="line-clamp-3 text-sm text-white/70">
                            {description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.slice(0, 3).map((tag, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="border-slate-200 dark:border-slate-700 bg-white/5 text-xs text-white/60"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Meta Info Row */}
                        <div className="flex items-center justify-between text-sm text-white/60">
                            <div className="flex items-center gap-4">
                                {/* Duration */}
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">{estimatedHours}h</span>
                                </div>

                                {/* Modules */}
                                {totalModules > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="font-medium">{totalModules} lessons</span>
                                    </div>
                                )}
                            </div>

                            {/* Rating */}
                            {rating > 0 && (
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-neon text-primary" />
                                    <span className="font-bold text-primary">{rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar (if started) */}
                        {progress > 0 && (
                            <div className="space-y-2">
                                <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${progress}%`,
                                            background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})`,
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/50">{progress}% complete</span>
                                    {progress === 100 && (
                                        <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                                            ✓ Completed
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CTA Button */}
                        <Link to={`/courses/${id}`} className="block">
                            <Button
                                className="group/cta relative w-full overflow-hidden font-bold uppercase tracking-wider"
                                style={{
                                    background: `linear-gradient(135deg, ${colorStart}, ${colorEnd})`,
                                }}
                            >
                                {/* Hover Effect */}
                                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/cta:translate-x-[100%]" />

                                <span className="relative z-10 text-black">
                                    {progress > 0 && progress < 100 ? '→ Continue Learning' : progress === 100 ? '✓ Review Course' : 'Start Course'}
                                </span>
                            </Button>
                        </Link>
                    </CardContent>
                </div>
            </Card>
        </motion.div>
    );
}
