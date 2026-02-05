import { motion } from 'framer-motion';
import { ShieldCheck, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CourseInfo } from '@/mocks/verifiedSources';

interface VerificationBannerProps {
  course: CourseInfo;
  mode: 'verified' | 'general';
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ course, mode }) => {
  if (mode !== 'verified') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="bg-white dark:bg-slate-800 border-4 border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 border-2 border-green-500 rounded-full">
            <BookOpen className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-white">{course.name}</h3>
              <Badge className="bg-green-500 text-white border-2 border-black font-black text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
            <p className="text-xs text-white/70 font-bold">
              Instructor: {course.instructor} • Answers sourced from verified course materials
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
