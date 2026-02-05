import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Target, Users, Globe, Sparkles, ArrowRight, Github, Rocket, Trophy, BookOpen } from 'lucide-react';
import { signInWithGoogle, judgeBypassLogin } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';
import { useUserStore } from '@/store/userStore';

export default function LandingGold() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const { error } = await signInWithGoogle();

        if (error) {
            toast({
                title: 'Google sign in failed',
                description: error,
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    const handleJudgeBypass = async () => {
        setIsLoading(true);
        const { success, error } = await judgeBypassLogin();

        if (error || !success) {
            toast({
                title: 'Judge bypass failed',
                description: error || 'An error occurred',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        toast({
            title: 'Welcome, Judge!',
            description: 'You have been automatically logged in.',
        });
    };

    const features = [
        {
            icon: <Brain className="w-8 h-8" />,
            title: 'AI ASSISTANT',
            desc: 'Get instant help from our advanced AI tutor',
            gradient: 'from-primary to-green-400',
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'GAMIFIED XP',
            desc: 'Level up, earn badges, dominate leaderboards',
            gradient: 'from-accent to-pink-400',
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: 'SMART ROADMAPS',
            desc: 'AI-generated learning paths for your goals',
            gradient: 'from-blue-400 to-cyan-400',
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: 'STUDY GROUPS',
            desc: 'Collaborate and learn with your squad',
            gradient: 'from-orange-400 to-yellow-400',
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: '100+ LANGUAGES',
            desc: 'Learn in your native language',
            gradient: 'from-teal-400 to-green-400',
        },
        {
            icon: <Sparkles className="w-8 h-8" />,
            title: 'ACCESSIBLE',
            desc: 'Dyslexia-friendly, colorblind mode, screen reader',
            gradient: 'from-pink-400 to-rose-400',
        },
    ];

    const stats = [
        { value: '10K+', label: 'Active Learners', icon: <Users className="w-5 h-5" /> },
        { value: '500+', label: 'AI Courses', icon: <BookOpen className="w-5 h-5" /> },
        { value: '24/7', label: 'AI Support', icon: <Zap className="w-5 h-5" /> },
        { value: '#1', label: 'Learning Platform', icon: <Trophy className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-white overflow-hidden">
            {/* Cosmic Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]" />
            <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />

            {/* Subtle Stars */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                {[...Array(80)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.2,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="relative z-10 container mx-auto px-6 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center lg:text-left"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 border border-neon/30 bg-primary/5 rounded-full px-4 py-2 text-sm text-primary mb-8"
                            >
                                <Rocket className="w-4 h-4" />
                                AI-POWERED LEARNING PLATFORM
                            </motion.div>

                            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-tight mb-6">
                                <span className="text-white">🚀 LEVEL UP YOUR</span>
                                <br />
                                <span className="bg-gradient-to-r from-primary via-green-400 to-primary bg-clip-text text-transparent">
                                    LEARNING GAME ✨
                                </span>
                            </h1>

                            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                                The most advanced AI-powered learning platform. Gamified experience,
                                personalized roadmaps, and smart adaptive content.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                                <Button
                                    size="lg"
                                    onClick={handleJudgeBypass}
                                    disabled={isLoading}
                                    className="h-14 px-8 bg-primary hover:bg-primary/90 text-black font-bold text-sm uppercase tracking-wider rounded-xl shadow-primary"
                                >
                                    <Zap className="mr-2 h-5 w-5" />
                                    Judge Access
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => navigate('/login')}
                                    className="h-14 px-8 border-slate-200 dark:border-slate-700 hover:bg-white/5 text-white rounded-xl"
                                >
                                    Sign In
                                </Button>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {stats.map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="text-center p-4 rounded-xl bg-white/5 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-primary mb-1">
                                            {stat.icon}
                                            <span className="font-display text-2xl font-bold">{stat.value}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Content - Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="hidden lg:block"
                        >
                            <div className="relative">
                                {/* Glow effect behind image */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple/30 to-green-400/30 blur-3xl opacity-60 animate-pulse" />

                                {/* Image container */}
                                <motion.div
                                    animate={{
                                        y: [0, -20, 0],
                                        rotateY: [0, 5, 0],
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="relative z-10"
                                >
                                    <img
                                        src="/hero-3d.png"
                                        alt="3D Learning Visualization"
                                        className="w-full h-auto rounded-2xl"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="relative py-24 overflow-hidden" id="features">
                <div className="relative z-10 container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-black uppercase mb-4">
                            <span className="text-white">Power</span>{' '}
                            <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                                Features
                            </span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to accelerate your learning journey
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-black mb-4`}>
                                    {feature.icon}
                                </div>
                                <h3 className="font-display text-lg font-bold uppercase text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple/10 to-primary/10" />
                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-display text-5xl md:text-6xl font-black uppercase text-white mb-6">
                            Ready to{' '}
                            <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                                Level Up?
                            </span>
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Join thousands of learners crushing their goals with AI-powered education.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => navigate('/register')}
                            className="h-16 px-12 bg-primary hover:bg-primary/90 text-black font-bold text-lg uppercase tracking-wider rounded-xl shadow-primary"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-8 border-t border-slate-200 dark:border-slate-700">
                <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
                    © 2024 IntelliLearn. Built with ❤️ for learners everywhere.
                </div>
            </footer>
        </div>
    );
}
