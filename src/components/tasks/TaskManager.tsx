import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTasks, Task } from '@/hooks/useTasks';
import { Plus, CheckCircle, Circle, Trash2, Calendar, AlertCircle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const PRIORITY_COLORS = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
};

const CATEGORIES = ['study', 'assignment', 'project', 'personal', 'other'];

export const TaskManager: React.FC = () => {
    const {
        tasks,
        loading,
        createTask,
        toggleTaskCompletion,
        deleteTask,
        getOverdueTasks,
        getUpcomingTasks,
    } = useTasks();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [showCompleted, setShowCompleted] = useState(false);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        category: 'study',
        priority: 'medium' as Task['priority'],
        due_date: '',
    });

    const handleCreateTask = async () => {
        if (!newTask.title.trim()) return;

        await createTask({
            ...newTask,
            due_date: newTask.due_date || undefined,
        });

        setNewTask({
            title: '',
            description: '',
            category: 'study',
            priority: 'medium',
            due_date: '',
        });
        setShowCreateDialog(false);
    };

    const filteredTasks = tasks.filter(task => {
        if (!showCompleted && task.completed) return false;
        if (filterCategory !== 'all' && task.category !== filterCategory) return false;
        if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
        return true;
    });

    const overdueTasks = getOverdueTasks();
    const upcomingTasks = getUpcomingTasks();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-4xl font-black text-primary mb-2">Task Manager</h1>
                    <p className="text-white/70 font-bold">Organize and track your tasks</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border border-neon shadow-float p-4">
                        <div className="text-center">
                            <p className="text-3xl font-black text-primary">{tasks.filter(t => !t.completed).length}</p>
                            <p className="text-sm font-bold text-white/70">Active Tasks</p>
                        </div>
                    </Card>

                    <Card className="border-4 border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] p-4">
                        <div className="text-center">
                            <p className="text-3xl font-black text-green-500">{tasks.filter(t => t.completed).length}</p>
                            <p className="text-sm font-bold text-white/70">Completed</p>
                        </div>
                    </Card>

                    <Card className="border-4 border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] p-4">
                        <div className="text-center">
                            <p className="text-3xl font-black text-red-500">{overdueTasks.length}</p>
                            <p className="text-sm font-bold text-white/70">Overdue</p>
                        </div>
                    </Card>

                    <Card className="border border-purple shadow-[4px_4px_0px_0px_rgba(168,85,247,1)] p-4">
                        <div className="text-center">
                            <p className="text-3xl font-black text-accent">{upcomingTasks.length}</p>
                            <p className="text-sm font-bold text-white/70">Upcoming</p>
                        </div>
                    </Card>
                </div>

                {/* Filters and Create Button */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-[180px] border border-neon/30 bg-white dark:bg-slate-800 text-white">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[180px] border border-neon/30 bg-white dark:bg-slate-800 text-white">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="border border-neon/30 text-primary hover:bg-primary hover:text-black"
                    >
                        {showCompleted ? 'Hide' : 'Show'} Completed
                    </Button>

                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="ml-auto bg-primary text-black hover:bg-primary/80 border border-slate-200 dark:border-slate-700 shadow-float font-black"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                    </Button>
                </div>

                {/* Task List */}
                <ScrollArea className="h-[600px]">
                    <AnimatePresence>
                        {loading ? (
                            <div className="text-center py-12 text-white/60">Loading tasks...</div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white/60 font-bold">No tasks found</p>
                                <p className="text-white/40 text-sm mt-2">Create a new task to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredTasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className={`border-4 ${task.completed ? 'border-green-500 bg-green-500/10' : 'border-slate-200 dark:border-slate-700'} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4`}>
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox */}
                                                <button
                                                    onClick={() => toggleTaskCompletion(task.id)}
                                                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed
                                                            ? 'bg-green-500 border-green-500'
                                                            : 'border-neon hover:border-neon hover:bg-primary/10'
                                                        }`}
                                                >
                                                    {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                                                </button>

                                                {/* Task Content */}
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-lg ${task.completed ? 'line-through text-white/50' : 'text-white'}`}>
                                                        {task.title}
                                                    </h3>
                                                    {task.description && (
                                                        <p className="text-sm text-white/60 mt-1">{task.description}</p>
                                                    )}

                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {task.category && (
                                                            <Badge variant="outline" className="border-neon text-primary">
                                                                {task.category}
                                                            </Badge>
                                                        )}
                                                        <Badge className={`${PRIORITY_COLORS[task.priority]} text-white border-2 border-black`}>
                                                            {task.priority}
                                                        </Badge>
                                                        {task.due_date && (
                                                            <Badge variant="outline" className="border-purple text-accent">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {format(new Date(task.due_date), 'MMM dd, yyyy')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Delete Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteTask(task.id)}
                                                    className="text-red-500 hover:bg-red-500/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </ScrollArea>

                {/* Create Task Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Create New Task</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title" className="font-bold">Title *</Label>
                                <Input
                                    id="title"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Enter task title"
                                    className="border-2 border-black mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="font-bold">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Add details..."
                                    className="border-2 border-black mt-1"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category" className="font-bold">Category</Label>
                                    <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                                        <SelectTrigger className="border-2 border-black mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="priority" className="font-bold">Priority</Label>
                                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}>
                                        <SelectTrigger className="border-2 border-black mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="due_date" className="font-bold">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="datetime-local"
                                    value={newTask.due_date}
                                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                    className="border-2 border-black mt-1"
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={handleCreateTask}
                                    className="flex-1 bg-primary text-black hover:bg-primary/80 border border-slate-200 dark:border-slate-700 shadow-float font-black"
                                >
                                    Create Task
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                    className="border-2 border-black"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
