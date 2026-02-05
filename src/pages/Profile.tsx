import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccessibilityStore, ColorblindMode, TextScale, SignLanguage } from '@/store/accessibilityStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SignAvatar } from '@/components/accessibility/SignAvatar';
import { TranslatedText } from '@/components/TranslatedText';
// Note: Old analytics imports commented out - Profile has its own analytics implementation
// import { getAnalyticsData, AnalyticsData, getFallbackAnalytics } from '@/services/analyticsService';
import { getMockAnalytics, USE_MOCK_DATA, mockDelay } from '@/mocks';
import { StudyPatternAnalysis } from '@/components/analytics/StudyPatternAnalysis';
import {
  Accessibility,
  Type,
  Eye,
  Subtitles,
  Contrast,
  Hand,
  User,
  Bell,
  Lock,
  Palette,
  RefreshCw,
  BarChart as BarChartIcon,
  TrendingUp,
  Clock,
  Target,
  Award,
  ArrowLeft,
  Settings,
  ChartBar
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { updateEmail, updatePassword } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

// Email Change Form Component
function ChangeEmailForm() {
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const user = useUserStore((state) => state.user);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await updateEmail(newEmail);

    if (error) {
      toast({
        title: 'Failed to update email',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Verification email sent',
        description: 'Please check your new email address to confirm the change.',
      });
      setNewEmail('');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleEmailChange} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white font-bold">Current Email</Label>
        <Input
          type="email"
          value={user?.email || ''}
          disabled
          className="border-2 border-neon/30 bg-black/50 text-white/50"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white font-bold">New Email</Label>
        <Input
          type="email"
          placeholder="newemail@example.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="border-2 border-neon/30 bg-white dark:bg-slate-800 text-white"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !newEmail}
        className="w-full border border-slate-200 dark:border-slate-700 bg-primary hover:bg-primary/90 shadow-float font-black"
      >
        {isLoading ? 'Updating...' : 'Update Email'}
      </Button>
    </form>
  );
}

