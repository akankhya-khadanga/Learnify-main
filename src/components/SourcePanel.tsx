import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerifiedSource } from '@/mocks/verifiedSources';
import { BookOpen, CheckCircle, X, FileText } from 'lucide-react';

interface SourcePanelProps {
  sources: VerifiedSource[];
  isOpen: boolean;
  onClose: () => void;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ sources, isOpen, onClose }) => {
  const activeSources = sources.filter(s => s.active);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-800 border-l-4 border-green-500 shadow-[-8px_0px_0px_0px_rgba(34,197,94,1)] z-50 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b-4 border-green-500 bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-black flex items-center gap-2 text-green-400">
                <BookOpen className="w-5 h-5 text-green-600" />
                Active Sources
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="border-2 border-green-500 hover:bg-green-500/20 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Badge className="bg-green-500 text-white border-2 border-black">
              <CheckCircle className="w-3 h-3 mr-1" />
              No hallucinations detected
            </Badge>
          </div>

          {/* Source List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeSources.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-3 text-black/20" />
                <p className="text-sm text-white/60 font-bold">No active sources</p>
              </div>
            ) : (
              activeSources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 border-green-500 bg-white dark:bg-slate-800 shadow-[3px_3px_0px_0px_rgba(34,197,94,1)] p-3 hover:shadow-[5px_5px_0px_0px_rgba(34,197,94,1)] transition-all">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded bg-green-500 border-2 border-green-600 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm line-clamp-2 mb-1 text-white">
                          {source.title}
                        </h4>

                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                            {source.type.replace('_', ' ')}
                          </Badge>
                          {source.verified && (
                            <Badge className="text-xs bg-green-500 text-white border border-black">
                              Verified
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-white/60">
                          {source.uploadedBy}
                        </p>
                        {source.pageCount && (
                          <p className="text-xs text-white/60">
                            {source.pageCount} pages
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t-4 border-green-500 bg-white dark:bg-slate-800">
            <p className="text-xs text-white/60 text-center">
              {activeSources.length} verified source{activeSources.length !== 1 ? 's' : ''} active
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
