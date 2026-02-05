import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { createAIRoadmap } from '@/services/roadmapService';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { Sparkles, Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import type { RoadmapQuestionnaire, RoadmapDifficulty } from '@/types/roadmap';

interface CreateRoadmapDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRoadmapCreated?: () => void;
}

const STEPS = [
    { id: 1, title: 'Topic', description: 'What do you want to learn?' },
    { id: 2, title: 'Details', description: 'Tell us about your goals' },
    { id: 3, title: 'Preferences', description: 'Customize your roadmap' },
    { id: 4, title: 'Generate', description: 'AI is creating your roadmap' },
] as const;

export function CreateRoadmapDialog({ open, onOpenChange, onRoadmapCreated }: CreateRoadmapDialogProps) {
    const { toast } = useToast();
    const userId = useUserStore(state => state.user?.id);

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    // Form state
    const [topic, setTopic] = useState('');
    const [skillLevel, setSkillLevel] = useState<RoadmapDifficulty>('beginner');
    const [duration, setDuration] = useState(4);
    const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>('weeks');
    const [hoursPerWeek, setHoursPerWeek] = useState(10);
    const [includeQuizzes, setIncludeQuizzes] = useState(true);

    const handleNext = () => {
        if (currentStep === 1 && !topic.trim()) {
            toast({
                title: 'Topic Required',
                description: 'Please enter what you want to learn',
                variant: 'destructive',
            });
            return;
        }

        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleGenerate();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGenerate = async () => {
        // Get user ID directly from Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;

        if (!currentUserId) {
            toast({
                title: 'Authentication Required',
                description: 'Please log in to create a roadmap',
                variant: 'destructive',
            });
            return;
        }

        setCurrentStep(4);
        setLoading(true);
        setGenerationProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => Math.min(prev + 10, 90));
        }, 500);

        try {
            const questionnaire: RoadmapQuestionnaire = {
                topic,
                skillLevel,
                duration,
                durationUnit,
                hoursPerWeek,
                includeQuizzes,
            };

            const { roadmap, milestones, error } = await createAIRoadmap(currentUserId, questionnaire);

            clearInterval(progressInterval);
            setGenerationProgress(100);

            if (error || !roadmap) {
                throw new Error(error || 'Failed to create roadmap');
            }

            setTimeout(() => {
                toast({
                    title: '🎉 Roadmap Created!',
                    description: `Your "${topic}" roadmap with ${milestones.length} milestones is ready!`,
                });

                onRoadmapCreated?.();
                handleClose();
            }, 500);
        } catch (error: any) {
            clearInterval(progressInterval);
            console.error('Error generating roadmap:', error);

            toast({
                title: 'Generation Failed',
                description: error.message || 'Could not generate roadmap. Please try again.',
                variant: 'destructive',
            });

            setCurrentStep(3);
            setGenerationProgress(0);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setTopic('');
        setSkillLevel('beginner');
        setDuration(4);
        setDurationUnit('weeks');
        setHoursPerWeek(10);
        setIncludeQuizzes(true);
        setLoading(false);
        setGenerationProgress(0);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Create AI Roadmap
                    </DialogTitle>
                    <DialogDescription>
                        Let AI design a personalized learning path for you
                    </DialogDescription>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-6">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex flex-col items-center ${currentStep >= step.id ? '' : 'opacity-40'}`}>
                                <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border-4 border-black ${currentStep > step.id
                                        ? 'bg-primary text-black'
                                        : currentStep === step.id
                                            ? 'bg-accent text-black animate-pulse'
                                            : 'bg-muted'
                                        }`}
                                >
                                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                                </div>
                                <span className="text-xs mt-1 text-center max-w-[60px]">{step.title}</span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`h-0.5 w-12 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="topic" className="text-lg font-bold">
                                    What do you want to learn?
                                </Label>
                                <Input
                                    id="topic"
                                    placeholder="e.g., React Hooks, Machine Learning, UI/UX Design..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="mt-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    autoFocus
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Be specific! The more detail, the better your roadmap.
                                </p>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm font-semibold mb-2">Popular Topics:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['React Development', 'Python Basics', 'Data Science', 'Web Design', 'Machine Learning'].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setTopic(suggestion)}
                                            className="px-3 py-1 text-sm rounded-md bg-muted hover:bg-muted/80 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="skillLevel" className="text-lg font-bold">
                                    Your Current Skill Level
                                </Label>
                                <Select value={skillLevel} onValueChange={(value) => setSkillLevel(value as RoadmapDifficulty)}>
                                    <SelectTrigger id="skillLevel" className="mt-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                                        <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                                        <SelectItem value="advanced">Advanced - Looking to master</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="duration">Duration</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min="1"
                                        max="52"
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="mt-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="durationUnit">Unit</Label>
                                    <Select value={durationUnit} onValueChange={(value) => setDurationUnit(value as any)}>
                                        <SelectTrigger id="durationUnit" className="mt-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="days">Days</SelectItem>
                                            <SelectItem value="weeks">Weeks</SelectItem>
                                            <SelectItem value="months">Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                                <Input
                                    id="hoursPerWeek"
                                    type="number"
                                    min="1"
                                    max="40"
                                    value={hoursPerWeek}
                                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                                    className="mt-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Recommended: 5-15 hours per week for optimal learning
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div>
                                <Label className="text-lg font-bold">Roadmap Preferences</Label>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">
                                    Customize how AI builds your roadmap
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-black bg-card">
                                        <Checkbox
                                            id="includeQuizzes"
                                            checked={includeQuizzes}
                                            onCheckedChange={(checked) => setIncludeQuizzes(checked as boolean)}
                                            className="border-2 border-black"
                                        />
                                        <div>
                                            <Label htmlFor="includeQuizzes" className="font-semibold cursor-pointer">
                                                Include Practice Quizzes
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Add quiz suggestions for each milestone
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-muted border-2 border-black">
                                <p className="font-semibold mb-2">📊 Roadmap Summary:</p>
                                <ul className="text-sm space-y-1">
                                    <li>• Topic: <span className="font-semibold">{topic}</span></li>
                                    <li>• Level: <span className="font-semibold capitalize">{skillLevel}</span></li>
                                    <li>• Duration: <span className="font-semibold">{duration} {durationUnit}</span></li>
                                    <li>• Commitment: <span className="font-semibold">{hoursPerWeek} hours/week</span></li>
                                </ul>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6 py-6"
                        >
                            <div className="text-center">
                                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Generating Your Roadmap</h3>
                                <p className="text-muted-foreground">
                                    AI is analyzing your goals and creating a personalized learning path...
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold">Progress</span>
                                    <span className="text-primary">{generationProgress}%</span>
                                </div>
                                <Progress value={generationProgress} className="h-3" />
                            </div>

                            <div className="text-xs text-center text-muted-foreground space-y-1">
                                {generationProgress < 30 && <p>Analyzing your topic...</p>}
                                {generationProgress >= 30 && generationProgress < 60 && <p>Creating milestones...</p>}
                                {generationProgress >= 60 && generationProgress < 90 && <p>Adding resources...</p>}
                                {generationProgress >= 90 && <p>Finalizing your roadmap...</p>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Buttons */}
                {currentStep < 4 && (
                    <div className="flex justify-between gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            className="bg-primary hover:bg-primary/90 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {currentStep === 3 ? (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate Roadmap
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
