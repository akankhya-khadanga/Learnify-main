import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signIn, signInWithGoogle, judgeBypassLogin } from '@/services/authService';
import { TranslatedText } from '@/components/TranslatedText';
import { Mail, Lock, Zap, ArrowRight, Github } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { user, error } = await signIn({ email, password });

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (user) {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

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
    // Note: If successful, user will be redirected by OAuth flow
  };

  const handleJudgeBypass = async () => {
    console.log('🔘 Judge bypass button clicked');
    setIsLoading(true);

    const { success, error } = await judgeBypassLogin();
    console.log('Judge bypass result:', { success, error });

    if (error || !success) {
      console.error('Judge bypass failed:', error);
      toast({
        title: 'Judge bypass failed',
        description: error || 'An error occurred',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    console.log('Judge bypass succeeded, showing toast');
    toast({
      title: 'Welcome, Judge!',
      description: 'You have been automatically logged in.',
    });
    // Don't manually navigate - let the useEffect handle it when isAuthenticated changes
    // The useEffect will trigger automatically when the store updates
  };

  return (
    <div className="min-h-screen bg-deepblack relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]" />
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

      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - Hero Content */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 lg:p-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 3D Crystal Image */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon/30 via-purple/30 to-green-400/30 blur-3xl opacity-60 animate-pulse" />

              {/* Animated 3D Image */}
              <motion.img
                src="/hero-3d.png"
                alt="3D Learning Visualization"
                className="relative z-10 w-full h-full object-cover"
                animate={{
                  y: [0, -15, 0],
                  rotateY: [0, 3, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Milestone Badge */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
                <Zap className="w-4 h-4 text-neon" />
                <span className="text-white text-sm font-medium">
                  <span className="text-muted-foreground text-xs mr-1">NEW MILESTONE</span>
                  <br />
                  Fastest Learner Award
                </span>
              </div>
            </motion.div>
          </div>

          {/* Badge */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-neon rounded-full animate-pulse" />
              ENTER THE MULTIVERSE OF KNOWLEDGE
            </div>
          </motion.div>

          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="font-display text-5xl lg:text-6xl font-black uppercase tracking-tight mb-8">
              <span className="text-white">ASCEND YOUR</span>
              <br />
              <span className="bg-gradient-to-r from-neon via-neon to-yellow-400 bg-clip-text text-transparent">
                LEARNING RANK
              </span>
            </h1>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="border-l-2 border-neon pl-4">
              <div className="text-3xl font-display font-bold text-white">#15</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Global Rank</div>
            </div>
            <div className="border-l-2 border-purple pl-4">
              <div className="text-3xl font-display font-bold text-white">12.5k</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">XP Earned</div>
            </div>
            <div className="border-l-2 border-white/30 pl-4">
              <div className="text-3xl font-display font-bold text-white">24</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Day Streak</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div
          className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl p-8 shadow-card-glow">
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-neon/20 via-transparent to-purple/20 opacity-50 pointer-events-none" />

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl font-bold text-white uppercase tracking-wide mb-2">
                    <TranslatedText text="Welcome Back" />
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    <TranslatedText text="Access your learning command center" />
                  </p>
                </div>

                {/* Judge Bypass */}
                <Button
                  type="button"
                  onClick={handleJudgeBypass}
                  disabled={isLoading}
                  className="w-full mb-6 bg-gradient-to-r from-purple to-purple/70 hover:from-purple/90 hover:to-purple/60 text-white font-semibold py-6 rounded-xl border border-purple/50"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  <TranslatedText text="Judge Access - Click Here" />
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#161B22] px-3 text-muted-foreground">
                      <TranslatedText text="Or sign in" />
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                      <TranslatedText text="Email Address" />
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="learner@learnify.io"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 bg-[#0D1117] border-white/10 text-white placeholder:text-muted-foreground rounded-xl focus:border-neon focus:ring-neon/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-white/80 text-sm font-medium">
                        <TranslatedText text="Password" />
                      </Label>
                      <Link to="/forgot-password" className="text-xs text-neon hover:text-neon/80 font-semibold uppercase tracking-wide">
                        <TranslatedText text="Forgot?" />
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 h-12 bg-[#0D1117] border-white/10 text-white placeholder:text-muted-foreground rounded-xl focus:border-neon focus:ring-neon/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-[#0D1117] text-neon focus:ring-neon/20 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      <TranslatedText text="Stay synced across devices" />
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-neon hover:bg-neon/90 text-black font-bold text-sm uppercase tracking-wider rounded-xl shadow-neon transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <TranslatedText text="Initializing..." />
                    ) : (
                      <>
                        <TranslatedText text="Initialize Session" />
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#161B22] px-3 text-muted-foreground">
                      <TranslatedText text="Or connect with" />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 bg-transparent border-white/10 hover:bg-white/5 text-white rounded-xl"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 bg-transparent border-white/10 hover:bg-white/5 text-white rounded-xl"
                    disabled={isLoading}
                  >
                    <Github className="mr-2 h-5 w-5" />
                    GitHub
                  </Button>
                </div>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    <TranslatedText text="New to the platform?" />
                  </span>{' '}
                  <Link to="/register" className="text-neon hover:text-neon/80 font-semibold">
                    <TranslatedText text="Initialize Signup" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
