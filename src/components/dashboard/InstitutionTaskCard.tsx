import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Plus } from 'lucide-react';

interface InstitutionTask {
    id: number;
    title: string;
    type: string;
    deadline: string;
    priority: string;
    institution: string;
}

interface InstitutionTaskCardProps {
    task: InstitutionTask;
    index: number;
    onAddToWorkspace: (task: InstitutionTask) => void;
}

export function InstitutionTaskCard({ task, index, onAddToWorkspace }: InstitutionTaskCardProps) {
    const getPriorityColor = () => {
        return task.priority === 'high' ? 'shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]' : 'shadow-pink-heavy';
    };

    const getTypeColor = () => {
        if (task.type === 'exam') return 'bg-red-500';
        if (task.type === 'assignment') return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
        >
            <Card className={`border-4 border-black bg-obsidian hover:shadow-pink-brutal transition-all cursor-pointer ${getPriorityColor()}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                        <Badge className={`${getTypeColor()} text-white font-black text-xs`}>
                            {task.type.toUpperCase()}
                        </Badge>
                        <Badge className="bg-gray-700 text-white font-bold text-xs">
                            {task.institution}
                        </Badge>
                    </div>
                    <CardTitle className="text-base font-black text-white mt-2">
                        {task.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                        <Clock className="w-3 h-3" />
                        <span className="font-bold">Due: {task.deadline}</span>
                    </div>
                    <Button
                        onClick={() => onAddToWorkspace(task)}
                        className="w-full bg-gold hover:bg-gold/90 text-black font-black border-2 border-black text-xs py-2"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Workspace
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
