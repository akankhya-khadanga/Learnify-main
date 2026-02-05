import { motion, AnimatePresence } from 'framer-motion';
import { Opportunity, AutoApplicationPreview, getAutoApplicationPreview } from '@/mocks/opportunities';
import { X, CheckCircle2, AlertCircle, Clock, TrendingUp, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AutoApplicationModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function AutoApplicationModal({
  opportunity,
  isOpen,
  onClose,
  onSubmit
}: AutoApplicationModalProps) {
  if (!opportunity) return null;

  const preview = getAutoApplicationPreview(opportunity.id);
  if (!preview) return null;

  const availableCount = preview.requiredDocuments.filter(d => d.status === 'available').length;
  const totalCount = preview.requiredDocuments.length;
  const completionRate = (availableCount / totalCount) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-[#0F1115] to-black border-2 border-neon/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-b border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-black text-white">Auto-Apply Preview</h2>
                    </div>
                    <h3 className="text-lg text-gray-300">{opportunity.title}</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Success Probability */}
                <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl p-5 border border-green-500/30 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="font-bold text-white">Success Probability</span>
                    </div>
                    <span className="text-2xl font-black text-green-400">{preview.successProbability}%</span>
                  </div>
                  <Progress value={preview.successProbability} className="h-2" />
                </div>

                {/* Estimated Time */}
                <div className="flex items-center gap-3 mb-6 bg-white/5 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <Clock className="w-5 h-5 text-[#6DAEDB]" />
                  <div>
                    <p className="text-sm text-gray-400">Estimated Completion Time</p>
                    <p className="text-lg font-bold text-white">{preview.estimatedCompletion}</p>
                  </div>
                </div>

                {/* Required Documents */}
                <div className="mb-6">
                  <h4 className="font-black text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Required Documents ({availableCount}/{totalCount})
                  </h4>
                  <div className="space-y-3">
                    {preview.requiredDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${doc.status === 'available'
                            ? 'bg-green-500/10 border-green-500/30'
                            : doc.status === 'missing'
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'bg-yellow-500/10 border-yellow-500/30'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          {doc.status === 'available' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${doc.status === 'missing' ? 'text-red-400' : 'text-yellow-400'
                              }`} />
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-white text-sm">{doc.name}</p>
                            {doc.source && (
                              <p className="text-xs text-gray-400 mt-1">{doc.source}</p>
                            )}
                            {doc.status === 'missing' && (
                              <p className="text-xs text-red-400 mt-1">You'll need to upload this</p>
                            )}
                            {doc.status === 'required' && (
                              <p className="text-xs text-yellow-400 mt-1">Will be created during application</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prefill Data */}
                <div className="mb-6">
                  <h4 className="font-black text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Auto-Filled Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {preview.prefillData.map((field, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                      >
                        <p className="text-xs text-gray-400 mb-1">{field.field}</p>
                        <p className="text-sm font-bold text-white mb-1">{field.value}</p>
                        <p className="text-xs text-primary">From: {field.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-black/50">
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-slate-200 dark:border-slate-700 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onSubmit();
                      onClose();
                    }}
                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Start Auto-Application
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
