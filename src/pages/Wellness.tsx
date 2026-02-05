import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  MoodType,
  StressLevel,
  EmotionalTag,
  MOOD_OPTIONS,
  getTodayAffirmation,
  MOTIVATION_MEMORIES,
  MOCK_COMPASSION_CONVERSATION,
  getBreathingExercise,
  CRISIS_RESOURCES,
  shouldShowCrisisMode,
  DAILY_AFFIRMATIONS
} from '@/mocks/wellness';
import MoodSelector from '@/components/wellness/MoodSelector';
import StressSlider from '@/components/wellness/StressSlider';
import QuickTagSelector from '@/components/wellness/QuickTagSelector';
import CompassionChat from '@/components/wellness/CompassionChat';
import MotivationCard from '@/components/wellness/MotivationCard';
import CrisisOverlay from '@/components/wellness/CrisisOverlay';
import ReflectionJournal from '@/components/wellness/ReflectionJournal';
import MemoryCard from '@/components/wellness/MemoryCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Wellness() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [stressLevel, setStressLevel] = useState<StressLevel>(5);
  const [selectedTags, setSelectedTags] = useState<EmotionalTag[]>([]);
  const [showCrisis, setShowCrisis] = useState(false);

  const todayAffirmation = getTodayAffirmation();
  const breathingExercise = getBreathingExercise('moderate');

  // Check if crisis mode should activate
  useEffect(() => {
    if (selectedMood && shouldShowCrisisMode(selectedMood, stressLevel, selectedTags)) {
      setShowCrisis(true);
    }
  }, [selectedMood, stressLevel, selectedTags]);

  const handleToggleTag = (tag: EmotionalTag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveCheckIn = () => {
    toast({
      title: 'Check-in Saved 💙',
      description: 'Your emotional state has been recorded. Take care of yourself.',
      duration: 5000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C27BA0] to-[#6DAEDB] flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Emotional Wellness</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Your mental health matters. We're here to support you.
                  </p>
                </div>
              </div>
            </div>
            {(selectedMood === 'STRUGGLING' || stressLevel >= 8) && (
              <Button
                onClick={() => setShowCrisis(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Need Help Now?
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Check-in Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">How Are You Today?</h2>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <MoodSelector
                moods={MOOD_OPTIONS}
                selectedMood={selectedMood}
                onSelect={setSelectedMood}
              />

              <StressSlider level={stressLevel} onChange={setStressLevel} />

              <QuickTagSelector selectedTags={selectedTags} onToggle={handleToggleTag} />

              <Button
                onClick={handleSaveCheckIn}
                disabled={!selectedMood}
                className="w-full bg-gradient-to-r from-[#C9B458] to-[#C27BA0] hover:opacity-90 text-black font-black disabled:opacity-50"
              >
                Save Check-in
              </Button>
            </motion.div>

            {/* Motivation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MotivationCard affirmation={todayAffirmation} />
              {DAILY_AFFIRMATIONS.slice(1, 3).map(aff => (
                <MotivationCard key={aff.id} affirmation={aff} size="small" />
              ))}
            </div>

            {/* Why You Started */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white">Remember Why You Started</h3>
              <div className="grid grid-cols-1 gap-4">
                {MOTIVATION_MEMORIES.map(memory => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            </div>

            {/* Reflection Journal */}
            <ReflectionJournal />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CompassionChat messages={MOCK_COMPASSION_CONVERSATION} />
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Overlay */}
      <CrisisOverlay
        isOpen={showCrisis}
        onClose={() => setShowCrisis(false)}
        exercise={breathingExercise}
        resources={CRISIS_RESOURCES}
      />
    </div>
  );
}
