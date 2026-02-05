import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TierOverviewCard from '@/components/performance/TierOverviewCard';
import StudentTierCard from '@/components/performance/StudentTierCard';
import TierActivityTimeline from '@/components/performance/TierActivityTimeline';
import TeacherMonitoringPanel from '@/components/performance/TeacherMonitoringPanel';
import ImprovementTracker from '@/components/performance/ImprovementTracker';
import {
  performanceTiers,
  getStudentsByTier,
  getTierStatistics,
  StudentTierProfile
} from '@/mocks/performanceTiers';

type ViewMode = 'overview' | 'monitoring' | 'student-detail';

export default function PerformanceTiers() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedStudent, setSelectedStudent] = useState<StudentTierProfile | null>(null);

  const bestTierStats = getTierStatistics('BEST');
  const mediumTierStats = getTierStatistics('MEDIUM');
  const worstTierStats = getTierStatistics('WORST');

  const handleStudentClick = (student: StudentTierProfile) => {
    setSelectedStudent(student);
    setViewMode('student-detail');
  };

  const handleBackClick = () => {
    if (viewMode === 'student-detail') {
      setViewMode('monitoring');
      setSelectedStudent(null);
    } else if (viewMode === 'monitoring') {
      setViewMode('overview');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800">
      {/* Header */}
      <div className="border-b-4 border-black bg-white dark:bg-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleBackClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 border-2 border-neon bg-primary/20 hover:bg-primary hover:text-black transition-colors text-primary"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-3xl font-black uppercase">
                <span className="text-primary">Performance</span>{' '}
                <span className="text-accent">Tiers</span>
              </h1>
              <p className="text-sm text-white/70 mt-1 font-bold">
                {viewMode === 'overview' && 'Track student performance across tiers'}
                {viewMode === 'monitoring' && 'Monitor all students by tier'}
                {viewMode === 'student-detail' && selectedStudent?.name}
              </p>
            </div>
            {viewMode !== 'student-detail' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-2 text-sm font-black transition-all border-2 ${viewMode === 'overview'
                    ? 'bg-primary text-black border-black shadow-primary'
                    : 'bg-black/50 text-white/70 border-neon/30 hover:bg-primary/20 hover:text-primary'
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('monitoring')}
                  className={`px-4 py-2 text-sm font-black transition-all border-2 ${viewMode === 'monitoring'
                    ? 'bg-primary text-black border-black shadow-primary'
                    : 'bg-black/50 text-white/70 border-neon/30 hover:bg-primary/20 hover:text-primary'
                    }`}
                >
                  Monitoring
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Tier Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TierOverviewCard tier="BEST" statistics={bestTierStats} />
              <TierOverviewCard tier="MEDIUM" statistics={mediumTierStats} />
              <TierOverviewCard tier="WORST" statistics={worstTierStats} />
            </div>

            {/* Best Tier Students Spotlight */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-black uppercase text-primary">Top Performers</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getStudentsByTier('BEST').map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StudentTierCard
                      student={student}
                      onClick={() => handleStudentClick(student)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Students Needing Support */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-black uppercase text-accent">Students Needing Support</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getStudentsByTier('WORST').map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StudentTierCard
                      student={student}
                      onClick={() => handleStudentClick(student)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'monitoring' && (
          <TeacherMonitoringPanel
            students={performanceTiers.students}
            onStudentClick={handleStudentClick}
          />
        )}

        {viewMode === 'student-detail' && selectedStudent && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ImprovementTracker student={selectedStudent} />
            </div>
            <div>
              <TierActivityTimeline history={selectedStudent.tierHistory} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
