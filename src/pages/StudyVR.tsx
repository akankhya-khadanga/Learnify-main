import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranslatedText } from '@/components/TranslatedText';
import { Users, Globe, Headphones, Video, Copy, Check, Calculator, BookOpen, Brain, Trophy, ArrowRight, X } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useToast } from '@/hooks/use-toast';

type MathQuestion = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

const MATH_QUIZ_QUESTIONS: MathQuestion[] = [
  // Algebra
  {
    id: 1,
    topic: 'Algebra',
    question: 'Solve for x: 2x + 5 = 13',
    options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
    correct: 1,
    explanation: 'Subtract 5 from both sides: 2x = 8. Then divide by 2: x = 4',
    difficulty: 'easy'
  },
  {
    id: 2,
    topic: 'Algebra',
    question: 'What is the value of (x + 3)² when x = 2?',
    options: ['16', '25', '36', '49'],
    correct: 1,
    explanation: '(2 + 3)² = 5² = 25',
    difficulty: 'easy'
  },
  // Geometry
  {
    id: 3,
    topic: 'Geometry',
    question: 'What is the area of a circle with radius 5?',
    options: ['25π', '10π', '5π', '50π'],
    correct: 0,
    explanation: 'Area = πr² = π(5)² = 25π',
    difficulty: 'medium'
  },
  {
    id: 4,
    topic: 'Geometry',
    question: 'The sum of angles in a triangle equals:',
    options: ['90°', '180°', '270°', '360°'],
    correct: 1,
    explanation: 'The sum of all interior angles in any triangle is always 180°',
    difficulty: 'easy'
  },
  // Calculus
  {
    id: 5,
    topic: 'Calculus',
    question: 'What is the derivative of x²?',
    options: ['x', '2x', 'x²', '2x²'],
    correct: 1,
    explanation: 'Using power rule: d/dx(x²) = 2x¹ = 2x',
    difficulty: 'medium'
  },
  {
    id: 6,
    topic: 'Calculus',
    question: 'What is ∫2x dx?',
    options: ['x²', 'x² + C', '2x²', '2x² + C'],
    correct: 1,
    explanation: 'The integral of 2x is x² + C (constant of integration)',
    difficulty: 'medium'
  },
  // Statistics
  {
    id: 7,
    topic: 'Statistics',
    question: 'What is the mean of: 4, 8, 6, 5, 7?',
    options: ['5', '6', '7', '8'],
    correct: 1,
    explanation: 'Mean = (4+8+6+5+7) ÷ 5 = 30 ÷ 5 = 6',
    difficulty: 'easy'
  },
  {
    id: 8,
    topic: 'Statistics',
    question: 'The middle value in a sorted dataset is called:',
    options: ['Mean', 'Median', 'Mode', 'Range'],
    correct: 1,
    explanation: 'Median is the middle value when data is arranged in order',
    difficulty: 'easy'
  },
  // Trigonometry
  {
    id: 9,
    topic: 'Trigonometry',
    question: 'What is sin(90°)?',
    options: ['0', '0.5', '1', '√2/2'],
    correct: 2,
    explanation: 'sin(90°) = 1 (maximum value of sine function)',
    difficulty: 'easy'
  },
  {
    id: 10,
    topic: 'Trigonometry',
    question: 'Which trigonometric identity is correct?',
    options: ['sin²θ + cos²θ = 1', 'sin²θ - cos²θ = 1', 'sinθ + cosθ = 1', 'sinθ × cosθ = 1'],
    correct: 0,
    explanation: 'The Pythagorean identity: sin²θ + cos²θ = 1',
    difficulty: 'medium'
  }
];

