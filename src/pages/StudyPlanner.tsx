import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CalendarDays,
  Upload,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  TrendingUp,
  Target,
  Clock,
  AlertCircle,
  Mail
} from 'lucide-react';
// TODO [Phase 35]: Integrate AI-powered study plan generation
// import { useAIContext } from '@/hooks/useAIContext';
// const aiContext = useAIContext({ contextType: 'planner' });
// Use aiContext.sendMessage() to generate personalized study plans
import ExamCalendar from '@/components/smartPlanner/ExamCalendar';
import StudyClusterView from '@/components/smartPlanner/StudyClusterView';
import WorkloadHeatmap from '@/components/smartPlanner/WorkloadHeatmap';
import ExamImportModal from '@/components/smartPlanner/ExamImportModal';
import MicroDeadlineCard from '@/components/smartPlanner/MicroDeadlineCard';
import { EmailPreferences } from '@/components/smartPlanner/EmailPreferences';
import { useExamCountdown } from '@/hooks/useExamCountdown';
import {
  getMockExamTimetable,
  getMockDailyStudyPlans,
  getMockWorkloadCalendar,
  DailyStudyPlan
} from '@/mocks/studyPlanner';

export default function StudyPlanner() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEmailPreferencesOpen, setIsEmailPreferencesOpen] = useState(false);
  const [hasImportedExams, setHasImportedExams] = useState(true); // Set to true to show mock data

  const { upcomingExams, allCountdowns, nearestExam, hasExamToday, hasExamTomorrow } = useExamCountdown();

  const exams = getMockExamTimetable();
  const dailyPlans = getMockDailyStudyPlans();
  const workloadData = getMockWorkloadCalendar();

  const selectedPlan: DailyStudyPlan | null = selectedDate
    ? dailyPlans.find(plan => plan.date === selectedDate) || null
    : null;

  const handleRegeneratePlan = () => {
    // Mock regeneration - in real app would call AI service
    setSelectedDate(null);
    setTimeout(() => {
      if (dailyPlans.length > 0) {
        setSelectedDate(dailyPlans[0].date);
      }
    }, 500);
  };

  const calculateDaysRemaining = (examDate: string) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diff = exam.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-white pb-24">
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

      <div className="relative z-10 container mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-neon/30 pb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black uppercase mb-4">
                <span className="text-primary">Smart</span>
                <span className="text-accent ml-4">Calendar</span>
              </h1>
              <p className="text-xl text-white/70 font-bold">
                AI-POWERED STUDY PLANNING & EXAM PREPARATION
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsEmailPreferencesOpen(true)}
                variant="outline"
                className="border-slate-200 dark:border-slate-700 hover:bg-white/5 font-semibold"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Notifications
              </Button>
              <Button
                onClick={() => setIsImportModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Exams
              </Button>
              <Button
                onClick={handleRegeneratePlan}
                variant="outline"
                className="border-slate-200 dark:border-slate-700 hover:bg-white/5 font-semibold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        </motion.div>

        {!hasImportedExams ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Calendar className="w-24 h-24 text-gray-500 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-3">No Exam Timetable Yet</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-md text-center">
              Import your exam schedule to generate a personalized study plan with daily tasks
            </p>
            <Button
              onClick={() => setIsImportModalOpen(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-black font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-lg px-8"
            >
              <Upload className="w-5 h-5 mr-3" />
              Import Exam Timetable
            </Button>
          </motion.div>
        ) : (
          <Tabs defaultValue="calendar" className="space-y-8">
            <TabsList className="bg-white/5 border border-slate-200 dark:border-slate-700 p-1">
              <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-black font-semibold">
                <CalendarDays className="w-4 h-4 mr-2" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="clusters" className="data-[state=active]:bg-accent data-[state=active]:text-white font-semibold">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Study Clusters
              </TabsTrigger>
              <TabsTrigger value="workload" className="data-[state=active]:bg-[#6DAEDB] data-[state=active]:text-white font-semibold">
                <TrendingUp className="w-4 h-4 mr-2" />
                Workload Heatmap
              </TabsTrigger>
              <TabsTrigger value="deadlines" className="data-[state=active]:bg-primary data-[state=active]:text-black font-semibold">
                <Target className="w-4 h-4 mr-2" />
                Micro Deadlines
              </TabsTrigger>
            </TabsList>

            {/* Calendar View */}
            <TabsContent value="calendar" className="space-y-6">
              {/* Exam Countdown Banner */}
              {upcomingExams.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-primary/20 via-purple/20 to-primary/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-neon/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Upcoming Exams - Next 7 Days
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {upcomingExams.map((countdown, index) => {
                          const getUrgencyColor = () => {
                            if (countdown.urgencyLevel === 'critical') return 'from-red-500/20 to-red-600/20 border-red-500';
                            if (countdown.urgencyLevel === 'urgent') return 'from-orange-500/20 to-orange-600/20 border-orange-500';
                            if (countdown.urgencyLevel === 'moderate') return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500';
                            return 'from-primary/20 to-accent/20 border-neon';
                          };

                          const getBadgeColor = () => {
                            if (countdown.urgencyLevel === 'critical') return 'bg-red-500';
                            if (countdown.urgencyLevel === 'urgent') return 'bg-orange-500';
                            if (countdown.urgencyLevel === 'moderate') return 'bg-yellow-500';
                            return 'bg-primary';
                          };

                          return (
                            <motion.div
                              key={countdown.exam.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className={`bg-gradient-to-br ${getUrgencyColor()} backdrop-blur-sm rounded-xl p-4 border-2`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-bold text-white text-sm mb-1">
                                    {countdown.exam.exam_name}
                                  </h4>
                                  {countdown.exam.subject && (
                                    <p className="text-xs text-white/70">{countdown.exam.subject}</p>
                                  )}
                                </div>
                                <div className={`${getBadgeColor()} ${countdown.urgencyLevel === 'critical' ? 'animate-pulse' : ''} px-2 py-1 rounded-lg`}>
                                  <span className="text-white font-black text-lg">
                                    {countdown.daysLeft}
                                  </span>
                                  <span className="text-white text-xs ml-1">
                                    {countdown.daysLeft === 1 ? 'day' : 'days'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-white/90 text-xs font-medium">{countdown.message}</p>
                              <div className="mt-2 text-xs text-white/60">
                                📅 {new Date(countdown.exam.exam_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                                {countdown.exam.exam_time && ` • ⏰ ${countdown.exam.exam_time}`}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ExamCalendar
                    exams={exams}
                    onDateSelect={setSelectedDate}
                    selectedDate={selectedDate}
                  />
                </div>
                <div>
                  {selectedDate && selectedPlan ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-white">Daily Summary</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">DATE</div>
                          <div className="text-xl font-bold text-white">
                            {new Date(selectedPlan.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">TOTAL WORKLOAD</div>
                          <div className="text-3xl font-black text-accent">
                            {selectedPlan.totalWorkload}h
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-2">SUBJECTS TODAY</div>
                          {selectedPlan.subjects.map((subject, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-white/5"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: subject.color }}
                              />
                              <span className="text-sm text-white font-medium flex-1">
                                {subject.subject}
                              </span>
                              <span className="text-xs text-gray-400">{subject.totalHours}h</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-12 border border-slate-200 dark:border-slate-700 text-center">
                      <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">Select a date to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Study Clusters View */}
            <TabsContent value="clusters">
              <StudyClusterView dailyPlan={selectedPlan} />
            </TabsContent>

            {/* Workload Heatmap */}
            <TabsContent value="workload">
              <WorkloadHeatmap workloadData={workloadData} />
            </TabsContent>

            {/* Micro Deadlines */}
            <TabsContent value="deadlines">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MicroDeadlineCard
                      exam={exam}
                      daysRemaining={calculateDaysRemaining(exam.date)}
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Email Preferences Modal */}
      <EmailPreferences
        isOpen={isEmailPreferencesOpen}
        onClose={() => setIsEmailPreferencesOpen(false)}
      />

      {/* Import Modal */}
      <ExamImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={() => setHasImportedExams(true)}
      />
    </div>
  );
}

