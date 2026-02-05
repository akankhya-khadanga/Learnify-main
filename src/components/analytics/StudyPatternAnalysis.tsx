import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { analyticsService, HeatMapData } from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';
import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    Cell,
    BarChart,
    Bar,
    CartesianGrid,
    Legend
} from 'recharts';
import { Clock, TrendingUp, Calendar } from 'lucide-react';

interface StudyPatternAnalysisProps {
    userId: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const StudyPatternAnalysis: React.FC<StudyPatternAnalysisProps> = ({ userId }) => {
    const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([]);
    const [weeklySummary, setWeeklySummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadAnalytics();
    }, [userId]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const [heatMap, summary] = await Promise.all([
                analyticsService.getHeatMapData(userId),
                analyticsService.getWeeklySummary(userId)
            ]);

            setHeatMapData(heatMap);
            setWeeklySummary(summary);
        } catch (error) {
            console.error('Error loading analytics:', error);
            toast({
                title: 'Error',
                description: 'Failed to load study patterns',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Transform heat map data for scatter chart
    const scatterData = heatMapData.map(item => ({
        x: item.hour,
        y: item.day,
        z: item.value
    }));

    // Get max value for color scaling
    const maxValue = Math.max(...heatMapData.map(d => d.value), 1);

    // Get color based on value
    const getColor = (value: number) => {
        const intensity = value / maxValue;
        if (intensity > 0.7) return '#8b5cf6'; // Purple
        if (intensity > 0.4) return '#a78bfa'; // Light purple
        if (intensity > 0.2) return '#c4b5fd'; // Lighter purple
        return '#e9d5ff'; // Very light purple
    };

    // Format time for best study times
    const formatHour = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${period}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Study Time</p>
                            <p className="text-2xl font-bold">
                                {Math.round(weeklySummary?.totalMinutes || 0)} min
                            </p>
                            <p className="text-xs text-gray-400">This week</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg Session</p>
                            <p className="text-2xl font-bold">
                                {Math.round(weeklySummary?.avgSessionDuration || 0)} min
                            </p>
                            <p className="text-xs text-gray-400">
                                {weeklySummary?.sessionCount || 0} sessions
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Best Time</p>
                            <p className="text-2xl font-bold">
                                {formatHour(weeklySummary?.mostProductiveHour || 0)}
                            </p>
                            <p className="text-xs text-gray-400">
                                {DAYS[weeklySummary?.mostProductiveDay || 0]}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Heat Map */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Study Pattern Heat Map</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Darker colors indicate more study time during that hour
                </p>

                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Hour"
                            domain={[0, 23]}
                            ticks={[0, 6, 12, 18, 23]}
                            tickFormatter={formatHour}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Day"
                            domain={[0, 6]}
                            ticks={[0, 1, 2, 3, 4, 5, 6]}
                            tickFormatter={(value) => DAYS[value]}
                        />
                        <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white p-3 border rounded shadow-lg">
                                            <p className="font-semibold">
                                                {DAYS[data.y]} at {formatHour(data.x)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {Math.round(data.z)} minutes studied
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter data={scatterData}>
                            {scatterData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.z)} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </Card>

            {/* Weekly Distribution */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Study Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={DAYS.map((day, index) => ({
                            day,
                            minutes: heatMapData
                                .filter(d => d.day === index)
                                .reduce((sum, d) => sum + d.value, 0)
                        }))}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="minutes" fill="#8b5cf6" name="Study Time (min)" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Insights */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Insights & Recommendations</h3>
                <div className="space-y-3">
                    {weeklySummary?.mostProductiveHour !== undefined && (
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="font-medium text-purple-900">Peak Performance Time</p>
                            <p className="text-sm text-purple-700">
                                You're most productive around {formatHour(weeklySummary.mostProductiveHour)} on{' '}
                                {DAYS[weeklySummary.mostProductiveDay]}s. Try scheduling important tasks during this time.
                            </p>
                        </div>
                    )}

                    {weeklySummary?.avgSessionDuration < 30 && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="font-medium text-blue-900">Session Length</p>
                            <p className="text-sm text-blue-700">
                                Your average session is {Math.round(weeklySummary.avgSessionDuration)} minutes.
                                Consider using the Pomodoro technique (25-min focused sessions) for better retention.
                            </p>
                        </div>
                    )}

                    {heatMapData.length === 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900">Start Tracking</p>
                            <p className="text-sm text-gray-700">
                                Begin studying to see your patterns emerge. We'll analyze your habits and suggest optimal study times.
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
