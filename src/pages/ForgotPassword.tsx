import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { requestPasswordReset } from '@/services/authService';
import { TranslatedText } from '@/components/TranslatedText';
import { Mail, Rocket, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await requestPasswordReset(email);

        if (error) {
            toast({
                title: 'Failed to send reset email',
                description: error,
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        setEmailSent(true);
        toast({
            title: 'Reset email sent!',
            description: 'Check your email for a password reset link.',
        });
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
            {/* Cosmic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 dark:from-slate-900 via-indigo-50/30 dark:via-indigo-950/20 to-slate-50 dark:to-slate-900" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-neon/5 via-transparent to-transparent" />

            {/* Subtle Stars */}
            <div className="absolute inset-0 opacity-40">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.2,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-3xl font-display font-bold">
                            <Rocket className="h-8 w-8 text-primary" />
                            <span className="text-primary">Learn</span>
                            <span className="text-accent">ify</span>
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="relative rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-slate-50 dark:to-slate-900/90 backdrop-blur-xl p-8 shadow-float">
                        {/* Gradient border effect */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-neon/20 via-transparent to-purple/20 opacity-50 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="text-center mb-8">
                                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-2">
                                    <TranslatedText text="Forgot Password?" />
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    <TranslatedText text="Enter your email to receive a password reset link" />
                                </p>
                            </div>

                            {!emailSent ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-900 dark:text-white/80 text-sm font-medium">
                                            <TranslatedText text="Email Address" />
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="learner@learnify.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-muted-foreground rounded-xl focus:border-primary focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <TranslatedText text="Sending..." /> : <TranslatedText text="Send Reset Link" />}
                                    </Button>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="p-6 bg-primary/10 border border-neon/30 rounded-xl">
                                        <Mail className="h-12 w-12 text-primary mx-auto mb-3" />
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            <TranslatedText text="Check Your Email" />
                                        </h3>
                                        <p className="text-muted-foreground">
                                            <TranslatedText text="We've sent a password reset link to" /> <strong className="text-slate-900 dark:text-white">{email}</strong>
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => navigate('/login')}
                                        variant="outline"
                                        className="w-full h-12 border-white/20 hover:bg-white/10 text-slate-900 dark:text-white rounded-xl"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                        <TranslatedText text="Back to Login" />
                                    </Button>
                                </motion.div>
                            )}

                            {!emailSent && (
                                <div className="mt-6 text-center text-sm">
                                    <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
                                        <TranslatedText text="Back to Login" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
