import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { resetPassword } from '@/services/authService';
import { TranslatedText } from '@/components/TranslatedText';
import { Lock, Rocket, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const getPasswordStrength = (password: string): { strength: string; color: string; percentage: number } => {
        if (password.length === 0) return { strength: '', color: '', percentage: 0 };
        if (password.length < 6) return { strength: 'Weak', color: 'text-red-500', percentage: 25 };
        if (password.length < 10) return { strength: 'Fair', color: 'text-yellow-500', percentage: 50 };
        if (password.length < 14) return { strength: 'Good', color: 'text-accent', percentage: 75 };
        return { strength: 'Strong', color: 'text-primary', percentage: 100 };
    };

    const passwordStrength = getPasswordStrength(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please make sure both passwords are identical.',
                variant: 'destructive',
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 6 characters long.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        const { error } = await resetPassword(newPassword);

        if (error) {
            toast({
                title: 'Password reset failed',
                description: error,
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        toast({
            title: 'Password reset successful!',
            description: 'You can now sign in with your new password.',
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
            navigate('/login');
        }, 2000);
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
                            <span className="text-primary">INTELLI</span>
                            <span className="text-accent">-LEARN</span>
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="relative rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-slate-50 dark:to-slate-900/90 backdrop-blur-xl p-8 shadow-float">
                        {/* Gradient border effect */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-neon/20 via-transparent to-purple/20 opacity-50 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="text-center mb-8">
                                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-2">
                                    <TranslatedText text="Reset Password" />
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    <TranslatedText text="Enter your new password" />
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-slate-900 dark:text-white/80 text-sm font-medium">
                                        <TranslatedText text="New Password" />
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-muted-foreground rounded-xl focus:border-primary focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                    {newPassword && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-900 dark:text-white/70">Password Strength:</span>
                                                <span className={`font-bold ${passwordStrength.color}`}>{passwordStrength.strength}</span>
                                            </div>
                                            <div className="h-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${passwordStrength.percentage}%` }}
                                                    className={`h-full ${passwordStrength.percentage === 100 ? 'bg-primary' :
                                                            passwordStrength.percentage >= 75 ? 'bg-accent' :
                                                                passwordStrength.percentage >= 50 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-slate-900 dark:text-white/80 text-sm font-medium">
                                        <TranslatedText text="Confirm Password" />
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-muted-foreground rounded-xl focus:border-primary focus:ring-primary/20"
                                            required
                                        />
                                        {confirmPassword && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {passwordsMatch ? (
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl"
                                    disabled={isLoading || !passwordsMatch}
                                >
                                    {isLoading ? <TranslatedText text="Resetting..." /> : <TranslatedText text="Reset Password" />}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm">
                                <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
                                    <TranslatedText text="Back to Login" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
