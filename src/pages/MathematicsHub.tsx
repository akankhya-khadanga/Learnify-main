import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/TranslatedText';
import { 
  Calculator, 
  Users, 
  Video, 
  Copy, 
  Check, 
  BookOpen, 
  PenTool, 
  Lightbulb,
  ChevronRight,
  Globe,
  Headphones
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useToast } from '@/hooks/use-toast';

export default function MathematicsHub() {
  const user = useUserStore((state) => state.user);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const vrLink = 'https://framevr.io/INTELLI-LEARN-math';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(vrLink);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'The Mathematics VR classroom link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again or copy manually.',
        variant: 'destructive',
      });
    }
  };

  const features = [
    {
      icon: Calculator,
      title: 'Interactive Tools',
      description: 'Use virtual whiteboards, 3D graphing calculators, and geometry tools',
      color: 'text-[#C9B458]',
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Work together on math problems with students worldwide',
      color: 'text-[#C27BA0]',
    },
    {
      icon: BookOpen,
      title: 'Topic Libraries',
      description: 'Access algebra, calculus, geometry, and statistics resources',
      color: 'text-[#6DAEDB]',
    },
    {
      icon: PenTool,
      title: 'Practice Problems',
      description: 'Solve problems together and share different solving approaches',
      color: 'text-[#C9B458]',
    },
    {
      icon: Lightbulb,
      title: 'AI Math Tutor',
      description: 'Get instant help with step-by-step problem explanations',
      color: 'text-[#C27BA0]',
    },
    {
      icon: Video,
      title: 'Live Sessions',
      description: 'Join scheduled math study sessions with peers and mentors',
      color: 'text-[#6DAEDB]',
    },
  ];

  const topics = [
    { name: 'Algebra', icon: '📐', color: 'bg-[#C9B458]/20 border-[#C9B458]/30' },
    { name: 'Calculus', icon: '∫', color: 'bg-[#C27BA0]/20 border-[#C27BA0]/30' },
    { name: 'Geometry', icon: '📊', color: 'bg-[#6DAEDB]/20 border-[#6DAEDB]/30' },
    { name: 'Statistics', icon: '📈', color: 'bg-[#C9B458]/20 border-[#C9B458]/30' },
    { name: 'Trigonometry', icon: '📐', color: 'bg-[#C27BA0]/20 border-[#C27BA0]/30' },
    { name: 'Linear Algebra', icon: '🔢', color: 'bg-[#6DAEDB]/20 border-[#6DAEDB]/30' },
  ];

  return (
    <div className="relative min-h-screen bg-[#0F1115] text-white pb-24">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-neon/5 via-transparent to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(190, 255, 0, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(190, 255, 0, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 border-b-4 border-[#C9B458] pb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-[#C9B458]/20 to-[#C27BA0]/20 backdrop-blur-xl rounded-2xl border-2 border-[#C9B458]/30">
              <Calculator className="w-12 h-12 text-[#C9B458]" />
            </div>
            <div>
              <h1 className="text-6xl font-black uppercase">
                <span className="text-[#C9B458]">Mathematics</span>
                <span className="text-[#C27BA0] ml-4">Hub</span>
              </h1>
              <p className="text-xl text-white/70 font-bold mt-2">
                <TranslatedText text="VIRTUAL REALITY MATHEMATICS CLASSROOM" />
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 hover:border-[#C9B458]/30 transition-all h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-white/5 rounded-lg ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base text-white">
                      <TranslatedText text={feature.title} />
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/60">
                    <TranslatedText text={feature.description} />
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* VR Classroom */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-[#C9B458]/30 overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase text-white flex items-center gap-2">
                    <Video className="w-6 h-6 text-[#C9B458]" />
                    <TranslatedText text="Virtual Mathematics Classroom" />
                  </CardTitle>
                  <CardDescription className="text-white/70 mt-2">
                    {user?.name ? (
                      <>
                        <TranslatedText text="Welcome" />, <span className="font-semibold text-[#C9B458]">{user.name}</span>! <TranslatedText text="Enter the immersive mathematics VR space below." />
                      </>
                    ) : (
                      <TranslatedText text="Enter the immersive mathematics VR space below." />
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-green-400">LIVE</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full bg-black rounded-b-lg overflow-hidden">
                <iframe
                  src="https://framevr.io/INTELLI-LEARN-math"
                  className="w-full border-0"
                  allow="microphone; camera; fullscreen; autoplay; xr-spatial-tracking"
                  allowFullScreen
                  title="Mathematics VR Classroom"
                  style={{ minHeight: '700px', height: '80vh' }}
                />
                
                {/* VR Controls Overlay */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="flex flex-col gap-2 text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-[#C9B458]" />
                      <span>WASD to move</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Headphones className="w-3 h-3 text-[#C27BA0]" />
                      <span>Voice chat enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Topics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C9B458]" />
                <TranslatedText text="Mathematics Topics" />
              </CardTitle>
              <CardDescription className="text-white/60">
                <TranslatedText text="Explore different areas of mathematics in the VR classroom" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {topics.map((topic, index) => (
                  <motion.button
                    key={topic.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${topic.color} border-2 rounded-xl p-4 text-center hover:bg-white/10 transition-all group`}
                  >
                    <div className="text-3xl mb-2">{topic.icon}</div>
                    <div className="font-bold text-white text-sm group-hover:text-[#C9B458] transition-colors">
                      {topic.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invite Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#C9B458]" />
                  <TranslatedText text="Invite Study Partners" />
                </CardTitle>
                <CardDescription className="text-white/60">
                  <TranslatedText text="Share this link to collaborate on math problems together" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-black/40 rounded-lg border border-white/10 flex items-center gap-2">
                    <span className="text-sm font-mono text-[#C9B458] break-all flex-1">
                      {vrLink}
                    </span>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    className={`w-full font-bold ${
                      copied
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gradient-to-r from-[#C9B458] to-[#C27BA0] hover:opacity-90'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        <TranslatedText text="Copied!" />
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        <TranslatedText text="Copy Invite Link" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Guide */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#C9B458]" />
                  <TranslatedText text="Quick Start Guide" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'Allow microphone and camera permissions when prompted',
                    'Use WASD or arrow keys to navigate the virtual classroom',
                    'Click on whiteboards to draw equations and graphs',
                    'Use voice chat to discuss problems with study partners',
                    'Access the AI tutor by clicking the helper icon',
                    'Save your work to your INTELLI-LEARN notebook',
                  ].map((step, index) => (
                    <li key={index} className="flex items-start gap-3 text-white/70 text-sm group">
                      <div className="mt-0.5 shrink-0">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#C9B458]/20 to-[#C27BA0]/20 border border-[#C9B458]/30 flex items-center justify-center">
                          <span className="text-xs font-black text-[#C9B458]">{index + 1}</span>
                        </div>
                      </div>
                      <span className="group-hover:text-white transition-colors">
                        <TranslatedText text={step} />
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Study Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6"
        >
          <Card className="bg-gradient-to-r from-[#C9B458]/10 via-[#C27BA0]/10 to-[#6DAEDB]/10 backdrop-blur-xl border-2 border-[#C9B458]/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-[#C9B458] to-[#C27BA0] rounded-xl shrink-0">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black uppercase text-white mb-2">
                    <TranslatedText text="Pro Tips for VR Math Study" />
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
                    <div className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-[#C9B458] shrink-0 mt-0.5" />
                      <span>Use the whiteboard tool to visualize complex equations and share your solving process</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-[#C27BA0] shrink-0 mt-0.5" />
                      <span>Form study groups of 3-5 students for optimal collaboration on problem sets</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-[#6DAEDB] shrink-0 mt-0.5" />
                      <span>Use the 3D graphing tool to explore calculus and geometry concepts interactively</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
