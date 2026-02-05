import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signUp } from '@/services/authService';
import { TranslatedText } from '@/components/TranslatedText';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { Mail, Lock, User, ArrowRight, Rocket } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { user, error } = await signUp({ email, password, name });

    if (error) {
      toast({
        title: 'Registration failed',
        description: error,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (user) {
      toast({
        title: 'Account created!',
        description: 'Welcome to Learnify! Let\'s get you started.',
      });
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-deepblack relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-purple/5 via-transparent to-transparent" />

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
              <Rocket className="h-8 w-8 text-neon" />
              <span className="text-neon">Learn</span>
              <span className="text-purple">ify</span>
            </Link>
          </div>

          {/* Register Card */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl p-8 shadow-card-glow">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple/20 via-transparent to-neon/20 opacity-50 pointer-events-none" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold text-white uppercase tracking-wide mb-2">
                  <TranslatedText text="Initialize Account" />
                </h2>
                <p className="text-muted-foreground text-sm">
                  <TranslatedText text="Begin your learning journey today" />
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/80 text-sm font-medium">
                    <TranslatedText text="Full Name" />
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-12 bg-[#0D1117] border-white/10 text-white placeholder:text-muted-foreground rounded-xl focus:border-purple focus:ring-purple/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80 text-sm font-medium">
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
                      className="pl-12 h-12 bg-[#0D1117] border-white/10 text-white placeholder:text-muted-foreground rounded-xl focus:border-purple focus:ring-purple/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80 text-sm font-medium">
                    <TranslatedText text="Password" />
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 bg-[#0D1117] border-white/10 text-white placeholder:text-muted-foreground rounded-xl focus:border-purple focus:ring-purple/20"
                      required
                    />
                  </div>
                  <PasswordStrengthMeter password={password} />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple to-purple/70 hover:from-purple/90 hover:to-purple/60 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-purple-glow transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <TranslatedText text="Creating account..." />
                  ) : (
                    <>
                      <TranslatedText text="Initialize Account" />
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  <TranslatedText text="Already have an account?" />
                </span>{' '}
                <Link to="/login" className="text-neon hover:text-neon/80 font-semibold">
                  <TranslatedText text="Sign in" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
