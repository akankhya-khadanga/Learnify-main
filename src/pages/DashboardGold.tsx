import { Brain, Target, Zap, Trophy, BookOpen, Users, Calendar, Clock, TrendingUp, Award, LayoutGrid, Sparkles, Globe, ArrowRight, Flame, Plus, X, Code, FileText, GraduationCap, Bell, User, Play, Music, MessageCircle, Link2, Star, Gift, LogOut } from 'lucide-react';
import XPProgressBar from '@/components/gamification/XPProgressBar';
import StreakCounter from '@/components/gamification/StreakCounter';
import BadgeCard from '@/components/gamification/BadgeCard';
import LevelBadge from '@/components/gamification/LevelBadge';
import DailyQuest from '@/components/gamification/DailyQuest';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExamCountdownWidget } from '@/components/ExamCountdownWidget';
import { FriendsWidget } from '@/components/dashboard/FriendsWidget';
import { SpotifyMiniPlayer } from '@/components/integrations/SpotifyMiniPlayer';
import { MOCK_ANALYTICS, MOCK_ACTIVITY_LOG, MOCK_TASKS, USE_MOCK_DATA, MOCK_GAME_LEADERBOARD } from '@/mocks';
import { MOCK_GAMES, MOCK_PLAYER_PROFILE } from '@/mocks/gameHub';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TranslatedText } from '@/components/TranslatedText';
import { EmptyWorkspaceState } from '@/components/dashboard/EmptyWorkspaceState';
import { OnboardingTour } from '@/components/dashboard/OnboardingTour';
import { HabitTracker } from '@/components/habits/HabitTracker';

type Workspace = {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'ml' | 'datascience' | 'cybersecurity' | 'custom';
  isActive: boolean;
  tools: string[];
};

const ROADMAP_OPTIONS = [
  { id: 'frontend', name: 'Frontend', icon: <Code className="w-4 h-4" />, color: 'neon' },
  { id: 'backend', name: 'Backend', icon: <Globe className="w-4 h-4" />, color: 'purple' },
  { id: 'ml', name: 'ML', icon: <Brain className="w-4 h-4" />, color: 'blue' },
  { id: 'datascience', name: 'Data Science', icon: <TrendingUp className="w-4 h-4" />, color: 'neon' },
  { id: 'cybersecurity', name: 'Security', icon: <Award className="w-4 h-4" />, color: 'purple' },
  { id: 'classroom', name: 'School', icon: <GraduationCap className="w-4 h-4" />, color: 'purple', special: true },
];

const INSTITUTION_TASKS = [
  { id: 1, title: 'Physics Assignment', type: 'assignment', deadline: 'Dec 15', priority: 'high' },
  { id: 2, title: 'Math Final Exam', type: 'exam', deadline: 'Dec 20', priority: 'high' },
  { id: 3, title: 'History Project', type: 'project', deadline: 'Dec 18', priority: 'medium' },
];

// Recent activity for Resume Learning
const RECENT_ACTIVITY = {
  type: 'course' as const,
  title: 'React Basics',
  progress: 68,
  path: '/courses/react-basics',
  lastAccessed: '2 hours ago',
};

// AI insight micro-text
const AI_INSIGHTS = [
  "You focus best between 7–9 PM.",
  "Your streak is on fire! Keep going.",
  "Try reviewing notes before bed for better retention.",
];

