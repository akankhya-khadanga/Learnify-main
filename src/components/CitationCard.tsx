import React from 'react';
import { Card } from '@/components/ui/card';
import { Citation } from '@/mocks/verifiedSources';
import { FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface CitationCardProps {
  citation: Citation;
  onClick?: () => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={onClick}
        className="border-4 border-[#C9B458] bg-obsidian shadow-[3px_3px_0px_0px_rgba(201,180,88,1)] hover:shadow-[5px_5px_0px_0px_rgba(201,180,88,1)] transition-all cursor-pointer p-3"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-black flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-sm text-white line-clamp-1">
                {citation.sourceTitle}
              </h4>
              <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded border-2 border-black text-xs font-black">
                {citation.confidence}%
              </div>
            </div>

            {(citation.page || citation.section) && (
              <p className="text-xs text-white/70 font-bold mt-1">
                {citation.page && `Page ${citation.page}`}
                {citation.page && citation.section && ' • '}
                {citation.section}
              </p>
            )}

            {citation.quote && (
              <p className="text-xs text-white/80 mt-2 italic line-clamp-2 border-l-2 border-green-500 pl-2">
                "{citation.quote}"
              </p>
            )}

            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-green-400">
              <ExternalLink className="w-3 h-3" />
              <span>Click to see reasoning</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
