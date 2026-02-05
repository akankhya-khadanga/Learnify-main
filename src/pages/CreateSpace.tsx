/**
 * Create Workspace - Multi-step Wizard
 * 
 * Guides users through creating a new workspace.
 * Redesigned to match dashboard aesthetic.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUnifiedOSStore } from '@/store/unifiedOSStore';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  User,
  LayoutGrid,
} from 'lucide-react';
import type { SpaceLevel } from '@/types/unifiedOS';

interface CreateSpaceForm {
  name: string;
  subject: string;
  learning_goal: string;
  level: SpaceLevel;
  duration_weeks: number;
  instructor_type: 'ai' | 'human';
  instructor_id?: string;
}

const STEPS = [
  { id: 1, name: 'Name', icon: BookOpen },
  { id: 2, name: 'Subject', icon: Sparkles },
  { id: 3, name: 'Goal', icon: Target },
  { id: 4, name: 'Level', icon: TrendingUp },
  { id: 5, name: 'Duration', icon: Calendar },
  { id: 6, name: 'Instructor', icon: User },
];

const LEVEL_OPTIONS: Array<{
  value: SpaceLevel;
  label: string;
  description: string;
  color: string;
}> = [
    {
      value: 'beginner',
      label: 'Beginner',
      description: 'Starting from scratch, learning fundamentals',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: 'Have basics, want to deepen understanding',
      color: 'bg-blue/20 text-blue border-blue/30',
    },
    {
      value: 'advanced',
      label: 'Advanced',
      description: 'Expert-level content and challenges',
      color: 'bg-accent/20 text-accent border-purple/30',
    },
  ];

const DURATION_OPTIONS = [4, 6, 8, 12, 16, 20, 24];

const POPULAR_SUBJECTS = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'History',
  'Economics',
  'Psychology',
  'Engineering',
];

export default function CreateSpace() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const spaces = useUnifiedOSStore((state) => state.spaces);
  const setSpaces = useUnifiedOSStore((state) => state.setSpaces);
  const setActiveSpace = useUnifiedOSStore((state) => state.setActiveSpace);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateSpaceForm>({
    name: '',
    subject: '',
    learning_goal: '',
    level: 'intermediate',
    duration_weeks: 12,
    instructor_type: 'ai',
  });

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.subject.trim().length > 0;
      case 3:
        return formData.learning_goal.trim().length > 0;
      case 4:
        return formData.level !== null;
      case 5:
        return formData.duration_weeks > 0;
      case 6:
        return formData.instructor_type !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    if (!isStepValid()) return;

    // TODO: Save to Supabase
    const newSpace = {
      id: `space-${Date.now()}`,
      user_id: 'user-1', // TODO: Get from auth
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      progress_percentage: 0,
      is_archived: false,
    };

    setSpaces([...spaces, newSpace]);
    setActiveSpace(newSpace);

    toast({
      title: 'Workspace created!',
      description: `"${newSpace.name}" is ready for you.`,
    });

    navigate(`/unified-os/workspace/${newSpace.id}`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-lg font-black uppercase text-white">
                What would you like to call this workspace?
              </Label>
              <Input
                id="name"
                placeholder="e.g., Advanced Calculus, Web Development Bootcamp"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary/50 text-white h-14 text-lg"
                autoFocus
              />
            </div>
            <p className="text-base text-white/60 font-medium">
              Choose a descriptive name that reflects what you'll be learning.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="subject" className="text-lg font-black uppercase text-white">
                What subject will you be studying?
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Computer Science, Physics"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="mt-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary/50 text-white h-14 text-lg"
                autoFocus
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-white/70 uppercase">Popular subjects</Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {POPULAR_SUBJECTS.map((subject) => (
                  <Badge
                    key={subject}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-black text-white/70 border-slate-200 dark:border-slate-700 font-semibold px-4 py-2 text-sm"
                    onClick={() => setFormData({ ...formData, subject })}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="goal" className="text-lg font-black uppercase text-white">
                What's your learning goal?
              </Label>
              <Textarea
                id="goal"
                placeholder="e.g., Master integration techniques and applications in real-world problems"
                value={formData.learning_goal}
                onChange={(e) =>
                  setFormData({ ...formData, learning_goal: e.target.value })
                }
                className="mt-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary/50 text-white min-h-[140px] text-base"
                autoFocus
              />
            </div>
            <p className="text-base text-white/60 font-medium">
              Be specific about what you want to achieve. This helps AI tutors
              provide better guidance.
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Label className="text-lg font-black uppercase text-white block">
              What's your current level in this subject?
            </Label>

            <div className="space-y-4">
              {LEVEL_OPTIONS.map((option) => (
                <Card
                  key={option.value}
                  className={`p-6 cursor-pointer transition-all border ${formData.level === option.value
                      ? 'bg-primary/10 border-neon'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-white/30'
                    }`}
                  onClick={() => setFormData({ ...formData, level: option.value })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black uppercase text-xl text-white mb-2">
                        {option.label}
                      </h4>
                      <p className="text-base text-white/70 font-medium">
                        {option.description}
                      </p>
                    </div>
                    {formData.level === option.value && (
                      <Check className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Label className="text-lg font-black uppercase text-white block">
              How many weeks do you want to dedicate to this?
            </Label>

            <div className="grid grid-cols-4 gap-4">
              {DURATION_OPTIONS.map((weeks) => (
                <Card
                  key={weeks}
                  className={`p-5 cursor-pointer text-center transition-all ${formData.duration_weeks === weeks
                      ? 'bg-primary/10 border-neon'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-white/30'
                    }`}
                  onClick={() =>
                    setFormData({ ...formData, duration_weeks: weeks })
                  }
                >
                  <div className="text-3xl font-black text-white">
                    {weeks}
                  </div>
                  <div className="text-sm text-white/60 font-medium mt-1 uppercase">weeks</div>
                  {formData.duration_weeks === weeks && (
                    <Check className="h-5 w-5 text-primary mx-auto mt-3" />
                  )}
                </Card>
              ))}
            </div>

            <p className="text-base text-white/60 font-medium">
              This helps structure your learning path. You can adjust it later.
            </p>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <Label className="text-lg font-black uppercase text-white block">
              Choose your learning instructor
            </Label>

            <div className="space-y-4">
              <Card
                className={`p-6 cursor-pointer transition-all ${formData.instructor_type === 'ai'
                    ? 'bg-primary/10 border-neon'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-white/30'
                  }`}
                onClick={() =>
                  setFormData({ ...formData, instructor_type: 'ai' })
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black uppercase text-xl text-white flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Instructor (Recommended)
                    </h4>
                    <p className="text-base text-white/70 font-medium">
                      Powered by Gemini. Available 24/7, adapts to your pace.
                    </p>
                  </div>
                  {formData.instructor_type === 'ai' && (
                    <Check className="h-6 w-6 text-primary" />
                  )}
                </div>
              </Card>

              <Card
                className={`p-6 cursor-pointer transition-all ${formData.instructor_type === 'human'
                    ? 'bg-accent/10 border-purple'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-white/30'
                  }`}
                onClick={() =>
                  setFormData({ ...formData, instructor_type: 'human' })
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black uppercase text-xl text-white mb-2">
                      Human Instructor
                    </h4>
                    <p className="text-base text-white/70 font-medium">
                      Connect with expert teachers. Schedule-based sessions.
                    </p>
                  </div>
                  {formData.instructor_type === 'human' && (
                    <Check className="h-6 w-6 text-accent" />
                  )}
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-white">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1D23] via-[#252A33] to-[#1A1D23]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 backdrop-blur-xl px-6 py-5">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/unified-os')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Workspaces
            </Button>
            <div className="flex-1 flex items-center gap-3">
              <LayoutGrid className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-black uppercase text-primary">
                Create Workspace
              </h1>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 backdrop-blur-xl px-6 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all font-black text-base ${isActive
                            ? 'bg-primary text-black'
                            : isCompleted
                              ? 'bg-accent text-white'
                              : 'bg-white dark:bg-slate-800 text-white/50 border-2 border-slate-200 dark:border-slate-700'
                          }`}
                      >
                        {isCompleted ? (
                          <Check className="h-6 w-6" />
                        ) : (
                          <StepIcon className="h-6 w-6" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold mt-2 uppercase ${isActive
                            ? 'text-primary'
                            : isCompleted
                              ? 'text-accent'
                              : 'text-white/50'
                          }`}
                      >
                        {step.name}
                      </span>
                    </div>

                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-16 h-1 mb-6 mx-2 transition-all ${isCompleted ? 'bg-accent' : 'bg-white/10'
                          }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 p-10">
                  {renderStep()}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-10 pt-10 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="border-slate-200 dark:border-slate-700 text-white hover:bg-white/10 disabled:opacity-30 h-12 px-6 font-bold"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back
                    </Button>

                    {currentStep < STEPS.length ? (
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="bg-primary text-black hover:bg-primary/90 disabled:opacity-30 h-12 px-6 font-black"
                      >
                        Continue
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCreate}
                        disabled={!isStepValid()}
                        className="bg-primary text-black hover:bg-primary/90 disabled:opacity-30 h-12 px-6 font-black"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Create Workspace
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