export default function DashboardGold() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [streakDaysToBonus] = useState(3);
  const [lastWorkspaceTime] = useState('Yesterday, 4:32 PM');

  // Check if user is new (first time on dashboard)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Load workspaces from localStorage on mount
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('userWorkspaces');
    if (savedWorkspaces) {
      try {
        const parsed = JSON.parse(savedWorkspaces);
        setWorkspaces(parsed);
        if (parsed.length > 0) {
          setActiveWorkspace(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to load workspaces:', e);
      }
    }
  }, []);

  // Save workspaces to localStorage whenever they change
  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem('userWorkspaces', JSON.stringify(workspaces));
    }
  }, [workspaces]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const addWorkspace = (type: string) => {
    // Create the workspace and make it active
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: (ROADMAP_OPTIONS.find(r => r.id === type)?.name || 'New') + ' Workspace',
      type: type as Workspace['type'],
      isActive: true,
      tools: ['ai-tutor', 'notes', 'focus-room'],
    };

    // Update state - workspace will now appear immediately
    setWorkspaces(prev => {
      const updated = [...prev, newWorkspace];
      // Also save to localStorage immediately
      localStorage.setItem('userWorkspaces', JSON.stringify(updated));
      return updated;
    });
    setActiveWorkspace(newWorkspace.id);
    setShowAddWorkspace(false);

    // Navigate directly to the workspace
    setTimeout(() => {
      navigate(`/workspace/${type}`);
    }, 300);
  };

  const handleOpenWorkspace = (type: string) => {
    if (type === 'classroom') {
      navigate('/classroom-workspace');
    } else {
      navigate(`/workspace/${type}`);
    }
  };

  const removeWorkspace = (id: string) => {
    setWorkspaces(workspaces.filter(w => w.id !== id));
    if (activeWorkspace === id) {
      const remaining = workspaces.filter(w => w.id !== id);
      setActiveWorkspace(remaining[0]?.id || null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0C0E17] text-white overflow-auto">
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C0E17] via-[#171B21] to-[#0C0E17]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#DAFD78]/5 via-transparent to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(218, 253, 120, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(218, 253, 120, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* HEADER ROW */}
        <div className="border-b border-[#31343B]/50 bg-[#171B21]/90 backdrop-blur-xl px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            {/* Left: Welcome */}
            <div>
              <h1 className="text-2xl font-display font-bold">
                <TranslatedText text="Welcome back," /> <span className="text-[#DAFD78]">{user?.name || 'Learner'}!</span>
              </h1>
              <p className="text-sm text-[#9FA3AE]">Ready for your next learning adventure?</p>
            </div>

            {/* Right: Stats + Actions */}
            <div className="flex items-center gap-6">
              {/* Stats Row */}
              <div className="flex items-center gap-5">
                <div className="text-center px-3 py-1.5 bg-[#1F2229] rounded-lg border border-[#31343B]/50">
                  <p className="text-lg font-bold text-white">{workspaces.length}</p>
                  <p className="text-[10px] text-[#9FA3AE] uppercase tracking-wide">Spaces</p>
                </div>
                <div className="text-center px-3 py-1.5 bg-[#DAFD78]/10 rounded-lg border border-[#DAFD78]/30">
                  <p className="text-lg font-bold text-[#DAFD78]">{user?.xp || 0}</p>
                  <p className="text-[10px] text-[#DAFD78]/70 uppercase tracking-wide">XP</p>
                </div>
                <div className="text-center px-3 py-1.5 bg-[#6C5BA6]/10 rounded-lg border border-[#6C5BA6]/30">
                  <p className="text-lg font-bold text-[#6C5BA6]">Lvl {user?.level || 1}</p>
                  <p className="text-[10px] text-[#6C5BA6]/70 uppercase tracking-wide">Level</p>
                </div>
                <div className="text-center relative group px-3 py-1.5 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <p className="text-lg font-bold text-orange-400 flex items-center gap-1"><Flame className="w-4 h-4" />7</p>
                  <p className="text-[10px] text-orange-400/70 uppercase tracking-wide">Streak</p>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#1F2229] border border-[#31343B] rounded-lg px-3 py-2 text-xs text-[#DAFD78] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                    🔥 {streakDaysToBonus} more days to earn bonus XP!
                  </div>
                </div>
              </div>

              {/* Action Icons - Grouped on right side */}
              <div className="flex items-center gap-1 bg-[#1F2229] rounded-xl p-1 border border-[#31343B]/50">
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-[#25272E] rounded-lg h-9 w-9"
                  onClick={() => { }}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-[#9FA3AE]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                {/* Profile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-[#25272E] rounded-lg h-9 w-9"
                  onClick={() => navigate('/profile')}
                  title="Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#DAFD78] to-[#6C5BA6] flex items-center justify-center">
                    <User className="w-3 h-3 text-[#0C0E17]" />
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <XPProgressBar
            currentXP={user?.xp || 0}
            requiredXP={1000}
            level={user?.level || 1}
            showDetails={true}
          />
        </div>

        {/* MAIN CONTENT - 2 Rows x 4 Columns Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 min-h-0">

            {/* Grid 1: Resume Learning */}
            <Card className="border border-[#31343B]/50 bg-[#171B21] backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold text-[#DAFD78] flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Resume Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-4">
                {RECENT_ACTIVITY && (
                  <div className="space-y-4">
                    <p className="text-base font-bold text-white">{RECENT_ACTIVITY.title}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-[#25272E] rounded-full overflow-hidden">
                        <div className="h-full bg-[#DAFD78] rounded-full" style={{ width: `${RECENT_ACTIVITY.progress}%` }} />
                      </div>
                      <span className="text-sm font-bold text-[#DAFD78]">{RECENT_ACTIVITY.progress}%</span>
                    </div>
                    <Button
                      onClick={() => navigate(RECENT_ACTIVITY.path)}
                      className="w-full bg-[#DAFD78] hover:bg-[#DAFD78]/90 text-[#0C0E17] font-bold text-sm h-10 shadow-glow-primary"
                    >
                      <Play className="w-4 h-4 mr-2" /> Continue
                    </Button>
                  </div>
                )}
                <div className="mt-2 pt-4 border-t border-[#31343B]/50 grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => navigate('/study-planner')}
                    variant="outline"
                    className="border-[#31343B] bg-[#1F2229] text-white hover:bg-[#25272E] h-9 text-xs font-semibold"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Calendar
                  </Button>
                  <Button
                    onClick={() => navigate('/ai-bot')}
                    variant="outline"
                    className="border-[#31343B] bg-[#1F2229] text-white hover:bg-[#25272E] h-9 text-xs font-semibold"
                  >
                    <Brain className="w-3.5 h-3.5 mr-1.5" />
                    AI Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grid 2: Workspace (Combined - Active + New) */}
            <Card className="border border-[#31343B]/50 bg-[#171B21] backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold text-[#DAFD78] flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5" />
                  My Workspaces
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-3">
                {/* Active Workspace Section */}
                {activeWorkspace ? (
                  <div className="space-y-3 p-3 bg-[#DAFD78]/10 rounded-xl border border-[#DAFD78]/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#DAFD78] uppercase tracking-wide flex items-center gap-1">
                        <span className="w-2 h-2 bg-[#DAFD78] rounded-full animate-pulse"></span>
                        Currently Active
                      </span>
                      <button
                        onClick={() => removeWorkspace(activeWorkspace)}
                        className="text-[#9FA3AE] hover:text-red-400 text-sm px-2 py-0.5 rounded hover:bg-red-500/10 transition-colors"
                        title="Remove workspace"
                      >✕</button>
                    </div>
                    <p className="text-base font-bold text-white">{workspaces.find(w => w.id === activeWorkspace)?.name}</p>
                    <p className="text-xs text-[#9FA3AE]">Last opened: {lastWorkspaceTime}</p>
                    <Button
                      onClick={() => handleOpenWorkspace(workspaces.find(w => w.id === activeWorkspace)?.type || 'frontend')}
                      className="w-full bg-[#DAFD78] hover:bg-[#DAFD78]/90 text-[#0C0E17] font-bold text-sm h-10 shadow-glow-primary"
                    >
                      <Play className="w-4 h-4 mr-2" /> Continue Learning
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 px-3 bg-[#1F2229] rounded-xl border-2 border-dashed border-[#31343B]">
                    <LayoutGrid className="w-12 h-12 mx-auto text-[#31343B] mb-3" />
                    <p className="text-sm font-medium text-white mb-1">No workspace yet</p>
                    <p className="text-xs text-[#9FA3AE]">Create your first learning space below ↓</p>
                  </div>
                )}

                {/* Other Workspaces */}
                {workspaces.filter(w => w.id !== activeWorkspace).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#9FA3AE] uppercase tracking-wide">Other Workspaces</p>
                    {workspaces.filter(w => w.id !== activeWorkspace).slice(0, 2).map((ws) => (
                      <div
                        key={ws.id}
                        onClick={() => setActiveWorkspace(ws.id)}
                        className="p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between bg-[#1F2229] hover:bg-[#25272E] hover:border-[#DAFD78]/30 text-white border border-transparent"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#6C5BA6] rounded-full"></span>
                          <span className="text-sm font-semibold">{ws.name}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeWorkspace(ws.id); }}
                          className="text-[#9FA3AE] hover:text-red-400 text-sm px-2 py-0.5 rounded hover:bg-red-500/10"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Workspace Button */}
                <div className="pt-3 border-t border-[#31343B]/50">
                  <Button
                    onClick={() => setShowAddWorkspace(!showAddWorkspace)}
                    variant="outline"
                    className={`w-full border-[#DAFD78]/50 text-[#DAFD78] hover:bg-[#DAFD78] hover:text-[#0C0E17] font-bold text-sm h-10 transition-all ${showAddWorkspace ? 'bg-[#DAFD78]/10' : ''}`}
                  >
                    <Plus className={`w-4 h-4 mr-2 transition-transform ${showAddWorkspace ? 'rotate-45' : ''}`} />
                    {showAddWorkspace ? 'Cancel' : 'Create New Workspace'}
                  </Button>
                </div>

                {/* Roadmap Options */}
                {showAddWorkspace && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 bg-[#1F2229] rounded-xl p-3 border border-[#31343B]/50"
                  >
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Choose a Learning Path</p>
                    <p className="text-xs text-[#9FA3AE] -mt-2">Pick a roadmap to start your journey</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ROADMAP_OPTIONS.map((r) => (
                        <Button
                          key={r.id}
                          variant="ghost"
                          onClick={() => addWorkspace(r.id)}
                          className="text-xs justify-start gap-2 h-10 hover:bg-[#DAFD78]/20 hover:text-[#DAFD78] font-semibold border border-[#31343B]/50 hover:border-[#DAFD78]/50 transition-all"
                        >
                          {r.icon}
                          {r.name}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Grid 3: Tasks */}
            <Card className="border border-[#31343B]/50 bg-[#171B21] backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold text-[#6C5BA6] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-3">
                {INSTITUTION_TASKS.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1F2229] hover:bg-[#25272E] cursor-pointer transition-colors"
                    onClick={() => navigate('/workspace/frontend')}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm font-semibold text-white">{task.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 border-[#31343B]">{task.deadline}</Badge>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="w-full text-sm text-[#6C5BA6] hover:text-[#6C5BA6] hover:bg-[#6C5BA6]/20 font-semibold h-9"
                  onClick={() => navigate('/study-planner')}
                >
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Grid 4: Spotify & Discord */}
            <Card className="border border-[#31343B]/50 bg-[#171B21] backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#1DB954]" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-3">
                {/* Spotify */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/30 hover:bg-[#1DB954]/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                      <Music className="w-4 h-4 text-[#1DB954]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Spotify</p>
                      <p className="text-xs text-[#9FA3AE]">Music while studying</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#1DB954]/50 text-[#1DB954] hover:bg-[#1DB954] hover:text-[#0C0E17] font-bold h-8 text-xs"
                  >
                    <Link2 className="w-3.5 h-3.5 mr-1" />
                    Connect
                  </Button>
                </div>

                {/* Discord */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 hover:bg-[#5865F2]/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Discord</p>
                      <p className="text-xs text-[#9FA3AE]">Study community</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#5865F2]/50 text-[#5865F2] hover:bg-[#5865F2] hover:text-white font-bold h-8 text-xs"
                  >
                    <Link2 className="w-3.5 h-3.5 mr-1" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grid 5: Exam Countdown */}
            <Card className="border border-[#31343B]/50 bg-[#171B21] backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0 h-full">
                <ExamCountdownWidget />
              </CardContent>
            </Card>

            {/* Grid 6: Daily Quest */}
            <DailyQuest
              title="Complete 3 Learning Sessions"
              description="Study for at least 25 minutes in 3 different subjects today"
              progress={2}
              maxProgress={3}
              xpReward={500}
              onClaim={() => {
                alert('🎉 Claimed! +500 XP');
              }}
            />

            {/* Grid 7: Achievements Preview */}
            <Card className="border border-[#31343B]/50 bg-[#171B21] backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold text-[#DAFD78] flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                <div className="grid grid-cols-3 gap-2">
                  <BadgeCard
                    title="First Steps"
                    description="Complete your first lesson"
                    icon={Star}
                    unlocked={true}
                    rarity="common"
                  />
                  <BadgeCard
                    title="On Fire!"
                    description="Maintain a 7-day streak"
                    icon={Flame}
                    unlocked={true}
                    rarity="rare"
                  />
                  <BadgeCard
                    title="Scholar"
                    description="Reach level 10"
                    icon={GraduationCap}
                    unlocked={false}
                    progress={70}
                    rarity="epic"
                  />
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-3 text-sm text-[#DAFD78] hover:text-[#DAFD78] hover:bg-[#DAFD78]/20 font-semibold h-9"
                  onClick={() => navigate('/achievements')}
                >
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Grid 8: Friends */}
            <FriendsWidget />

            {/* Grid 9: Daily Habits */}
            <Card className="border border-[#31343B]/50 bg-[#171B21] backdrop-blur-sm rounded-2xl lg:col-span-2">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold text-[#6C5BA6] flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Daily Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                {user?.id && <HabitTracker userId={user.id} />}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}