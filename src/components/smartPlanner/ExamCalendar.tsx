import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { ExamEntry } from '@/mocks/studyPlanner';
import { useExamCountdown } from '@/hooks/useExamCountdown';
import { ExamSchedule } from '@/types/examNotifications';

interface ExamCalendarProps {
  exams: ExamEntry[];
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

export default function ExamCalendar({ exams, onDateSelect, selectedDate }: ExamCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { allExams: dbExams } = useExamCountdown();

  // Merge database exams with mock exams (database exams take priority)
  const [mergedExams, setMergedExams] = useState<ExamEntry[]>(exams);

  useEffect(() => {
    if (dbExams && dbExams.length > 0) {
      // Convert database exams to ExamEntry format and merge
      const convertedDbExams: ExamEntry[] = dbExams.map((exam, index) => ({
        id: exam.id || `db-${index}`,
        subject: exam.subject || exam.exam_name,
        date: exam.exam_date,
        time: exam.exam_time || '',
        duration: exam.duration_minutes || 0,
        location: exam.location || '',
        color: exam.color || '#C9B458',
        topics: exam.topics || [],
        importance: 'high' as const,
      }));

      // Combine with mock exams, prioritizing database exams
      const combined: ExamEntry[] = [...convertedDbExams, ...exams.filter(
        mockExam => !dbExams.some(dbExam => dbExam.exam_date === mockExam.date)
      )];

      setMergedExams(combined);
    } else {
      setMergedExams(exams);
    }
  }, [dbExams, exams]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const getExamForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mergedExams.find(exam => exam.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold text-white">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-bold text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const exam = getExamForDate(day);
          const today = isToday(day);
          const selected = isSelected(day);
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          return (
            <motion.button
              key={day}
              onClick={() => onDateSelect(dateStr)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                aspect-square rounded-xl p-2 relative transition-all
                ${exam ? 'border-2' : 'border border-slate-200 dark:border-slate-700'}
                ${today ? 'ring-2 ring-neon ring-offset-2 ring-offset-[#0F1115]' : ''}
                ${selected ? 'bg-white/20' : 'bg-white/5'}
                ${exam ? `hover:shadow-lg` : 'hover:bg-white/10'}
              `}
              style={{
                borderColor: exam ? exam.color : undefined,
                boxShadow: exam ? `0 0 20px ${exam.color}40` : undefined,
              }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className={`text-sm font-bold ${exam ? 'text-white' : 'text-gray-300'}`}>
                  {day}
                </span>
                {exam && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: exam.color }}
                    />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-gray-400 mb-3 font-semibold">EXAM SUBJECTS</p>
        <div className="flex flex-wrap gap-2">
          {mergedExams.map((exam, index) => (
            <div
              key={exam.id || `exam-${index}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-slate-200 dark:border-slate-700"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: exam.color || '#C9B458' }}
              />
              <span className="text-xs font-medium text-white">
                {exam.subject}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
