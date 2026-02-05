import { useState } from 'react';
import { motion } from 'framer-motion';
import { StudentTierProfile, TIER_COLORS, StudentTier } from '@/mocks/performanceTiers';
import { AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import StudentTierCard from './StudentTierCard';

interface TeacherMonitoringPanelProps {
  students: StudentTierProfile[];
  onStudentClick?: (student: StudentTierProfile) => void;
}

export default function TeacherMonitoringPanel({
  students,
  onStudentClick
}: TeacherMonitoringPanelProps) {
  const [selectedTier, setSelectedTier] = useState<StudentTier | 'ALL'>('ALL');
  const [showWarningsOnly, setShowWarningsOnly] = useState(false);

  const filteredStudents = students.filter(student => {
    const tierMatch = selectedTier === 'ALL' || student.currentTier === selectedTier;
    const warningMatch = !showWarningsOnly || student.warnings.some(w => !w.resolved);
    return tierMatch && warningMatch;
  });

  const warningCount = students.filter(s =>
    s.warnings.some(w => !w.resolved)
  ).length;

  const tiers: Array<StudentTier | 'ALL'> = ['ALL', 'BEST', 'MEDIUM', 'WORST'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400 mr-2">Tier:</span>
            <div className="flex gap-2">
              {tiers.map(tier => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedTier === tier
                      ? 'bg-[#C9B458] text-black'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Warning Toggle */}
          <button
            onClick={() => setShowWarningsOnly(!showWarningsOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              showWarningsOnly
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/10 text-gray-400 border border-white/10 hover:bg-white/20'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Warnings ({warningCount})
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StudentTierCard
              student={student}
              onClick={() => onStudentClick?.(student)}
            />
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-12 border border-white/10 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-400">
            {showWarningsOnly
              ? 'No students with warnings in this tier'
              : 'No students found in this tier'}
          </p>
        </div>
      )}
    </div>
  );
}
