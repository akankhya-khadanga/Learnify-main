import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Target,
    Clock,
    TrendingUp,
    Zap,
    Calendar,
    BarChart3,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import type { RoadmapAnalytics } from '@/types/roadmap';

interface RoadmapAnalyticsProps {
    analytics: RoadmapAnalytics | null;
    loading?: boolean;
}

export function RoadmapAnalyticsComponent({ analytics, loading }: RoadmapAnalyticsProps) {
    if (loading) {
        return (
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-12 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (!analytics) {
        return (
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No analytics data available</p>
                </CardContent>
            </Card>
        );
    }

    const {
        total_milestones = 0,
        completed_milestones = 0,
        in_progress_milestones = 0,
        not_started_milestones = 0,
        total_time_minutes = 0,
        avg_time_per_milestone = 0,
        estimated_remaining_hours = 0,
        completion_percentage = 0,
        velocity = 0,
        estimated_completion_date,
    } = analytics;

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Main Progress Card */}
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Overall Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Circular Progress */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-40 h-40">
                            <svg className="transform -rotate-90 w-40 h-40">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    className="text-muted/30"
                                />
                                <motion.circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="#C9B458"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * completion_percentage) / 100 }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{ strokeDasharray: 440 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold">{Math.round(completion_percentage)}%</span>
                                <span className="text-xs text-muted-foreground">Complete</span>
                            </div>
                        </div>
                    </div>

                    {/* Milestones Breakdown */}
                    <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-background border-2 border-black">
                            <div className="text-2xl font-bold">{total_milestones}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10 border-2 border-black">
                            <div className="text-2xl font-bold text-green-600">{completed_milestones}</div>
                            <div className="text-xs text-muted-foreground">Done</div>
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-500/10 border-2 border-black">
                            <div className="text-2xl font-bold text-yellow-600">{in_progress_milestones}</div>
                            <div className="text-xs text-muted-foreground">Active</div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted border-2 border-black">
                            <div className="text-2xl font-bold">{not_started_milestones}</div>
                            <div className="text-xs text-muted-foreground">Remaining</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Time & Velocity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent" />
                            Time Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Time</span>
                            <span className="font-bold">{formatTime(total_time_minutes)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Avg/Milestone</span>
                            <span className="font-bold">{formatTime(Math.round(avg_time_per_milestone))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Est. Remaining</span>
                            <span className="font-bold text-primary">{estimated_remaining_hours.toFixed(1)}h</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Learning Velocity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Pace</span>
                            <Badge className="bg-primary text-black border-2 border-black">
                                {velocity ? `${velocity.toFixed(2)}/week` : 'N/A'}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Est. Completion</span>
                            <span className="font-bold">{formatDate(estimated_completion_date)}</span>
                        </div>
                        <div className="pt-2">
                            <div className="h-2 bg-muted border-2 border-black rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-accent to-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completion_percentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 border-2 border-black flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Completion Rate</div>
                            <div className="text-lg font-bold">{total_milestones > 0 ? Math.round((completed_milestones / total_milestones) * 100) : 0}%</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 border-2 border-black flex items-center justify-center">
                            <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">XP Earned</div>
                            <div className="text-lg font-bold text-primary">{completed_milestones * 100}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent/10 border-2 border-black flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Days Active</div>
                            <div className="text-lg font-bold">{Math.max(1, Math.ceil(total_time_minutes / (60 * 2)))}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
