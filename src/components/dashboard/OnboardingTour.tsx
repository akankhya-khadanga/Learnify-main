import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OnboardingStep {
    title: string;
    description: string;
    target?: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        title: "Welcome to INTELLI-LEARN! 🎓",
        description: "Let's take a quick tour to help you get started with your AI-powered learning journey.",
        position: 'center'
    },
    {
        title: "Create Workspaces",
        description: "Organize your learning by creating workspaces for different subjects or projects. Each workspace includes AI Tutor, Code Editor, Notes, and more!",
        position: 'center'
    },
    {
        title: "Track Your Wellness",
        description: "We care about your mental health! Track your mood, stress levels, and get AI-powered wellness recommendations.",
        position: 'center'
    },
    {
        title: "Manage Institution Tasks",
        description: "Sync your school/college assignments and add them to workspaces for better organization.",
        position: 'center'
    },
    {
        title: "You're All Set! 🚀",
        description: "Start by creating your first workspace or explore the features. Happy learning!",
        position: 'center'
    }
];

interface OnboardingTourProps {
    onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
    };

    const handleSkip = () => {
        handleComplete();
    };

    const step = ONBOARDING_STEPS[currentStep];

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        onClick={handleSkip}
                    />

                    {/* Onboarding Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg px-4"
                    >
                        <Card className="bg-white dark:bg-slate-800 border border-neon shadow-float">
                            {/* Header */}
                            <div className="relative p-6 border-b border-neon/30">
                                <button
                                    onClick={handleSkip}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-black text-primary uppercase">
                                        {step.title}
                                    </h2>
                                </div>

                                {/* Progress Dots */}
                                <div className="flex gap-2 mt-4">
                                    {ONBOARDING_STEPS.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-2 rounded-full transition-all ${index === currentStep
                                                    ? 'w-8 bg-primary'
                                                    : index < currentStep
                                                        ? 'w-2 bg-primary/50'
                                                        : 'w-2 bg-white/20'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-white/90 font-bold text-lg leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <Button
                                    onClick={handleSkip}
                                    variant="ghost"
                                    className="text-white/70 hover:text-white font-bold"
                                >
                                    Skip Tour
                                </Button>

                                <div className="flex gap-2">
                                    {currentStep > 0 && (
                                        <Button
                                            onClick={handlePrevious}
                                            variant="outline"
                                            className="border border-neon/30 text-primary hover:bg-primary/10 font-black"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                    )}

                                    <Button
                                        onClick={handleNext}
                                        className="bg-primary hover:bg-primary/90 text-black font-black border border-slate-200 dark:border-slate-700"
                                    >
                                        {currentStep === ONBOARDING_STEPS.length - 1 ? (
                                            <>
                                                Get Started
                                                <Sparkles className="w-4 h-4 ml-2" />
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
