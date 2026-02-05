import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { habitService, Habit } from '@/services/habitService';
import { HabitCard } from './HabitCard';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface HabitTrackerProps {
    userId: string;
}

const HABIT_ICONS = ['✓', '📚', '💪', '🧘', '💧', '🏃', '🎯', '🌟', '🔥', '⚡'];
const HABIT_COLORS = [
    '#8b5cf6', // Purple
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#8b5cf6'  // Purple
];

export const HabitTracker: React.FC<HabitTrackerProps> = ({ userId }) => {
    const [habits, setHabits] = useState<Array<Habit & { completed: boolean }>>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newHabit, setNewHabit] = useState({
        title: '',
        description: '',
        icon: '✓',
        color: '#8b5cf6'
    });
    const { toast } = useToast();

    useEffect(() => {
        loadHabits();
    }, [userId]);

    const loadHabits = async () => {
        try {
            setLoading(true);
            const data = await habitService.getTodaysHabits(userId);
            setHabits(data);
        } catch (error) {
            console.error('Error loading habits:', error);
            toast({
                title: 'Error',
                description: 'Failed to load habits',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHabit = async () => {
        if (!newHabit.title.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a habit title',
                variant: 'destructive'
            });
            return;
        }

        try {
            await habitService.createHabit(
                userId,
                newHabit.title,
                newHabit.description,
                newHabit.icon,
                newHabit.color
            );

            toast({
                title: 'Success',
                description: 'Habit created successfully'
            });

            setNewHabit({
                title: '',
                description: '',
                icon: '✓',
                color: '#8b5cf6'
            });
            setIsDialogOpen(false);
            await loadHabits();
        } catch (error) {
            console.error('Error creating habit:', error);
            toast({
                title: 'Error',
                description: 'Failed to create habit',
                variant: 'destructive'
            });
        }
    };

    const handleToggleHabit = async (habitId: string, completed: boolean) => {
        try {
            if (completed) {
                await habitService.uncompleteHabit(habitId);
            } else {
                await habitService.completeHabit(habitId, userId);
            }
            await loadHabits();
        } catch (error) {
            console.error('Error toggling habit:', error);
            toast({
                title: 'Error',
                description: 'Failed to update habit',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteHabit = async (habitId: string) => {
        try {
            await habitService.deleteHabit(habitId);
            toast({
                title: 'Success',
                description: 'Habit deleted successfully'
            });
            await loadHabits();
        } catch (error) {
            console.error('Error deleting habit:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete habit',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading habits...</div>
            </div>
        );
    }

    const completedCount = habits.filter(h => h.completed).length;
    const totalCount = habits.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Daily Habits</h2>
                    <p className="text-sm text-gray-500">
                        {completedCount} of {totalCount} completed today
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Habit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Habit</DialogTitle>
                            <DialogDescription>
                                Add a new habit to track daily
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    placeholder="e.g., Read for 30 minutes"
                                    value={newHabit.title}
                                    onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Description (Optional)</label>
                                <Textarea
                                    placeholder="Why is this habit important?"
                                    value={newHabit.description}
                                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Icon</label>
                                <div className="flex gap-2 mt-2">
                                    {HABIT_ICONS.map(icon => (
                                        <button
                                            key={icon}
                                            className={`w-10 h-10 rounded-lg border-2 text-xl ${newHabit.icon === icon
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                            onClick={() => setNewHabit({ ...newHabit, icon })}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Color</label>
                                <div className="flex gap-2 mt-2">
                                    {HABIT_COLORS.map(color => (
                                        <button
                                            key={color}
                                            className={`w-8 h-8 rounded-full border-2 ${newHabit.color === color
                                                    ? 'border-gray-800 scale-110'
                                                    : 'border-gray-300'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setNewHabit({ ...newHabit, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button onClick={handleCreateHabit} className="w-full">
                                Create Habit
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Progress Bar */}
            {totalCount > 0 && (
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Today's Progress</span>
                        <span className="text-sm text-gray-500">
                            {Math.round((completedCount / totalCount) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </Card>
            )}

            {/* Habits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map(habit => (
                    <HabitCard
                        key={habit.id}
                        habit={habit}
                        completed={habit.completed}
                        onToggle={() => handleToggleHabit(habit.id, habit.completed)}
                        onDelete={() => handleDeleteHabit(habit.id)}
                    />
                ))}
            </div>

            {/* Empty State */}
            {habits.length === 0 && (
                <Card className="p-12 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold mb-2">No Habits Yet</h3>
                    <p className="text-gray-500 mb-4">
                        Start building better habits by creating your first one
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Habit
                    </Button>
                </Card>
            )}
        </div>
    );
};