// Password Change Form Component
function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
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

    const { error } = await updatePassword(currentPassword, newPassword);

    if (error) {
      toast({
        title: 'Failed to update password',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully changed.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white font-bold">Current Password</Label>
        <Input
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="border-2 border-neon/30 bg-white dark:bg-slate-800 text-white"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white font-bold">New Password</Label>
        <Input
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border-2 border-neon/30 bg-white dark:bg-slate-800 text-white"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white font-bold">Confirm New Password</Label>
        <Input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border-2 border-neon/30 bg-white dark:bg-slate-800 text-white"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
        className="w-full border border-slate-200 dark:border-slate-700 bg-accent hover:bg-accent/90 shadow-accent font-black"
      >
        {isLoading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'analytics' | 'patterns' | 'account' | 'accessibility' | 'notifications' | 'privacy'>('analytics');
  const [showSignAvatar, setShowSignAvatar] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(() => getMockAnalytics());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Accessibility store
  const {
    dyslexiaFont,
    setDyslexiaFont,
    colorblindMode,
    setColorblindMode,
    textScale,
    setTextScale,
    highContrast,
    setHighContrast,
    captionsEnabled,
    setCaptionsEnabled,
    signLanguage,
    setSignLanguage,
    resetSettings,
  } = useAccessibilityStore();

  useEffect(() => {
    let isActive = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK_DATA) {
          await mockDelay(500);
          const mockData = getMockAnalytics();
          if (isActive) {
            setAnalytics(mockData as any);
          }
        } else {
          const data = getMockAnalytics();
          if (isActive) {
            setAnalytics(data);
          }
        }
      } catch (err) {
        console.error('Analytics load error:', err);
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Unable to load analytics right now.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isActive = false;
    };
  }, []);

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: ChartBar },
    { id: 'patterns', label: 'Study Patterns', icon: TrendingUp },
    { id: 'account', label: 'Account', icon: User },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ];

  const colorblindModes: { mode: ColorblindMode; label: string; description: string }[] = [
    { mode: 'none', label: 'None', description: 'Standard colors' },
    { mode: 'protanopia', label: 'Protanopia', description: 'Red-blind' },
    { mode: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind' },
    { mode: 'tritanopia', label: 'Tritanopia', description: 'Blue-blind' },
  ];

  // Analytics data processing
  const summary = analytics?.summary;
  const hasProvisionalData = Boolean(summary);
  const showSkeleton = loading && !hasProvisionalData;
  const trendPoints = analytics?.weeklyTrend?.length ? analytics.weeklyTrend : [];
  const focusEntries = analytics?.focusByDay?.length ? analytics.focusByDay : [];
  const subjectEntries = analytics?.subjects?.length ? analytics.subjects : [];
  const timeBlockEntries = analytics?.timeBlocks?.length ? analytics.timeBlocks : [];

  const overviewCards = [
    {
      label: 'Study Time',
      value: summary ? `${summary.studyHours.toFixed(1)}h` : '--',
      delta: summary ? `${summary.studyHoursChange >= 0 ? '+' : ''}${summary.studyHoursChange}%` : '',
      deltaLabel: 'this week',
      deltaClass: summary && summary.studyHoursChange >= 0 ? 'text-green-500' : 'text-red-500',
      icon: Clock,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Focus Score',
      value: summary ? `${summary.focusScore}%` : '--',
      delta: summary ? `${summary.focusChange >= 0 ? '+' : ''}${summary.focusChange}%` : '',
      deltaLabel: 'vs last week',
      deltaClass: summary && summary.focusChange >= 0 ? 'text-green-500' : 'text-red-500',
      icon: Target,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      label: 'Streak',
      value: summary ? `${summary.streak} days` : '--',
      delta: 'Keep it up!',
      deltaLabel: '',
      translateDelta: true,
      deltaClass: 'text-gray-400',
      icon: TrendingUp,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      label: 'Completed',
      value: summary ? summary.completedModules.toString() : '--',
      delta: 'modules',
      deltaLabel: '',
      translateDelta: true,
      deltaClass: 'text-gray-400',
      icon: Award,
      iconBg: 'bg-[#C9B458]/10',
      iconColor: 'text-[#C9B458]',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">{user?.name || 'Profile'}</h1>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-2xl font-black text-primary">{user?.xp || 0}</p>
                <p className="text-xs text-gray-400">XP</p>
              </div>
              <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-2xl font-black text-accent">Lvl {user?.level || 1}</p>
                <p className="text-xs text-gray-400">Level</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-primary hover:bg-primary/90 text-black font-black'
                  : 'border-slate-200 dark:border-slate-700 text-white hover:bg-white/10'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-500">
                {error}
              </div>
            )}

            {!error && !loading && analytics?.isFallback && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/5 p-4 text-sm text-gray-400">
                Showing sample insights until you log study sessions.
              </div>
            )}

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              {overviewCards.map((card) => (
                <Card key={card.label} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className={`rounded-full ${card.iconBg} p-3`}>
                      <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">
                        <TranslatedText text={card.label} />
                      </p>
                      {showSkeleton ? (
                        <Skeleton className="mt-2 h-6 w-24" />
                      ) : (
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                      )}
                      {!showSkeleton && card.delta && (
                        <p className={`text-xs ${card.deltaClass}`}>
                          {card.translateDelta ? <TranslatedText text={card.delta} /> : card.delta}
                          {card.deltaLabel && (
                            <span className="text-gray-500">
                              {' '}
                              <TranslatedText text={card.deltaLabel} />
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white"><TranslatedText text="Study Time Trend" /></CardTitle>
                  <CardDescription className="text-gray-400"><TranslatedText text="Your weekly study hours over the last month" /></CardDescription>
                </CardHeader>
                <CardContent>
                  {showSkeleton ? (
                    <Skeleton className="h-64 w-full rounded" />
                  ) : trendPoints.length > 0 ? (
                    <ResponsiveContainer width="100%" height={256}>
                      <BarChart data={trendPoints}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#161B22',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value: number) => [`${value} hours`, 'Study Time']}
                        />
                        <Bar dataKey="hours" fill="#BEFF00" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-64 items-center justify-center">
                      <p className="text-sm text-gray-400">
                        Start a study session to see your weekly trend.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white"><TranslatedText text="Focus Score" /></CardTitle>
                  <CardDescription className="text-gray-400"><TranslatedText text="Your concentration levels throughout the week" /></CardDescription>
                </CardHeader>
                <CardContent>
                  {showSkeleton ? (
                    <Skeleton className="h-64 w-full rounded" />
                  ) : focusEntries.length > 0 ? (
                    <ResponsiveContainer width="100%" height={256}>
                      <AreaChart data={focusEntries}>
                        <defs>
                          <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#BEFF00" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#BEFF00" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#161B22',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value: number) => [`${value}%`, 'Focus Score']}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#BEFF00"
                          fillOpacity={1}
                          fill="url(#focusGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-64 items-center justify-center">
                      <p className="text-sm text-gray-400">
                        Complete study sessions to track your focus.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Subject Performance */}
            <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white"><TranslatedText text="Performance by Subject" /></CardTitle>
                <CardDescription className="text-gray-400"><TranslatedText text="Your strongest and weakest areas" /></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subjectEntries.map((subject, i) => {
                    const hours = (subject as any).hours || 0;
                    const maxHours = Math.max(...subjectEntries.map((s: any) => s.hours || 0), 1);
                    const percentage = Math.round((hours / maxHours) * 100);
                    const color = (subject as any).color || '#BEFF00';

                    return (
                      <motion.div
                        key={subject.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="mb-2 flex justify-between">
                          <span className="font-semibold text-white">{subject.name}</span>
                          <span className="text-sm text-gray-400">{hours}h</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            style={{ backgroundColor: color }}
                            className="h-full"
                          />
                        </div>
                      </motion.div>
                    );
                  })}

                  {subjectEntries.length === 0 && (
                    <p className="text-sm text-gray-400">Log some course progress to see subject performance.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Study Patterns Tab */}
        {activeTab === 'patterns' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {user?.id && <StudyPatternAnalysis userId={user.id} />}
          </motion.div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Change Email */}
            <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-black text-white">Change Email</h2>
              </div>
              <ChangeEmailForm />
            </Card>

            {/* Change Password */}
            <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-black text-white">Change Password</h2>
              </div>
              <ChangePasswordForm />
            </Card>
          </motion.div>
        )}

        {/* Accessibility Tab */}
        {activeTab === 'accessibility' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Visual Accessibility */}
            <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-black text-white">Visual Accessibility</h2>
              </div>

              <div className="space-y-6">
                {/* Dyslexia Font */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                      <Type className="w-5 h-5" />
                      Dyslexia-Friendly Font
                    </h3>
                    <p className="text-sm text-gray-400">Use OpenDyslexic font</p>
                  </div>
                  <Switch
                    checked={dyslexiaFont}
                    onCheckedChange={setDyslexiaFont}
                  />
                </div>

                {/* Text Scale */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-white">Text Scale</h3>
                      <p className="text-sm text-gray-400">Adjust text size</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTextScale(Math.max(0.8, textScale - 0.1) as TextScale)}
                        className="border-slate-200 dark:border-slate-700 text-white hover:bg-white/10"
                      >
                        A-
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTextScale(Math.min(1.4, textScale + 0.1) as TextScale)}
                        className="border-slate-200 dark:border-slate-700 text-white hover:bg-white/10"
                      >
                        A+
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[textScale]}
                    onValueChange={(value) => setTextScale(value[0] as TextScale)}
                    min={0.8}
                    max={1.4}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>80%</span>
                    <span>100%</span>
                    <span>140%</span>
                  </div>
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                      <Contrast className="w-5 h-5" />
                      High Contrast Mode
                    </h3>
                    <p className="text-sm text-gray-400">Increase visual contrast</p>
                  </div>
                  <Switch
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>

                {/* Colorblind Modes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-5 h-5" />
                    <h3 className="font-bold text-lg text-white">Colorblind Mode</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {colorblindModes.map((mode) => (
                      <button
                        key={mode.mode}
                        onClick={() => setColorblindMode(mode.mode)}
                        className={`p-4 rounded-lg border text-left transition-all font-bold ${colorblindMode === mode.mode
                          ? 'bg-primary text-black border-neon'
                          : 'bg-white/5 text-white border-slate-200 dark:border-slate-700 hover:bg-white/10'
                          }`}
                      >
                        <div className="font-bold">{mode.label}</div>
                        <div className={`text-sm ${colorblindMode === mode.mode ? 'text-black/70' : 'text-gray-400'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Audio & Captions */}
            <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Subtitles className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-black text-white">Audio & Captions</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">Live Captions</h3>
                    <p className="text-sm text-gray-400">Real-time speech-to-text</p>
                  </div>
                  <Switch
                    checked={captionsEnabled}
                    onCheckedChange={setCaptionsEnabled}
                  />
                </div>

                {captionsEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-black/50 rounded-lg border border-neon/30"
                  >
                    <p className="text-sm font-mono text-white">
                      [Live captions will appear here during video lectures and discussions]
                    </p>
                  </motion.div>
                )}
              </div>
            </Card>

            {/* Sign Language Support */}
            <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Hand className="w-6 h-6 text-[#6DAEDB]" />
                <h2 className="text-2xl font-black text-white">Sign Language Support</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Sign Language</label>
                  <Select
                    value={signLanguage}
                    onValueChange={(value) => setSignLanguage(value as SignLanguage)}
                  >
                    <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="ASL">ASL (American Sign Language)</SelectItem>
                      <SelectItem value="BSL">BSL (British Sign Language)</SelectItem>
                      <SelectItem value="ISL">ISL (Indian Sign Language)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {signLanguage !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      onClick={() => setShowSignAvatar(!showSignAvatar)}
                      className="w-full bg-[#6DAEDB] hover:bg-[#5C9DCA] text-white"
                    >
                      {showSignAvatar ? 'Hide' : 'Show'} Sign Language Avatar
                    </Button>

                    {showSignAvatar && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4"
                      >
                        <SignAvatar embedded />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </Card>

            {/* Reset All Settings */}
            <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                    <RefreshCw className="w-5 h-5" />
                    Reset All Settings
                  </h3>
                  <p className="text-sm text-gray-400">Restore default accessibility settings</p>
                </div>
                <Button
                  variant="outline"
                  onClick={resetSettings}
                  className="border-slate-200 dark:border-slate-700 bg-accent text-white font-black hover:bg-accent/90"
                >
                  Reset
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
              <h2 className="text-2xl font-black mb-4 text-white">Notification Settings</h2>
              <p className="text-gray-400">Notification settings coming soon...</p>
            </Card>
          </motion.div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
              <h2 className="text-2xl font-black mb-4 text-white">Privacy Settings</h2>
              <p className="text-gray-400">Privacy settings coming soon...</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
