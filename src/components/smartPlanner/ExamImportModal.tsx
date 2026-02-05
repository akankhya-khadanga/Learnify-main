import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Calendar, Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { examNotificationService } from '@/services/examNotificationService';
import type { CreateExamPayload } from '@/types/examNotifications';
import { useToast } from '@/hooks/use-toast';

interface ExamImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}

export default function ExamImportModal({ isOpen, onClose, onImport }: ExamImportModalProps) {
  const [manualExams, setManualExams] = useState([
    { subject: '', date: '', time: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const addExamRow = () => {
    setManualExams([...manualExams, { subject: '', date: '', time: '' }]);
  };

  const removeExamRow = (index: number) => {
    setManualExams(manualExams.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    // Validate exams
    const validExams = manualExams.filter(exam => exam.subject && exam.date);

    if (validExams.length === 0) {
      toast({
        title: "No valid exams",
        description: "Please enter at least one exam with subject and date",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert to API payload format
      const examPayloads: CreateExamPayload[] = validExams.map(exam => ({
        exam_name: exam.subject,
        exam_date: exam.date,
        exam_time: exam.time || undefined,
        subject: exam.subject,
        importance: 'medium',
        color: '#C9B458',
      }));

      // Save to database
      const createdExams = await examNotificationService.createExamsBulk(examPayloads);

      if (createdExams.length > 0) {
        toast({
          title: "✅ Exams imported successfully!",
          description: `${createdExams.length} exam(s) added to your schedule`,
        });

        // Call parent onImport callback
        onImport();

        // Reset form
        setManualExams([{ subject: '', date: '', time: '' }]);

        // Close modal
        onClose();
      } else {
        throw new Error('Failed to create exams');
      }
    } catch (error) {
      console.error('[ExamImportModal] Error importing exams:', error);
      toast({
        title: "Import failed",
        description: "Failed to save exams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-[#0F1115] to-[#151823] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-white">Import Exam Timetable</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Upload Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Timetable</h3>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-neon/50 transition-colors cursor-pointer group">
              <Upload className="w-12 h-12 text-gray-400 group-hover:text-primary mx-auto mb-3 transition-colors" />
              <p className="text-white font-semibold mb-1">Drop your timetable here</p>
              <p className="text-sm text-gray-400">Supports PDF, Image, or Excel files</p>
              <input type="file" className="hidden" accept=".pdf,.png,.jpg,.xlsx,.csv" />
            </div>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0F1115] px-4 text-gray-400 font-semibold">Or enter manually</span>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Manual Entry</h3>
              <Button
                onClick={addExamRow}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Exam
              </Button>
            </div>

            {manualExams.map((exam, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 p-4 bg-white/5 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="col-span-5">
                  <Label className="text-xs text-gray-400 mb-2 block">Subject</Label>
                  <Input
                    placeholder="e.g., Mathematics"
                    value={exam.subject}
                    onChange={(e) => {
                      const updated = [...manualExams];
                      updated[index].subject = e.target.value;
                      setManualExams(updated);
                    }}
                    className="bg-black/30 border-slate-200 dark:border-slate-700 text-white"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs text-gray-400 mb-2 block">Date</Label>
                  <Input
                    type="date"
                    value={exam.date}
                    onChange={(e) => {
                      const updated = [...manualExams];
                      updated[index].date = e.target.value;
                      setManualExams(updated);
                    }}
                    className="bg-black/30 border-slate-200 dark:border-slate-700 text-white"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs text-gray-400 mb-2 block">Time</Label>
                  <Input
                    type="time"
                    value={exam.time}
                    onChange={(e) => {
                      const updated = [...manualExams];
                      updated[index].time = e.target.value;
                      setManualExams(updated);
                    }}
                    className="bg-black/30 border-slate-200 dark:border-slate-700 text-white"
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  {manualExams.length > 1 && (
                    <button
                      onClick={() => removeExamRow(index)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white/5 flex items-center justify-between">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving exams...
              </>
            ) : (
              "Enter your exam schedule to enable countdown notifications"
            )}
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 hover:bg-white/5"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import & Generate Plan'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
