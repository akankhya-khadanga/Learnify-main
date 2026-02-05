import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSoundPlayer } from '@/hooks/useSoundPlayer';
import { TranslatedText } from '@/components/TranslatedText';
import { GridScan } from '@/components/3D/GridScan';
import { ThreeDFallback } from '@/components/3D/ThreeDFallback';
import {
  BookOpen,
  Clock,
  Star,
  Trophy,
  Award,
  CheckCircle2,
  PlayCircle,
  Code,
  MessageSquare,
  ArrowLeft,
  Target,
  Zap,
  Users,
  BookMarked,
  Download,
  ChevronRight,
  ChevronLeft,
  Lock,
  Video,
  FileText,
  Brain,
  Sparkles,
  TrendingUp,
  LayoutGrid,
} from 'lucide-react';
import { MOCK_COURSES } from '@/mocks/courses';
import type { MockCourse, MockModule, MockLesson } from '@/mocks/courses';

// Helper function to get difficulty badge color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'intermediate':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'advanced':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  }
};

// Helper function to get lesson type icon
const getLessonIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'reading':
      return <FileText className="h-4 w-4" />;
    case 'quiz':
      return <Brain className="h-4 w-4" />;
    case 'coding':
      return <Code className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playSound } = useSoundPlayer();
  
  const [course, setCourse] = useState<MockCourse | null>(null);
  const [currentLesson, setCurrentLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'resources' | 'reviews'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  // Load course data from mock
  const loadCourse = () => {
    setIsLoading(true);
    try {
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      // Find course in MOCK_COURSES
      const foundCourse = MOCK_COURSES.find(c => c.id === courseId);
      
      if (!foundCourse) {
        throw new Error('Course not found');
      }

      setCourse(foundCourse);
      
      // Load progress from localStorage
      const savedProgress = localStorage.getItem(`course_progress_${courseId}`);
      if (savedProgress) {
        try {
          const progressData = JSON.parse(savedProgress);
          setCompletedLessons(new Set(progressData.completedLessons || []));
          
          // Set current lesson to last incomplete or first lesson
          if (progressData.currentLesson) {
            setCurrentLesson(progressData.currentLesson);
          } else if (foundCourse.modules.length > 0 && foundCourse.modules[0].lessons.length > 0) {
            setCurrentLesson({
              moduleId: foundCourse.modules[0].id,
              lessonId: foundCourse.modules[0].lessons[0].id,
            });
          }
        } catch (e) {
          console.error('Error loading saved progress:', e);
        }
      } else if (foundCourse.modules.length > 0 && foundCourse.modules[0].lessons.length > 0) {
        // No saved progress, start with first lesson
        setCurrentLesson({
          moduleId: foundCourse.modules[0].id,
          lessonId: foundCourse.modules[0].lessons[0].id,
        });
      }

      // Load bookmark status
      const bookmarks = JSON.parse(localStorage.getItem('bookmarked_courses') || '[]');
      setIsBookmarked(bookmarks.includes(courseId));

    } catch (error: any) {
      console.error('Error loading course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load course',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress
  const totalLessons = course?.modules.reduce((acc, mod) => acc + mod.lessons.length, 0) || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;

  // Get current lesson object
  const getCurrentLesson = (): MockLesson | null => {
    if (!course || !currentLesson) return null;
    const module = course.modules.find(m => m.id === currentLesson.moduleId);
    if (!module) return null;
    return module.lessons.find(l => l.id === currentLesson.lessonId) || null;
  };

  // Get current module object
  const getCurrentModule = (): MockModule | null => {
    if (!course || !currentLesson) return null;
    return course.modules.find(m => m.id === currentLesson.moduleId) || null;
  };

  // Handle lesson completion
  const handleCompleteLesson = () => {
    if (!currentLesson) return;
    
    const lessonKey = `${currentLesson.moduleId}-${currentLesson.lessonId}`;
    const newCompleted = new Set(completedLessons);
    newCompleted.add(lessonKey);
    setCompletedLessons(newCompleted);

    // Play success sound
    playSound('success');

    // Save progress
    if (courseId) {
      const progressData = {
        completedLessons: Array.from(newCompleted),
        currentLesson,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(progressData));
    }

    toast({
      title: 'Lesson Completed!',
      description: `You've earned 50 XP`,
    });
  };

  // Navigate to next lesson
  const handleNextLesson = () => {
    if (!course || !currentLesson) return;

    const currentModule = course.modules.find(m => m.id === currentLesson.moduleId);
    if (!currentModule) return;

    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.lessonId);
    
    // Check if there's a next lesson in current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      const nextLesson = currentModule.lessons[currentLessonIndex + 1];
      setCurrentLesson({
        moduleId: currentModule.id,
        lessonId: nextLesson.id,
      });
    } else {
      // Move to first lesson of next module
      const currentModuleIndex = course.modules.findIndex(m => m.id === currentLesson.moduleId);
      if (currentModuleIndex < course.modules.length - 1) {
        const nextModule = course.modules[currentModuleIndex + 1];
        if (nextModule.lessons.length > 0) {
          setCurrentLesson({
            moduleId: nextModule.id,
            lessonId: nextModule.lessons[0].id,
          });
        }
      } else {
        toast({
          title: 'Course Completed!',
          description: 'Congratulations on finishing this course!',
        });
      }
    }
  };

  // Navigate to previous lesson
  const handlePreviousLesson = () => {
    if (!course || !currentLesson) return;

    const currentModule = course.modules.find(m => m.id === currentLesson.moduleId);
    if (!currentModule) return;

    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.lessonId);
    
    // Check if there's a previous lesson in current module
    if (currentLessonIndex > 0) {
      const prevLesson = currentModule.lessons[currentLessonIndex - 1];
      setCurrentLesson({
        moduleId: currentModule.id,
        lessonId: prevLesson.id,
      });
    } else {
      // Move to last lesson of previous module
      const currentModuleIndex = course.modules.findIndex(m => m.id === currentLesson.moduleId);
      if (currentModuleIndex > 0) {
        const prevModule = course.modules[currentModuleIndex - 1];
        if (prevModule.lessons.length > 0) {
          setCurrentLesson({
            moduleId: prevModule.id,
            lessonId: prevModule.lessons[prevModule.lessons.length - 1].id,
          });
        }
      }
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = () => {
    if (!courseId) return;

    const bookmarks = JSON.parse(localStorage.getItem('bookmarked_courses') || '[]');
    let newBookmarks: string[];

    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== courseId);
      toast({ title: 'Bookmark removed' });
    } else {
      newBookmarks = [...bookmarks, courseId];
      toast({ title: 'Course bookmarked!' });
    }

    localStorage.setItem('bookmarked_courses', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  // Check if lesson is completed
  const isLessonCompleted = (moduleId: string, lessonId: string) => {
    return completedLessons.has(`${moduleId}-${lessonId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#C9B458] mx-auto"></div>
              <p className="text-lg text-muted-foreground">Loading course...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-12 text-center space-y-4">
              <h2 className="text-2xl font-bold">Course Not Found</h2>
              <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/courses')} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeLesson = getCurrentLesson();
  const activeModule = getCurrentModule();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Breadcrumb */}
      <div className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate('/dashboard')} className="hover:text-foreground transition-colors">
              Dashboard
            </button>
            <ChevronRight className="h-4 w-4" />
            <button onClick={() => navigate('/courses')} className="hover:text-foreground transition-colors">
              Courses
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{course.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative border-b-4 border-black bg-gradient-to-br from-[#C9B458]/10 via-[#C27BA0]/10 to-[#6DAEDB]/10 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ThreeDFallback fallbackColor="from-[#C9B458]/5 to-[#6DAEDB]/5">
            <GridScan />
          </ThreeDFallback>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/courses')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Course Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={`${getDifficultyColor(course.difficulty)} border-2 text-sm px-3 py-1`}>
                      {course.difficulty.toUpperCase()}
                    </Badge>
                    <Badge className="bg-[#C9B458]/10 text-[#C9B458] border-2 border-[#C9B458]/20 text-sm px-3 py-1">
                      {course.category}
                    </Badge>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{course.title}</h1>
                  
                  <p className="text-lg text-muted-foreground max-w-3xl">{course.description}</p>

                  {/* Course Meta */}
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{course.enrolledStudents.toLocaleString()} enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{course.lessonsCount} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{course.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({course.reviews} reviews)</span>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C9B458] to-[#C27BA0] flex items-center justify-center text-white font-bold">
                      {course.instructor.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Instructor</p>
                      <p className="font-semibold">{course.instructor}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap">
                  <Button
                    size="lg"
                    className="bg-[#C9B458] hover:bg-[#B8A347] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    onClick={() => setActiveTab('curriculum')}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    {progressPercentage > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    onClick={handleToggleBookmark}
                  >
                    <BookMarked className={`mr-2 h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-4 border-black bg-[#C27BA0]/10 hover:bg-[#C27BA0]/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    onClick={() => navigate('/workspace')}
                  >
                    <LayoutGrid className="mr-2 h-5 w-5" />
                    Open in Workspace
                  </Button>
                </div>
              </div>

              {/* Right: Progress Card */}
              <div className="lg:col-span-1">
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-[#C9B458]" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-bold text-[#C9B458]">{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="relative h-3 bg-muted border-2 border-black rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#C9B458] to-[#C27BA0]"
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                        <p className="text-2xl font-bold">{completedLessons.size}/{totalLessons}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Zap className="h-4 w-4" />
                          <span>XP Earned</span>
                        </div>
                        <p className="text-2xl font-bold text-[#C9B458]">{completedLessons.size * 50}</p>
                      </div>
                    </div>

                    <Separator className="bg-black" />

                    {/* Quick Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Modules</span>
                        <span className="font-semibold">{course.modules.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Lessons</span>
                        <span className="font-semibold">{totalLessons}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Time</span>
                        <span className="font-semibold">{course.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 border-4 border-black p-1 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#C9B458] data-[state=active]:text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="data-[state=active]:bg-[#C9B458] data-[state=active]:text-white">
              <BookOpen className="mr-2 h-4 w-4" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-[#C9B458] data-[state=active]:text-white">
              <Download className="mr-2 h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[#C9B458] data-[state=active]:text-white">
              <Star className="mr-2 h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* What You'll Learn */}
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#C9B458]" />
                      What You'll Learn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.skills.slice(0, 6).map((skill, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{skill}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Description */}
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                      This comprehensive course is designed to take you from beginner to advanced level. 
                      You'll learn through hands-on projects, real-world examples, and interactive exercises.
                      By the end of this course, you'll have the skills and confidence to build your own projects.
                    </p>
                  </CardContent>
                </Card>

                {/* Prerequisites */}
                {course.prerequisites.length > 0 && (
                  <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[#C27BA0]" />
                        Prerequisites
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {course.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <ChevronRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span>{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Skills */}
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <CardTitle className="text-lg">Skills You'll Gain</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {course.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Instructor */}
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <CardTitle className="text-lg">Instructor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#C9B458] to-[#C27BA0] flex items-center justify-center text-white font-bold text-2xl border-4 border-black">
                        {course.instructor.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{course.instructor}</p>
                        <p className="text-sm text-muted-foreground">Expert Instructor</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Experienced educator with years of industry expertise in {course.category}.
                      Passionate about teaching and helping students succeed.
                    </p>
                  </CardContent>
                </Card>

                {/* Related Courses */}
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <CardTitle className="text-lg">Related Courses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {MOCK_COURSES.filter(c => c.id !== courseId && c.category === course.category)
                      .slice(0, 3)
                      .map((relatedCourse) => (
                        <button
                          key={relatedCourse.id}
                          onClick={() => navigate(`/courses/${relatedCourse.id}`)}
                          className="w-full text-left p-3 rounded-lg border-2 border-black hover:bg-accent transition-colors"
                        >
                          <p className="font-semibold text-sm line-clamp-1">{relatedCourse.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs text-muted-foreground">{relatedCourse.rating.toFixed(1)}</span>
                          </div>
                        </button>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Module Sidebar */}
              <div className="lg:col-span-1">
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Modules</CardTitle>
                    <CardDescription>{course.modules.length} modules • {totalLessons} lessons</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {course.modules.map((module, moduleIndex) => {
                        const moduleProgress = module.lessons.filter(l => 
                          isLessonCompleted(module.id, l.id)
                        ).length;
                        const modulePercentage = (moduleProgress / module.lessons.length) * 100;

                        return (
                          <AccordionItem key={module.id} value={module.id} className="border-b-2 border-black px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex items-start gap-3 text-left flex-1">
                                <div className="mt-1">
                                  {moduleProgress === module.lessons.length ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : moduleProgress > 0 ? (
                                    <div className="h-5 w-5 rounded-full border-2 border-[#C9B458] bg-[#C9B458]/20" />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">Module {moduleIndex + 1}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{module.title}</p>
                                  <div className="mt-2 space-y-1">
                                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-[#C9B458]"
                                        style={{ width: `${modulePercentage}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {moduleProgress}/{module.lessons.length} lessons
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="space-y-1 pl-8">
                                {module.lessons.map((lesson) => {
                                  const isCompleted = isLessonCompleted(module.id, lesson.id);
                                  const isCurrent = currentLesson?.moduleId === module.id && 
                                                   currentLesson?.lessonId === lesson.id;

                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => setCurrentLesson({ moduleId: module.id, lessonId: lesson.id })}
                                      className={`w-full text-left p-2 rounded-lg border-2 transition-all ${
                                        isCurrent
                                          ? 'border-[#C9B458] bg-[#C9B458]/10'
                                          : 'border-transparent hover:border-black hover:bg-accent'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isCompleted ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <div className="h-4 w-4">{getLessonIcon(lesson.type)}</div>
                                        )}
                                        <span className="text-sm line-clamp-1 flex-1">{lesson.title}</span>
                                        <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>

              {/* Lesson Content */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {activeLesson && activeModule ? (
                    <motion.div
                      key={activeLesson.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <CardHeader className="border-b-4 border-black">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="border-2 border-black">
                                {activeLesson.type.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="border-2 border-black">
                                {activeLesson.duration}
                              </Badge>
                              {isLessonCompleted(activeModule.id, activeLesson.id) && (
                                <Badge className="bg-green-500 text-white border-2 border-black">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-2xl">{activeLesson.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {activeModule.title} • Lesson {activeModule.lessons.findIndex(l => l.id === activeLesson.id) + 1} of {activeModule.lessons.length}
                            </p>
                          </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                          {/* Lesson Content */}
                          <div className="prose max-w-none">
                            {activeLesson.content.split('\n\n').map((paragraph, index) => {
                              // Check if paragraph is a code block
                              if (paragraph.includes('```')) {
                                const code = paragraph.replace(/```.*\n/, '').replace(/```/, '');
                                return (
                                  <div key={index} className="my-6">
                                    <Card className="border-2 border-black bg-muted">
                                      <CardContent className="p-4">
                                        <pre className="overflow-x-auto">
                                          <code className="text-sm">{code}</code>
                                        </pre>
                                      </CardContent>
                                    </Card>
                                  </div>
                                );
                              }
                              
                              // Check if it's a heading
                              if (paragraph.startsWith('## ')) {
                                return (
                                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                                    {paragraph.replace('## ', '')}
                                  </h2>
                                );
                              }
                              
                              if (paragraph.startsWith('### ')) {
                                return (
                                  <h3 key={index} className="text-xl font-bold mt-6 mb-3">
                                    {paragraph.replace('### ', '')}
                                  </h3>
                                );
                              }

                              // Regular paragraph
                              return (
                                <p key={index} className="leading-relaxed text-muted-foreground mb-4">
                                  {paragraph}
                                </p>
                              );
                            })}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-6 border-t-4 border-black">
                            <Button
                              variant="outline"
                              onClick={handlePreviousLesson}
                              disabled={
                                course.modules[0].id === currentLesson?.moduleId &&
                                course.modules[0].lessons[0].id === currentLesson?.lessonId
                              }
                              className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <ChevronLeft className="mr-2 h-4 w-4" />
                              Previous
                            </Button>

                            {!isLessonCompleted(currentLesson!.moduleId, currentLesson!.lessonId) && (
                              <Button
                                onClick={handleCompleteLesson}
                                className="bg-green-500 hover:bg-green-600 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              >
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                Mark as Complete
                              </Button>
                            )}

                            <Button
                              onClick={handleNextLesson}
                              disabled={
                                course.modules[course.modules.length - 1].id === currentLesson?.moduleId &&
                                course.modules[course.modules.length - 1].lessons[
                                  course.modules[course.modules.length - 1].lessons.length - 1
                                ].id === currentLesson?.lessonId
                              }
                              className="bg-[#C9B458] hover:bg-[#B8A347] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              Next
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Select a lesson to begin</p>
                      </CardContent>
                    </Card>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle>Course Resources</CardTitle>
                <CardDescription>Download materials, code examples, and additional resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Course Slides (PDF)', size: '2.5 MB', type: 'PDF' },
                  { name: 'Source Code Repository', size: '15 MB', type: 'ZIP' },
                  { name: 'Practice Exercises', size: '1.2 MB', type: 'PDF' },
                  { name: 'Cheat Sheet', size: '500 KB', type: 'PDF' },
                ].map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#C9B458]/10 border-2 border-black flex items-center justify-center">
                        <Download className="h-5 w-5 text-[#C9B458]" />
                      </div>
                      <div>
                        <p className="font-semibold">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">{resource.type} • {resource.size}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-2 border-black">
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Reviews</CardTitle>
                    <CardDescription>{course.reviews} total reviews</CardDescription>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2">
                      <Star className="h-8 w-8 fill-yellow-500 text-yellow-500" />
                      <span className="text-4xl font-bold">{course.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mock Reviews */}
                {[
                  { name: 'Sarah Johnson', rating: 5, date: '2 weeks ago', comment: 'Excellent course! The instructor explains everything clearly and the hands-on projects are really helpful.' },
                  { name: 'Mike Chen', rating: 4, date: '1 month ago', comment: 'Great content and well structured. Would recommend to anyone starting out.' },
                  { name: 'Emily Rodriguez', rating: 5, date: '1 month ago', comment: 'Best course I\'ve taken on this platform. The examples are practical and easy to follow.' },
                ].map((review, index) => (
                  <div key={index} className="p-4 border-2 border-black rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C27BA0] to-[#6DAEDB] flex items-center justify-center text-white font-bold border-2 border-black">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
