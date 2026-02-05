import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { TranslatedText } from '@/components/TranslatedText';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Clock, CloudRain, Trees, Coffee, Radio, Waves, Sparkles, Users, Flame } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useSoundPlayer, type SoundType } from '@/hooks/useSoundPlayer';
import { UniverseVisualization } from '@/components/UniverseVisualization';
import { friendsService, Friend } from '@/services/friendsService';

export default function FocusRoom() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [duration, setDuration] = useState('25');
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const addXP = useUserStore((state) => state.addXP);

  // Fetch online friends
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friends = await friendsService.getOnlineFriends();
        setOnlineFriends(friends);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoadingFriends(false);
      }
    };
    fetchFriends();
    const interval = setInterval(fetchFriends, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const {
    currentSound,
    isPlaying: isSoundPlaying,
    volume,
    isMuted,
    playSound,
    stopSound,
    setVolume,
    toggleMute,
    frequencyData,
  } = useSoundPlayer();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((parseInt(duration) * 60 - timeLeft) / (parseInt(duration) * 60)) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Award XP for completed session
      if (mode === 'focus') {
        addXP(parseInt(duration) * 2); // 2 XP per minute
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, duration, addXP]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(parseInt(duration) * 60);
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    setTimeLeft(parseInt(value) * 60);
    setIsRunning(false);
  };

  const handleSoundToggle = (sound: SoundType) => {
    if (currentSound === sound && isSoundPlaying) {
      stopSound();
    } else {
      playSound(sound);
    }
  };

  const soundOptions = [
    { type: 'rain' as SoundType, icon: CloudRain, label: 'Rain Sounds' },
    { type: 'forest' as SoundType, icon: Trees, label: 'Forest Birds' },
    { type: 'cafe' as SoundType, icon: Coffee, label: 'Cafe Ambience' },
    { type: 'white-noise' as SoundType, icon: Radio, label: 'White Noise' },
    { type: 'ocean' as SoundType, icon: Waves, label: 'Ocean Waves' },
    { type: 'space' as SoundType, icon: Sparkles, label: 'Space Ambience' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
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

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-black uppercase text-primary drop-shadow-[2px_2px_0px_#000]">
              <TranslatedText text="Focus Room" />
            </h1>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Timer */}
        <Card className="border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-float">
          <CardHeader className="border-b border-[#DAFD78]/30">
            <CardTitle className="text-2xl font-black uppercase text-primary"><TranslatedText text="Pomodoro Timer" /></CardTitle>
            <CardDescription className="text-[#9FA3AE] font-bold">
              <TranslatedText text="Stay focused and productive with timed work sessions" />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-8">
            {/* Circular Progress */}
            <div className="relative mb-8 h-64 w-64 shadow-primary rounded-full">
              <svg className="h-full w-full -rotate-90 transform">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  key={`${minutes}-${seconds}`}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-bold"
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </motion.div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mode === 'focus' ? <TranslatedText text="Focus Time" /> : <TranslatedText text="Break Time" />}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <Button size="lg" onClick={toggleTimer} className="min-w-32">
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    <TranslatedText text="Pause" />
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    <TranslatedText text="Start" />
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" onClick={resetTimer}>
                <RotateCcw className="mr-2 h-4 w-4" />
                <TranslatedText text="Reset" />
              </Button>
            </div>

            {/* Duration Selector */}
            <div className="mt-6 w-full max-w-xs">
              <label className="mb-2 block text-sm font-medium"><TranslatedText text="Duration (minutes)" /></label>
              <Select value={duration} onValueChange={handleDurationChange} disabled={isRunning}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="25">25 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Stats */}
        <div className="space-y-6">
          <Card className="border border-slate-200 dark:border-slate-700 rounded-2xl shadow-float bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase text-primary">
                <Volume2 className="h-6 w-6" />
                <TranslatedText text="Ambient Sounds" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {soundOptions.map((option) => {
                const Icon = option.icon;
                const isActive = currentSound === option.type && isSoundPlaying;
                return (
                  <Button
                    key={option.type}
                    variant={isActive ? 'default' : 'outline'}
                    className={`w-full justify-start border border-neon/30 font-bold ${
                      isActive
                        ? 'bg-primary text-black shadow-primary'
                        : 'text-primary hover:bg-primary hover:text-black shadow-primary'
                    }`}
                    onClick={() => handleSoundToggle(option.type)}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    <span className="uppercase"><TranslatedText text={option.label} /></span>
                    {isActive && (
                      <motion.div
                        className="ml-auto h-3 w-3 rounded-full bg-black"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    )}
                  </Button>
                );
              })}
              
              {/* Volume Control */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-bold text-white">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5 text-accent" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-primary" />
                    )}
                    <TranslatedText text="Volume" />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-black">{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="h-8 w-8 p-0 border border-purple text-accent hover:bg-accent hover:text-white"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                  disabled={isMuted}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 rounded-2xl shadow-accent bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl font-black uppercase text-accent"><TranslatedText text="Today's Stats" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-3 flex justify-between items-center p-3 bg-black/50 border border-purple/30 rounded">
                  <span className="font-bold text-white uppercase"><TranslatedText text="Focus Sessions" /></span>
                  <span className="text-2xl font-black text-primary">3</span>
                </div>
                <div className="mb-3 flex justify-between items-center p-3 bg-black/50 border border-neon/30 rounded">
                  <span className="font-bold text-white uppercase"><TranslatedText text="Total Time" /></span>
                  <span className="text-2xl font-black text-accent">1h 15m</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/50 border border-purple/30 rounded">
                  <span className="font-bold text-white uppercase"><TranslatedText text="XP Earned" /></span>
                  <span className="text-2xl font-black text-primary">+150 XP</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 rounded-2xl shadow-float bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl font-black uppercase text-primary"><TranslatedText text="Pro Tips" /></CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-white font-bold">
                <li className="flex items-start gap-2">
                  <span className="text-accent text-xl">•</span>
                  <TranslatedText text="Take a 5-minute break every 25 minutes" />
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent text-xl">•</span>
                  <TranslatedText text="Stay hydrated during focus sessions" />
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent text-xl">•</span>
                  <TranslatedText text="Remove distractions before starting" />
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent text-xl">•</span>
                  <TranslatedText text="Earn 2 XP per focused minute" />
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Friends Studying Now */}
          <Card className="border border-slate-200 dark:border-slate-700 rounded-2xl shadow-accent bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase text-accent">
                <Users className="h-6 w-6" />
                <TranslatedText text="Friends Online" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingFriends ? (
                <div className="space-y-2">
                  <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
                </div>
              ) : onlineFriends.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No friends online right now
                </p>
              ) : (
                <div className="space-y-2">
                  {onlineFriends.slice(0, 4).map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.name} className="h-8 w-8 rounded-full" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-accent">{friend.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0D1117]" />
                        </div>
                        <span className="text-sm font-semibold text-white">{friend.name}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-lg">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span className="text-xs font-bold text-orange-500">{friend.streak}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {onlineFriends.length > 4 && (
                <p className="text-xs text-center text-muted-foreground">
                  +{onlineFriends.length - 4} more online
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
