import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Sparkles, Rocket, Code, Brain } from 'lucide-react';

interface EmptyWorkspaceStateProps {
    onCreateWorkspace: () => void;
}

export function EmptyWorkspaceState({ onCreateWorkspace }: EmptyWorkspaceStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-6"
        >
            {/* Animated Icon */}
            <motion.div
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="mb-8 relative"
            >
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <LayoutGrid className="w-24 h-24 text-primary relative z-10" />
            </motion.div>

            {/* Title & Description */}
            <h3 className="text-3xl font-black text-primary uppercase mb-3 text-center">
                No Workspaces Yet
            </h3>
            <p className="text-white/70 font-bold text-center max-w-md mb-8">
                Create your first workspace to organize your learning journey. Choose from pre-built templates or start from scratch!
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-3xl">
                {[
                    {
                        icon: <Code className="w-6 h-6" />,
                        title: "Code Editor",
                        desc: "50+ languages supported",
                        color: "neon"
                    },
                    {
                        icon: <Brain className="w-6 h-6" />,
                        title: "AI Tutor",
                        desc: "24/7 intelligent help",
                        color: "purple"
                    },
                    {
                        icon: <Rocket className="w-6 h-6" />,
                        title: "Fast Setup",
                        desc: "Ready in seconds",
                        color: "blue"
                    }
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className={`bg-white dark:bg-slate-800 border-2 border-${feature.color}/30 rounded-lg p-4 text-center`}
                    >
                        <div className={`text-${feature.color} mb-2 flex justify-center`}>
                            {feature.icon}
                        </div>
                        <h4 className={`font-black text-${feature.color} text-sm mb-1`}>
                            {feature.title}
                        </h4>
                        <p className="text-white/60 text-xs font-bold">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* CTA Button */}
            <Button
                onClick={onCreateWorkspace}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-black font-black border border-slate-200 dark:border-slate-700 shadow-float text-lg px-8 py-6 group"
            >
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Create Your First Workspace
            </Button>

            {/* Helper Text */}
            <p className="text-white/50 text-xs font-bold mt-4">
                💡 Tip: Start with a template to get up and running faster!
            </p>
        </motion.div>
    );
}