export default function StudyVR() {
  const user = useUserStore((state) => state.user);
  const [copied, setCopied] = useState(false);
  const [mathCopied, setMathCopied] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [activeTab, setActiveTab] = useState('general');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [nextQuizDelay, setNextQuizDelay] = useState(30); // seconds
  const { toast } = useToast();

  const filteredQuestions = selectedTopic === 'All Topics' 
    ? MATH_QUIZ_QUESTIONS 
    : MATH_QUIZ_QUESTIONS.filter(q => q.topic === selectedTopic);

  // Calculate next quiz delay based on score performance
  const calculateNextQuizDelay = (correctCount: number, totalQuestions: number) => {
    const percentage = (correctCount / totalQuestions) * 100;
    
    if (percentage >= 90) {
      return 120; // 2 minutes - excellent performance
    } else if (percentage >= 70) {
      return 90; // 1.5 minutes - good performance
    } else if (percentage >= 50) {
      return 60; // 1 minute - average performance
    } else {
      return 30; // 30 seconds - needs more practice
    }
  };

  // Auto-start first quiz and trigger subsequent quizzes based on performance
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // First quiz: auto-start after 30 seconds when Math VR tab opens
    if (activeTab === 'math' && !showQuiz && !quizComplete && score === 0) {
      timer = setTimeout(() => {
        setShowQuiz(true);
        toast({
          title: '🎓 Math Quiz Challenge!',
          description: 'Test your math knowledge in VR!',
        });
      }, 30000); // 30 seconds for first quiz
    }
    
    // Subsequent quizzes: auto-trigger based on performance
    if (activeTab === 'math' && !showQuiz && quizComplete) {
      toast({
        title: `⏱️ Next Quiz in ${nextQuizDelay} seconds`,
        description: `${nextQuizDelay > 60 ? 'Great score! Take your time.' : 'Keep practicing to improve!'}`,
      });

      timer = setTimeout(() => {
        setShowQuiz(true);
        setQuizComplete(false);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(0);
        setConsecutiveCorrect(0);
        toast({
          title: '🎓 Next Math Quiz!',
          description: 'Ready for another challenge?',
        });
      }, nextQuizDelay * 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeTab, showQuiz, quizComplete, nextQuizDelay, score, toast]);

  const copyToClipboard = async (link: string, isMath: boolean = false) => {
    try {
      await navigator.clipboard.writeText(link);
      if (isMath) {
        setMathCopied(true);
        setTimeout(() => setMathCopied(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      toast({
        title: 'Link copied!',
        description: 'The VR room link has been copied to your clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again or copy manually.',
        variant: 'destructive',
      });
    }
  };

  const handleStartQuiz = (topic: string) => {
    setSelectedTopic(topic);
    setShowQuiz(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizComplete(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === filteredQuestions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
      setConsecutiveCorrect(consecutiveCorrect + 1);
      toast({
        title: '🎉 Correct!',
        description: 'Great job! You got it right!',
      });
    } else {
      setConsecutiveCorrect(0);
      toast({
        title: '❌ Incorrect',
        description: 'Check the explanation to learn!',
        variant: 'destructive',
      });
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < filteredQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const delay = calculateNextQuizDelay(score, filteredQuestions.length);
      setNextQuizDelay(delay);
      setQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setConsecutiveCorrect(0);
    setQuizComplete(false);
  };

  const currentQ = filteredQuestions[currentQuestion];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(190, 255, 0, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(190, 255, 0, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 border border-neon/30 shadow-float rounded-xl">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase text-primary drop-shadow-[0_0_20px_rgba(190,255,0,0.5)]">
              <TranslatedText text="Study VR" />
            </h1>
            <p className="text-lg font-bold text-white uppercase mt-2">
              <TranslatedText text="Join your classmates in virtual study environments" />
            </p>
          </div>
        </div>
      </motion.div>

      {/* VR Rooms Tabs */}
      <Tabs defaultValue="general" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-1 rounded-xl backdrop-blur-xl">
          <TabsTrigger 
            value="general" 
            className="data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase rounded-lg data-[state=active]:shadow-float"
          >
            <Video className="w-4 h-4 mr-2" />
            <TranslatedText text="General Study" />
          </TabsTrigger>
          <TabsTrigger 
            value="math" 
            className="data-[state=active]:bg-accent data-[state=active]:text-white font-black uppercase rounded-lg data-[state=active]:shadow-accent"
          >
            <Calculator className="w-4 h-4 mr-2" />
            <TranslatedText text="Math VR" />
          </TabsTrigger>
        </TabsList>

        {/* General Study VR Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-float">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg font-black uppercase text-primary">
                <TranslatedText text="Collaborative Learning" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white font-bold">
              <TranslatedText text="Study together with students from around the world in an immersive 3D environment" />
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-accent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-accent" />
              <CardTitle className="text-lg font-black uppercase text-accent">
                <TranslatedText text="Virtual Space" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white font-bold">
              <TranslatedText text="Experience learning in a shared virtual reality space designed for collaboration" />
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-cyan-glow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Headphones className="h-6 w-6 text-cyan-400" />
              <CardTitle className="text-lg font-black uppercase text-cyan-400">
                <TranslatedText text="Voice & Video" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white font-bold">
              <TranslatedText text="Communicate with other students using voice and video chat features" />
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* VR Environment */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-float">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black uppercase text-primary flex items-center gap-2">
                  <Video className="w-6 h-6" />
                  <TranslatedText text="Virtual Study Room" />
                </CardTitle>
                <CardDescription className="text-gray-300 mt-1">
                  {user?.name ? (
                    <>
                      <TranslatedText text="Welcome" />, <span className="font-semibold text-primary">{user.name}</span>! <TranslatedText text="Join the virtual study space below." />
                    </>
                  ) : (
                    <TranslatedText text="Join the virtual study space below." />
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-green-400 uppercase">LIVE</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full bg-black rounded-b-lg overflow-hidden">
              <iframe
                src="https://framevr.io/classroom"
                className="w-full border-0"
                allow="microphone; camera; fullscreen; autoplay; xr-spatial-tracking"
                allowFullScreen
                title="Virtual Study Environment"
                style={{ minHeight: '700px', height: '80vh' }}
              />
              
              {/* VR Controls Overlay */}
              <div className="absolute top-4 right-4 bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-xl p-3 border border-neon/30">
                <div className="flex flex-col gap-2 text-xs text-white font-bold">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-primary" />
                    <span>WASD to move</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Headphones className="w-3 h-3 text-accent" />
                    <span>Voice chat enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invite Link Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6"
      >
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-accent">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-accent/10 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2 font-black uppercase text-accent">
              <Users className="h-5 w-5" />
              <TranslatedText text="Invite Friends" />
            </CardTitle>
            <CardDescription className="text-gray-300">
              <TranslatedText text="Share this link with your friends to study together in the virtual environment" />
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-mono text-primary break-all">
                  https://framevr.io/classroom
                </span>
              </div>
              <Button
                onClick={() => copyToClipboard('https://framevr.io/classroom')}
                className={`w-full rounded-xl font-black ${
                  copied
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-black shadow-float'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    <TranslatedText text="Copied!" />
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    <TranslatedText text="Copy VR Link" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6"
      >
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-cyan-glow">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-cyan-400/10 to-transparent">
            <CardTitle className="text-lg font-black uppercase text-cyan-400">
              <TranslatedText text="Getting Started" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-primary font-black text-lg">1.</span>
                <span className="font-bold">
                  <TranslatedText text="Allow microphone and camera permissions when prompted" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-black text-lg">2.</span>
                <span className="font-bold">
                  <TranslatedText text="Use WASD keys or arrow keys to move around the virtual space" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-black text-lg">3.</span>
                <span className="font-bold">
                  <TranslatedText text="Click on other avatars to interact with fellow students" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-black text-lg">4.</span>
                <span className="font-bold">
                  <TranslatedText text="Use the chat feature or voice chat to communicate with others" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-black text-lg">5.</span>
                <span className="font-bold">
                  <TranslatedText text="Explore the virtual environment and find study spots to collaborate" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-black text-lg">6.</span>
                <span className="font-bold">
                  <TranslatedText text="Press F for fullscreen mode for an immersive experience" />
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
        </TabsContent>

        {/* Math VR Tab */}
        <TabsContent value="math" className="space-y-6 mt-6">
          {/* Math VR Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-float">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg font-black uppercase text-primary">
                    <TranslatedText text="Interactive Tools" />
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white font-bold">
                  <TranslatedText text="Use virtual whiteboards, 3D graphing calculators, and geometry tools" />
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-accent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-accent" />
                  <CardTitle className="text-lg font-black uppercase text-accent">
                    <TranslatedText text="Topic Libraries" />
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white font-bold">
                  <TranslatedText text="Algebra, Calculus, Geometry, Statistics, and Trigonometry resources" />
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-cyan-glow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-cyan-400" />
                  <CardTitle className="text-lg font-black uppercase text-cyan-400">
                    <TranslatedText text="Collaborative" />
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white font-bold">
                  <TranslatedText text="Work together on math problems with students worldwide" />
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Math VR Environment */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-float">
              <CardHeader className="bg-gradient-to-br from-accent/10 to-transparent border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black uppercase text-accent flex items-center gap-2">
                      <Calculator className="w-6 h-6" />
                      <TranslatedText text="Mathematics Virtual Classroom" />
                    </CardTitle>
                    <CardDescription className="text-gray-300 mt-1">
                      {user?.name ? (
                        <>
                          <TranslatedText text="Welcome" />, <span className="font-semibold text-primary">{user.name}</span>! <TranslatedText text="Enter the immersive mathematics VR space below." />
                        </>
                      ) : (
                        <TranslatedText text="Enter the immersive mathematics VR space below." />
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-green-400 uppercase">LIVE</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full bg-black rounded-b-lg overflow-hidden">
                  <iframe
                    src="https://framevr.io/academy"
                    className="w-full border-0"
                    allow="microphone; camera; fullscreen; autoplay; xr-spatial-tracking"
                    allowFullScreen
                    title="Mathematics VR Classroom"
                    style={{ minHeight: '700px', height: '80vh' }}
                  />
                  
                  {/* VR Controls Overlay */}
                  <div className="absolute top-4 right-4 bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-xl p-3 border border-neon/30">
                    <div className="flex flex-col gap-2 text-xs text-white font-bold">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-primary" />
                        <span>WASD to move</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Headphones className="w-3 h-3 text-accent" />
                        <span>Voice chat enabled</span>
                      </div>
                    </div>
                  </div>

                  {/* Quiz Overlay */}
                  {showQuiz && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto"
                    >
                      <div className="w-full max-w-3xl">
                        {!quizComplete ? (
                          <Card className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#161B22]/95 to-[#0D1117]/95 backdrop-blur-xl shadow-accent">
                            <CardHeader className="border-b border-purple-500/30 bg-gradient-to-br from-accent-500/20 to-transparent">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-2xl font-black uppercase text-accent-400 flex items-center gap-2">
                                    <Brain className="w-7 h-7" />
                                    Math Quiz Challenge
                                  </CardTitle>
                                  <CardDescription className="text-gray-300 font-bold mt-2 text-base">
                                    Question {currentQuestion + 1} of {filteredQuestions.length} • Score: {score}/{filteredQuestions.length}
                                  </CardDescription>
                                </div>
                                <Button
                                  onClick={() => {
                                    setShowQuiz(false);
                                    setCurrentQuestion(0);
                                    setSelectedAnswer(null);
                                    setShowExplanation(false);
                                    setScore(0);
                                    setQuizComplete(false);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white hover:bg-red-500/20"
                                >
                                  <X className="w-6 h-6" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                              {/* Question */}
                              <div className="bg-gradient-to-br from-accent-900/40 to-accent/20 p-6 rounded-xl border border-purple-500/30">
                                <span className="text-sm font-black text-accent-300 uppercase px-3 py-1 bg-accent-500/30 rounded-full">
                                  {currentQ.topic}
                                </span>
                                <h4 className="text-2xl font-black text-white mt-4 leading-tight">{currentQ.question}</h4>
                              </div>

                              {/* Answer Options */}
                              <div className="space-y-4">
                                {currentQ.options.map((option, index) => {
                                  const isSelected = selectedAnswer === index;
                                  const isCorrect = index === currentQ.correct;
                                  const showResult = showExplanation;

                                  return (
                                    <motion.button
                                      key={index}
                                      onClick={() => handleAnswerSelect(index)}
                                      disabled={showExplanation}
                                      whileHover={!showExplanation ? { scale: 1.02, x: 8 } : {}}
                                      whileTap={!showExplanation ? { scale: 0.98 } : {}}
                                      className={`w-full p-5 rounded-xl border-4 text-left font-black text-lg transition-all ${
                                        showResult
                                          ? isCorrect
                                            ? 'bg-green-500/30 border-green-500 text-green-300 shadow-[6px_6px_0px_0px_rgba(34,197,94,0.5)]'
                                            : isSelected
                                            ? 'bg-red-500/30 border-red-500 text-red-300 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.5)]'
                                            : 'bg-gray-800/50 border-gray-700 text-gray-500'
                                          : isSelected
                                          ? 'bg-accent-500/40 border-purple-400 text-white shadow-[6px_6px_0px_0px_rgba(168,85,247,0.5)]'
                                          : 'bg-gray-800/80 border-gray-600 text-white hover:border-purple-400 hover:shadow-[6px_6px_0px_0px_rgba(168,85,247,0.3)]'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        {showResult && isCorrect && (
                                          <div className="flex items-center gap-2">
                                            <Check className="w-6 h-6 text-green-400" />
                                            <span className="text-sm">Correct!</span>
                                          </div>
                                        )}
                                        {showResult && isSelected && !isCorrect && (
                                          <X className="w-6 h-6 text-red-400" />
                                        )}
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>

                              {/* Explanation */}
                              {showExplanation && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="bg-cyan-400/10 border border-cyan-400/30 p-5 rounded-xl shadow-cyan-glow"
                                >
                                  <h5 className="font-black text-cyan-400 uppercase mb-3 flex items-center gap-2 text-lg">
                                    <Brain className="w-5 h-5" />
                                    Explanation:
                                  </h5>
                                  <p className="text-white font-bold text-base leading-relaxed">{currentQ.explanation}</p>
                                </motion.div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-4 pt-4">
                                {!showExplanation ? (
                                  <Button
                                    onClick={handleSubmitAnswer}
                                    disabled={selectedAnswer === null}
                                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-black font-black text-lg rounded-xl shadow-float py-6 disabled:opacity-30"
                                  >
                                    Submit Answer
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={handleNextQuestion}
                                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-black font-black text-lg rounded-xl shadow-float py-6"
                                  >
                                    {currentQuestion + 1 < filteredQuestions.length ? (
                                      <>
                                        Next Question
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                      </>
                                    ) : (
                                      <>
                                        Finish Quiz
                                        <Trophy className="w-5 h-5 ml-2" />
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="rounded-2xl border border-neon/30 bg-gradient-to-br from-[#161B22]/95 to-[#0D1117]/95 backdrop-blur-xl shadow-float">
                            <CardContent className="pt-12 pb-12 text-center space-y-8">
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', duration: 0.8 }}
                              >
                                <Trophy className="w-32 h-32 text-primary mx-auto mb-6 drop-shadow-[0_0_20px_rgba(190,255,0,0.8)]" />
                                <h3 className="text-5xl font-black text-primary mb-4 uppercase">Quiz Complete!</h3>
                                <div className="bg-gradient-to-r from-accent to-primary inline-block px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-float">
                                  <p className="text-4xl font-black text-white">
                                    Score: <span className="text-yellow-300">{score}</span> / {filteredQuestions.length}
                                  </p>
                                </div>
                                <p className="text-3xl font-bold text-white mt-6">
                                  {score === filteredQuestions.length ? '🎉 Perfect Score! Amazing!' : 
                                   score >= filteredQuestions.length * 0.7 ? '👏 Great Job! Well Done!' : 
                                   '💪 Keep Practicing! You Got This!'}
                                </p>
                                <div className="mt-6 bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-6 inline-block">
                                  <p className="text-xl font-black text-cyan-400 mb-2">⏱️ Next Quiz Timer</p>
                                  <p className="text-2xl font-bold text-white">
                                    {nextQuizDelay >= 120 ? '2 minutes' : 
                                     nextQuizDelay >= 90 ? '1.5 minutes' : 
                                     nextQuizDelay >= 60 ? '1 minute' : 
                                     '30 seconds'}
                                  </p>
                                  <p className="text-sm text-gray-300 mt-2 font-bold">
                                    {nextQuizDelay >= 90 ? '🌟 Excellent! You earned extra time to explore VR!' : 
                                     nextQuizDelay >= 60 ? '✨ Good job! Enjoy some VR time!' : 
                                     '🔥 Quick refresh - keep building your skills!'}
                                  </p>
                                </div>
                              </motion.div>
                              <div className="flex gap-4 justify-center pt-6">
                                <Button
                                  onClick={handleRestartQuiz}
                                  className="bg-primary hover:bg-primary/90 text-black font-black text-lg rounded-xl shadow-float px-8 py-6"
                                >
                                  Try Again
                                </Button>
                                <Button
                                  onClick={() => {
                                    setShowQuiz(false);
                                    setQuizComplete(false);
                                    setScore(0);
                                    setCurrentQuestion(0);
                                  }}
                                  className="bg-accent hover:bg-accent/90 text-white font-black text-lg rounded-xl shadow-accent px-8 py-6"
                                >
                                  Exit Quiz
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Math Topics & Invite */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Math Topics */}
            <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-float">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-primary/10 to-transparent">
                <CardTitle className="text-lg font-black uppercase text-primary flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <TranslatedText text="Practice Topics" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Algebra', icon: '📐', color: 'bg-primary/10 border-neon/30 text-primary' },
                    { name: 'Calculus', icon: '∫', color: 'bg-accent/10 border-purple/30 text-accent' },
                    { name: 'Geometry', icon: '📊', color: 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' },
                    { name: 'Statistics', icon: '📈', color: 'bg-primary/10 border-neon/30 text-primary' },
                    { name: 'Trigonometry', icon: '📐', color: 'bg-accent/10 border-purple/30 text-accent' },
                    { name: 'All Topics', icon: '🎯', color: 'bg-white/5 border-slate-200 dark:border-slate-700 text-white' },
                  ].map((topic, index) => (
                    <motion.button
                      key={topic.name}
                      onClick={() => handleStartQuiz(topic.name)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${topic.color} border rounded-xl p-3 text-center hover:brightness-110 transition-all font-black uppercase text-sm`}
                    >
                      <div className="text-2xl mb-1">{topic.icon}</div>
                      <div>{topic.name}</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Math VR Invite */}
            <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#161B22]/90 to-[#0D1117]/90 backdrop-blur-xl shadow-accent">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-accent/10 to-transparent">
                <CardTitle className="text-lg font-black uppercase text-accent flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <TranslatedText text="Invite Math Partners" />
                </CardTitle>
                <CardDescription className="text-gray-300 font-bold">
                  <TranslatedText text="Share this link to collaborate on math problems together" />
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-mono text-primary break-all">
                      https://framevr.io/academy
                    </span>
                  </div>
                  <Button
                    onClick={() => copyToClipboard('https://framevr.io/academy', true)}
                    className={`w-full rounded-xl font-black ${
                      mathCopied
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                        : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-black shadow-float'
                    }`}
                  >
                    {mathCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        <TranslatedText text="Copied!" />
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        <TranslatedText text="Copy Math VR Link" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

