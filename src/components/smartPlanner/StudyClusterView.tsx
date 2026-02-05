import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, BookOpen, Clock, CheckCircle2, Circle } from 'lucide-react';
import { DailyStudyPlan } from '@/mocks/studyPlanner';
import { Progress } from '@/components/ui/progress';

interface StudyClusterViewProps {
  dailyPlan: DailyStudyPlan | null;
}

export default function StudyClusterView({ dailyPlan }: StudyClusterViewProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  if (!dailyPlan) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-12 border border-slate-200 dark:border-slate-700 text-center">
        <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-400">Select a date to view study plan</p>
      </div>
    );
  }

  const toggleSubject = (subject: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject);
    } else {
      newExpanded.add(subject);
    }
    setExpandedSubjects(newExpanded);
  };

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {new Date(dailyPlan.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <p className="text-lg text-gray-300">
              {dailyPlan.subjects.length} subjects · {dailyPlan.totalWorkload} hours total
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-primary">
              {dailyPlan.totalWorkload}h
            </div>
            <div className="text-sm text-gray-400 font-semibold">WORKLOAD</div>
          </div>
        </div>
      </div>

      {/* Subjects */}
      {dailyPlan.subjects.map((subjectData, subjectIndex) => (
        <motion.div
          key={subjectData.subject}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: subjectIndex * 0.1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Subject Header */}
          <button
            onClick={() => toggleSubject(subjectData.subject)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: subjectData.color }}
              />
              <div className="text-left">
                <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {subjectData.subject}
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  {subjectData.chapters.length} chapters · {subjectData.totalHours}h
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Progress
                value={33}
                className="w-24 h-2"
              />
              <motion.div
                animate={{ rotate: expandedSubjects.has(subjectData.subject) ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </motion.div>
            </div>
          </button>

          {/* Chapters */}
          <AnimatePresence>
            {expandedSubjects.has(subjectData.subject) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 space-y-3">
                  {subjectData.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="bg-white/5 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                      {/* Chapter Header */}
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5" style={{ color: subjectData.color }} />
                          <div className="text-left">
                            <p className="font-semibold text-white">{chapter.name}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {chapter.topics.length} topics · {chapter.totalHours}h
                            </p>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedChapters.has(chapter.id) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </button>

                      {/* Topics */}
                      <AnimatePresence>
                        {expandedChapters.has(chapter.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 space-y-2">
                              {chapter.topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="bg-black/30 rounded-lg border border-white/5"
                                >
                                  {/* Topic Header */}
                                  <button
                                    onClick={() => toggleTopic(topic.id)}
                                    className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-2">
                                        {topic.completed ? (
                                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-500" />
                                        )}
                                        <p className="text-sm font-medium text-white">{topic.name}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{topic.estimatedHours}h</span>
                                      </div>
                                      <motion.div
                                        animate={{ rotate: expandedTopics.has(topic.id) ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                      </motion.div>
                                    </div>
                                  </button>

                                  {/* Sub-tasks */}
                                  <AnimatePresence>
                                    {expandedTopics.has(topic.id) && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="px-3 pb-2 space-y-1">
                                          {topic.subTasks.map((task, taskIndex) => {
                                            const taskId = `${topic.id}-task-${taskIndex}`;
                                            const isCompleted = completedTasks.has(taskId);

                                            return (
                                              <button
                                                key={taskIndex}
                                                onClick={() => toggleTask(taskId)}
                                                className="w-full flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors group"
                                              >
                                                {isCompleted ? (
                                                  <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                                                ) : (
                                                  <Circle className="w-3 h-3 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                                                )}
                                                <span className={`text-xs ${isCompleted ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                                  {task}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
