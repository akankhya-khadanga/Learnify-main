import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { habitService, Habit } from '@/services/habitService';
import { Trash2, Flame } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HabitCardProps {
    habit: Habit;
    completed: boolean;
    onToggle: () => void;
    onDelete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
    habit,
    completed,
    onToggle,
    onDelete
}) => {
    const [streak, setStreak] = useState(0);
    const [weeklyGrid, setWeeklyGrid] = useState<boolean[]>([]);

    useEffect(() => {
        loadHabitData();
    }, [habit.id]);

    const loadHabitData = async () => {
        try {
            const [streakData, gridData] = await Promise.all([
                habitService.calculateStreak(habit.id),
                habitService.getWeeklyGrid(habit.id)
            ]);
            setStreak(streakData);
            setWeeklyGrid(gridData);
        } catch (error) {
            console.error('Error loading habit data:', error);
        }
    };

    const getDayLabel = (index: number) => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const today = new Date().getDay();
        const dayIndex = (today - 6 + index + 7) % 7;
        return days[dayIndex];
    };

    return (
        <Card
            className="p-4 transition-all hover:shadow-lg"
            style={{ borderLeft: `4px solid ${habit.color}` }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                        checked={completed}
                        onCheckedChange={onToggle}
                        className="w-6 h-6"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{habit.icon}</span>
                            <h3 className="font-semibold text-lg">{habit.title}</h3>
                        </div>
                        {habit.description && (
                            <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                        )}
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will archive "{habit.title}" and all its completion history.
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Streak Counter */}
            {streak > 0 && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-orange-700">
                        {streak} day{streak !== 1 ? 's' : ''} streak!
                    </span>
                </div>
            )}

            {/* Weekly Grid */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
                {weeklyGrid.map((isCompleted, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-400">{getDayLabel(index)}</span>
                        <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isCompleted
                                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-300'
                                }`}
                        >
                            {isCompleted ? '✓' : '·'}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
