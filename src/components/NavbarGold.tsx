import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { signOut } from '@/services/authService';
import { ExamNotificationBell } from '@/components/ExamNotificationBell';
import { Rocket, Zap } from 'lucide-react';

export default function NavbarGold() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/95 backdrop-blur-xl">
      <div className="w-full px-6 py-3">
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <Link to="/dashboard" className="flex items-center gap-3 text-3xl font-display font-black tracking-wide transform hover:scale-105 transition-transform">
            <Rocket className="h-8 w-8 text-primary" />
            <span><span className="text-primary">Learn</span><span className="text-accent">ify</span></span>
          </Link>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-3">
            {/* XP Display */}
            {isAuthenticated && user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-[#DAFD78]/30 rounded-lg">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-primary font-semibold text-sm">{user.xp || 0} XP</span>
              </div>
            )}

            {/* Exam Notification Bell - Only for authenticated users */}
            {isAuthenticated && <ExamNotificationBell />}

            {isAuthenticated ? (
              <>
                {user && (
                  <div className="hidden md:block text-[#E6E7E9] font-medium text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {user.name}
                  </div>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  size="sm"
                  className="rounded-lg"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="border-slate-200 dark:border-slate-700 text-white hover:bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-[#0C0E17] rounded-lg">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
